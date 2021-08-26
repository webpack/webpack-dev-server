"use strict";

const path = require("path");
const express = require("express");
// const bodyParser = require("body-parser");
// const WebSocket = require("ws");
const webpack = require("webpack");
const runBrowser = require("../helpers/run-browser");
const Server = require("../../lib/Server");
const config = require("../fixtures/proxy-config/webpack.config");
const [port1, port2, port3] = require("../ports-map")["proxy-option"];

// const WebSocketServer = WebSocket.Server;
const staticDirectory = path.resolve(__dirname, "../fixtures/proxy-config");

const proxyOptionPathsAsProperties = {
  "/proxy1": {
    target: `http://localhost:${port1}`,
  },
  "/api/proxy2": {
    target: `http://localhost:${port2}`,
    pathRewrite: { "^/api": "" },
  },
  "/foo": {
    bypass(req) {
      if (/\.html$/.test(req.path)) {
        return "/index.html";
      }

      return null;
    },
  },
  "/proxyfalse": {
    bypass(req) {
      if (/\/proxyfalse$/.test(req.path)) {
        return false;
      }
    },
  },
  "/proxy/async": {
    bypass(req, res) {
      if (/\/proxy\/async$/.test(req.path)) {
        return new Promise((resolve) => {
          setTimeout(() => {
            res.end("proxy async response");
            resolve(true);
          }, 10);
        });
      }
    },
  },
  "/bypass-with-target": {
    target: `http://localhost:${port1}`,
    changeOrigin: true,
    secure: false,
    bypass(req) {
      if (/\.(html)$/i.test(req.url)) {
        return req.url;
      }
    },
  },
};

const proxyOption = {
  context: () => true,
  target: `http://localhost:${port1}`,
};

const proxyOptionOfArray = [
  { context: "/proxy1", target: proxyOption.target },
  function proxy(req, res, next) {
    return {
      context: "/api/proxy2",
      target: `http://localhost:${port2}`,
      pathRewrite: { "^/api": "" },
      bypass: () => {
        if (req && req.query.foo) {
          res.end(`foo+${next.name}+${typeof next}`);

          return false;
        }
      },
    };
  },
];

const proxyOptionOfArrayWithoutTarget = [
  {
    router: () => `http://localhost:${port1}`,
  },
];

const proxyWithPath = {
  "/proxy1": {
    path: `http://localhost:${port1}`,
    target: `http://localhost:${port1}`,
  },
};

const proxyWithString = {
  "/proxy1": `http://localhost:${port1}`,
};

const proxyWithRouterAsObject = {
  router: () => `http://localhost:${port1}`,
};

describe("proxy option", () => {
  let proxyServer1;
  let proxyServer2;

  async function listenProxyServers() {
    const proxyApp1 = express();
    const proxyApp2 = express();

    proxyApp1.get("/proxy1", (req, res) => {
      res.send("from proxy1");
    });
    proxyApp1.get("/api", (req, res) => {
      res.send("api response from proxy1");
    });
    proxyApp2.get("/proxy2", (req, res) => {
      res.send("from proxy2");
    });

    await new Promise((resolve) => {
      proxyServer1 = proxyApp1.listen(port1, () => {
        resolve();
      });
    });

    await new Promise((resolve) => {
      proxyServer2 = proxyApp2.listen(port2, () => {
        resolve();
      });
    });
  }

  async function closeProxyServers() {
    await new Promise((resolve) => {
      proxyServer1.close(() => {
        resolve();
      });
    });

    await new Promise((resolve) => {
      proxyServer2.close(() => {
        resolve();
      });
    });
  }

  describe("as an object of paths with properties", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: staticDirectory,
            watch: false,
          },
          proxy: proxyOptionPathsAsProperties,
          port: port3,
        },
        compiler
      );

      await server.start();

      await listenProxyServers();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
      await closeProxyServers();
    });

    describe("target", () => {
      it("respects a proxy option when a request path is matched", async () => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`http://localhost:${port3}/proxy1`, {
          waitUntil: "networkidle0",
        });

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });
    });

    describe("pathRewrite", () => {
      it("respects a pathRewrite option", async () => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(
          `http://localhost:${port3}/api/proxy2`,
          {
            waitUntil: "networkidle0",
          }
        );

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });
    });

    describe("byPass", () => {
      it("can rewrite a request path", async () => {
        pageErrors = [];
        consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(
          `http://localhost:${port3}/foo/bar.html`,
          {
            waitUntil: "networkidle0",
          }
        );

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });

      it("can rewrite a request path regardless of the target defined a bypass option", async () => {
        pageErrors = [];
        consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(
          `http://localhost:${port3}/baz/hoge.html`,
          {
            waitUntil: "networkidle0",
          }
        );

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });

      it("should pass through a proxy when a bypass function returns null", async () => {
        pageErrors = [];
        consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`http://localhost:${port3}/foo.js`, {
          waitUntil: "networkidle0",
        });

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });

      it("should not pass through a proxy when a bypass function returns false", async () => {
        pageErrors = [];
        consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(
          `http://localhost:${port3}/proxyfalse`,
          {
            waitUntil: "networkidle0",
          }
        );

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });

      it("should wait if bypass returns promise", async () => {
        pageErrors = [];
        consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(
          `http://localhost:${port3}/proxy/async`,
          {
            waitUntil: "networkidle0",
          }
        );

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });

      it("should work with the 'target' option", async () => {
        pageErrors = [];
        consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(
          `http://localhost:${port3}/bypass-with-target/foo.js`,
          {
            waitUntil: "networkidle0",
          }
        );

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });

      it("should work with the 'target' option #2", async () => {
        pageErrors = [];
        consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(
          `http://localhost:${port3}/bypass-with-target/index.html`,
          {
            waitUntil: "networkidle0",
          }
        );

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });
    });
  });

  describe("as an option is an object with the `context` option", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          proxy: proxyOption,
          port: port3,
        },
        compiler
      );

      await server.start();

      await listenProxyServers();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
      await closeProxyServers();
    });

    it("respects a proxy option", async () => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port3}/proxy1`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(await response.text()).toMatchSnapshot("response text");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
    });
  });

  describe("as an option is an object with `context` and `target` as string", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          proxy: proxyWithString,
          port: port3,
        },
        compiler
      );

      await server.start();

      await listenProxyServers();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
      await closeProxyServers();
    });

    it("respects a proxy option", async () => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port3}/proxy1`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(await response.text()).toMatchSnapshot("response text");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
    });
  });

  describe("as an option is an object with the `path` option (`context` alias)", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          proxy: proxyWithPath,
          port: port3,
        },
        compiler
      );

      await server.start();

      await listenProxyServers();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
      await closeProxyServers();
    });

    it("respects a proxy option", async () => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port3}/proxy1`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(await response.text()).toMatchSnapshot("response text");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
    });
  });

  describe("as an option is an object with the `router` option", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          proxy: proxyWithRouterAsObject,
          port: port3,
        },
        compiler
      );

      await server.start();

      await listenProxyServers();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
      await closeProxyServers();
    });

    it("respects a proxy option", async () => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port3}/proxy1`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(await response.text()).toMatchSnapshot("response text");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
    });
  });

  describe("as an array", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          proxy: proxyOptionOfArray,
          port: port3,
        },
        compiler
      );

      await server.start();

      await listenProxyServers();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
      await closeProxyServers();
    });

    it("respects a proxy option", async () => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port3}/proxy1`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(await response.text()).toMatchSnapshot("response text");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
    });

    it("respects a proxy option of function", async () => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port3}/api/proxy2`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(await response.text()).toMatchSnapshot("response text");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
    });

    it("should allow req, res, and next", async () => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://localhost:${port3}/api/proxy2?foo=true`,
        {
          waitUntil: "networkidle0",
        }
      );

      expect(response.status()).toMatchSnapshot("response status");

      expect(await response.text()).toMatchSnapshot("response text");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
    });
  });

  describe("as an array without the `route` option", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          proxy: proxyOptionOfArrayWithoutTarget,
          port: port3,
        },
        compiler
      );

      await server.start();

      await listenProxyServers();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
      await closeProxyServers();
    });

    it("respects a proxy option", async () => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port3}/proxy1`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(await response.text()).toMatchSnapshot("response text");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
    });
  });

  describe("should sharing a proxy option", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;
    let listener;

    const proxyTarget = {
      target: `http://localhost:${port1}`,
    };

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          proxy: {
            "/proxy1": proxyTarget,
            "/proxy2": proxyTarget,
          },
          port: port3,
        },
        compiler
      );

      await server.start();

      const proxy = express();

      proxy.get("*", (proxyReq, res) => {
        res.send("from proxy");
      });

      listener = proxy.listen(port1);

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
      await new Promise((resolve) => {
        listener.close(() => {
          resolve();
        });
      });
    });

    it("respects proxy1 option", async () => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port3}/proxy1`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(await response.text()).toMatchSnapshot("response text");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
    });

    it("respects proxy2 option", async () => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port3}/proxy2`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(await response.text()).toMatchSnapshot("response text");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
    });
  });
});
