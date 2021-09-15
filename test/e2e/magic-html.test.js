"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const multiCompilerConfig = require("../fixtures/multi-compiler-one-configuration/webpack.config");
const runBrowser = require("../helpers/run-browser");
const isWebpack5 = require("../helpers/isWebpack5");
const port = require("../ports-map")["magic-html-option"];

const webpack5Test = isWebpack5 ? describe : describe.skip;

describe("magicHtml option", () => {
  describe("enabled", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    describe("filename bundle.js", () => {
      beforeEach(async () => {
        compiler = webpack({
          ...config,
          output: {
            path: "/",
            filename: "bundle.js",
          },
        });
        server = new Server({ port, magicHtml: true }, compiler);

        await server.start();

        ({ page, browser } = await runBrowser());

        pageErrors = [];
        consoleMessages = [];
      });

      afterEach(async () => {
        await browser.close();
        await server.stop();
      });

      it("should handle GET request to magic async html (/bundle)", async () => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`http://127.0.0.1:${port}/bundle`, {
          waitUntil: "networkidle0",
        });

        expect(response.headers()["content-type"]).toMatchSnapshot(
          "response headers content-type"
        );

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });

      it("should handle HEAD request to magic async html (/bundle)", async () => {
        await page.setRequestInterception(true);

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          })
          .on("request", (interceptedRequest) => {
            interceptedRequest.continue({ method: "HEAD" });
          });

        const response = await page.goto(`http://127.0.0.1:${port}/bundle`, {
          waitUntil: "networkidle0",
        });

        expect(response.headers()["content-type"]).toMatchSnapshot(
          "response headers content-type"
        );

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });
    });

    describe("filename bundle.other.js", () => {
      beforeEach(async () => {
        compiler = webpack({
          ...config,
          output: {
            path: "/",
            filename: "bundle.other.js",
          },
        });
        server = new Server({ port, magicHtml: true }, compiler);

        await server.start();

        ({ page, browser } = await runBrowser());

        pageErrors = [];
        consoleMessages = [];
      });

      afterEach(async () => {
        await browser.close();
        await server.stop();
      });

      it("should handle GET request to magic async html (/bundle.other)", async () => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(
          `http://127.0.0.1:${port}/bundle.other`,
          {
            waitUntil: "networkidle0",
          }
        );

        expect(response.headers()["content-type"]).toMatchSnapshot(
          "response headers content-type"
        );

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });

      it("should not handle GET request to /bundle", async () => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`http://127.0.0.1:${port}/bundle`, {
          waitUntil: "networkidle0",
        });

        expect(response.headers()["content-type"]).toMatchSnapshot(
          "response headers content-type"
        );

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });

      it("should handle HEAD request to magic async html (/bundle.other)", async () => {
        await page.setRequestInterception(true);

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          })
          .on("request", (interceptedRequest) => {
            interceptedRequest.continue({ method: "HEAD" });
          });

        const response = await page.goto(
          `http://127.0.0.1:${port}/bundle.other`,
          {
            waitUntil: "networkidle0",
          }
        );

        expect(response.headers()["content-type"]).toMatchSnapshot(
          "response headers content-type"
        );

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });
    });

    describe("multi compiler mode", () => {
      beforeEach(async () => {
        compiler = webpack(multiCompilerConfig);
        server = new Server({ port, magicHtml: true }, compiler);

        await server.start();

        ({ page, browser } = await runBrowser());

        pageErrors = [];
        consoleMessages = [];
      });

      afterEach(async () => {
        await browser.close();
        await server.stop();
      });

      it("should handle GET request to magic async html (/main)", async () => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`http://127.0.0.1:${port}/main`, {
          waitUntil: "networkidle0",
        });

        expect(response.headers()["content-type"]).toMatchSnapshot(
          "response headers content-type"
        );

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });

      it("should handle HEAD request to magic async html (/main)", async () => {
        await page.setRequestInterception(true);

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          })
          .on("request", (interceptedRequest) => {
            interceptedRequest.continue({ method: "HEAD" });
          });

        const response = await page.goto(`http://127.0.0.1:${port}/main`, {
          waitUntil: "networkidle0",
        });

        expect(response.headers()["content-type"]).toMatchSnapshot(
          "response headers content-type"
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

  webpack5Test("enabled with experiments.outputModule: true", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack({
        ...config,
        experiments: {
          outputModule: true,
        },
      });
      server = new Server({ port, magicHtml: true }, compiler);

      await server.start();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
    });

    it("should handle GET request to magic async html (/main)", async () => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/main`, {
        waitUntil: "networkidle0",
      });

      expect(response.headers()["content-type"]).toMatchSnapshot(
        "response headers content-type"
      );

      expect(response.status()).toMatchSnapshot("response status");

      expect(await response.text()).toMatchSnapshot("response text");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
    });

    it("should handle HEAD request to magic async html (/main)", async () => {
      await page.setRequestInterception(true);

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        })
        .on("request", (interceptedRequest) => {
          interceptedRequest.continue({ method: "HEAD" });
        });

      const response = await page.goto(`http://127.0.0.1:${port}/main`, {
        waitUntil: "networkidle0",
      });

      expect(response.headers()["content-type"]).toMatchSnapshot(
        "response headers content-type"
      );

      expect(response.status()).toMatchSnapshot("response status");

      expect(await response.text()).toMatchSnapshot("response text");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
    });
  });

  webpack5Test(
    "enabled with experiments.outputModule: true in multi compiler mode",
    () => {
      let compiler;
      let server;
      let page;
      let browser;
      let pageErrors;
      let consoleMessages;

      beforeEach(async () => {
        compiler = webpack([
          {
            ...multiCompilerConfig[0],
            experiments: {
              outputModule: true,
            },
          },
        ]);
        server = new Server({ port, magicHtml: true }, compiler);

        await server.start();

        ({ page, browser } = await runBrowser());

        pageErrors = [];
        consoleMessages = [];
      });

      afterEach(async () => {
        await browser.close();
        await server.stop();
      });

      it("should handle GET request to magic async html (/main)", async () => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`http://127.0.0.1:${port}/main`, {
          waitUntil: "networkidle0",
        });

        expect(response.headers()["content-type"]).toMatchSnapshot(
          "response headers content-type"
        );

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });

      it("should handle HEAD request to magic async html (/main)", async () => {
        await page.setRequestInterception(true);

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          })
          .on("request", (interceptedRequest) => {
            interceptedRequest.continue({ method: "HEAD" });
          });

        const response = await page.goto(`http://127.0.0.1:${port}/main`, {
          waitUntil: "networkidle0",
        });

        expect(response.headers()["content-type"]).toMatchSnapshot(
          "response headers content-type"
        );

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });
    }
  );

  webpack5Test(
    "enabled with experiments.outputModule: true and .js extension",
    () => {
      let compiler;
      let server;
      let page;
      let browser;
      let pageErrors;
      let consoleMessages;

      describe("filename bundle.js", () => {
        beforeEach(async () => {
          compiler = webpack({
            ...config,
            output: {
              path: "/",
              filename: "bundle.js",
            },
            experiments: {
              outputModule: true,
            },
          });
          server = new Server({ port, magicHtml: true }, compiler);

          await server.start();

          ({ page, browser } = await runBrowser());

          pageErrors = [];
          consoleMessages = [];
        });

        afterEach(async () => {
          await browser.close();
          await server.stop();
        });

        it("should handle GET request to magic async html (/bundle)", async () => {
          page
            .on("console", (message) => {
              consoleMessages.push(message);
            })
            .on("pageerror", (error) => {
              pageErrors.push(error);
            });

          const response = await page.goto(`http://127.0.0.1:${port}/bundle`, {
            waitUntil: "networkidle0",
          });

          expect(response.headers()["content-type"]).toMatchSnapshot(
            "response headers content-type"
          );

          expect(response.status()).toMatchSnapshot("response status");

          expect(await response.text()).toMatchSnapshot("response text");

          expect(
            consoleMessages.map((message) => message.text())
          ).toMatchSnapshot("console messages");

          expect(pageErrors).toMatchSnapshot("page errors");
        });

        it("should handle HEAD request to magic async html (/bundle)", async () => {
          await page.setRequestInterception(true);

          page
            .on("console", (message) => {
              consoleMessages.push(message);
            })
            .on("pageerror", (error) => {
              pageErrors.push(error);
            })
            .on("request", (interceptedRequest) => {
              interceptedRequest.continue({ method: "HEAD" });
            });

          const response = await page.goto(`http://127.0.0.1:${port}/bundle`, {
            waitUntil: "networkidle0",
          });

          expect(response.headers()["content-type"]).toMatchSnapshot(
            "response headers content-type"
          );

          expect(response.status()).toMatchSnapshot("response status");

          expect(await response.text()).toMatchSnapshot("response text");

          expect(
            consoleMessages.map((message) => message.text())
          ).toMatchSnapshot("console messages");

          expect(pageErrors).toMatchSnapshot("page errors");
        });
      });

      describe("filename bundle.other.js", () => {
        beforeEach(async () => {
          compiler = webpack({
            ...config,
            output: {
              path: "/",
              filename: "bundle.other.js",
            },
            experiments: {
              outputModule: true,
            },
          });
          server = new Server({ port, magicHtml: true }, compiler);

          await server.start();

          ({ page, browser } = await runBrowser());

          pageErrors = [];
          consoleMessages = [];
        });

        afterEach(async () => {
          await browser.close();
          await server.stop();
        });

        it("should handle GET request to magic async html (/bundle.other)", async () => {
          page
            .on("console", (message) => {
              consoleMessages.push(message);
            })
            .on("pageerror", (error) => {
              pageErrors.push(error);
            });

          const response = await page.goto(
            `http://127.0.0.1:${port}/bundle.other`,
            {
              waitUntil: "networkidle0",
            }
          );

          expect(response.headers()["content-type"]).toMatchSnapshot(
            "response headers content-type"
          );

          expect(response.status()).toMatchSnapshot("response status");

          expect(await response.text()).toMatchSnapshot("response text");

          expect(
            consoleMessages.map((message) => message.text())
          ).toMatchSnapshot("console messages");

          expect(pageErrors).toMatchSnapshot("page errors");
        });

        it("should not handle GET request to /bundle", async () => {
          page
            .on("console", (message) => {
              consoleMessages.push(message);
            })
            .on("pageerror", (error) => {
              pageErrors.push(error);
            });

          const response = await page.goto(`http://127.0.0.1:${port}/bundle`, {
            waitUntil: "networkidle0",
          });

          expect(response.headers()["content-type"]).toMatchSnapshot(
            "response headers content-type"
          );

          expect(response.status()).toMatchSnapshot("response status");

          expect(await response.text()).toMatchSnapshot("response text");

          expect(
            consoleMessages.map((message) => message.text())
          ).toMatchSnapshot("console messages");

          expect(pageErrors).toMatchSnapshot("page errors");
        });

        it("should handle HEAD request to magic async html (/bundle.other)", async () => {
          await page.setRequestInterception(true);

          page
            .on("console", (message) => {
              consoleMessages.push(message);
            })
            .on("pageerror", (error) => {
              pageErrors.push(error);
            })
            .on("request", (interceptedRequest) => {
              interceptedRequest.continue({ method: "HEAD" });
            });

          const response = await page.goto(
            `http://127.0.0.1:${port}/bundle.other`,
            {
              waitUntil: "networkidle0",
            }
          );

          expect(response.headers()["content-type"]).toMatchSnapshot(
            "response headers content-type"
          );

          expect(response.status()).toMatchSnapshot("response status");

          expect(await response.text()).toMatchSnapshot("response text");

          expect(
            consoleMessages.map((message) => message.text())
          ).toMatchSnapshot("console messages");

          expect(pageErrors).toMatchSnapshot("page errors");
        });
      });

      describe("multi compiler mode", () => {
        beforeEach(async () => {
          compiler = webpack([
            {
              ...multiCompilerConfig[0],
              output: {
                path: "/",
                filename: "bundle.js",
              },
              experiments: {
                outputModule: true,
              },
            },
            config,
          ]);
          server = new Server({ port, magicHtml: true }, compiler);

          await server.start();

          ({ page, browser } = await runBrowser());

          pageErrors = [];
          consoleMessages = [];
        });

        afterEach(async () => {
          await browser.close();
          await server.stop();
        });

        it("should handle GET request to magic async html (/bundle)", async () => {
          page
            .on("console", (message) => {
              consoleMessages.push(message);
            })
            .on("pageerror", (error) => {
              pageErrors.push(error);
            });

          const response = await page.goto(`http://127.0.0.1:${port}/bundle`, {
            waitUntil: "networkidle0",
          });

          expect(response.headers()["content-type"]).toMatchSnapshot(
            "response headers content-type"
          );

          expect(response.status()).toMatchSnapshot("response status");

          expect(await response.text()).toMatchSnapshot("response text");

          expect(
            consoleMessages.map((message) => message.text())
          ).toMatchSnapshot("console messages");

          expect(pageErrors).toMatchSnapshot("page errors");
        });

        it("should handle HEAD request to magic async html (/bundle)", async () => {
          await page.setRequestInterception(true);

          page
            .on("console", (message) => {
              consoleMessages.push(message);
            })
            .on("pageerror", (error) => {
              pageErrors.push(error);
            })
            .on("request", (interceptedRequest) => {
              interceptedRequest.continue({ method: "HEAD" });
            });

          const response = await page.goto(`http://127.0.0.1:${port}/bundle`, {
            waitUntil: "networkidle0",
          });

          expect(response.headers()["content-type"]).toMatchSnapshot(
            "response headers content-type"
          );

          expect(response.status()).toMatchSnapshot("response status");

          expect(await response.text()).toMatchSnapshot("response text");

          expect(
            consoleMessages.map((message) => message.text())
          ).toMatchSnapshot("console messages");

          expect(pageErrors).toMatchSnapshot("page errors");
        });
      });
    }
  );

  webpack5Test("enabled with experiments.outputModule: false", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    describe("filename bundle.js", () => {
      beforeEach(async () => {
        compiler = webpack({
          ...config,
          output: {
            path: "/",
            filename: "bundle.js",
          },
          experiments: {
            outputModule: false,
          },
        });
        server = new Server({ port, magicHtml: true }, compiler);

        await server.start();

        ({ page, browser } = await runBrowser());

        pageErrors = [];
        consoleMessages = [];
      });

      afterEach(async () => {
        await browser.close();
        await server.stop();
      });

      it("should not handle GET request to magic async html (/bundle)", async () => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`http://127.0.0.1:${port}/bundle`, {
          waitUntil: "networkidle0",
        });

        expect(response.headers()["content-type"]).toMatchSnapshot(
          "response headers content-type"
        );

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });

      it("should not handle HEAD request to magic async html (/bundle)", async () => {
        await page.setRequestInterception(true);

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          })
          .on("request", (interceptedRequest) => {
            interceptedRequest.continue({ method: "HEAD" });
          });

        const response = await page.goto(`http://127.0.0.1:${port}/bundle`, {
          waitUntil: "networkidle0",
        });

        expect(response.headers()["content-type"]).toMatchSnapshot(
          "response headers content-type"
        );

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });
    });

    describe("filename bundle.other.js", () => {
      beforeEach(async () => {
        compiler = webpack({
          ...config,
          output: {
            path: "/",
            filename: "bundle.other.js",
          },
          experiments: {
            outputModule: false,
          },
        });
        server = new Server({ port, magicHtml: true }, compiler);

        await server.start();

        ({ page, browser } = await runBrowser());

        pageErrors = [];
        consoleMessages = [];
      });

      afterEach(async () => {
        await browser.close();
        await server.stop();
      });

      it("should not handle GET request to magic async html (/bundle.other)", async () => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(
          `http://127.0.0.1:${port}/bundle.other`,
          {
            waitUntil: "networkidle0",
          }
        );

        expect(response.headers()["content-type"]).toMatchSnapshot(
          "response headers content-type"
        );

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });

      it("should not handle GET request to /bundle", async () => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`http://127.0.0.1:${port}/bundle`, {
          waitUntil: "networkidle0",
        });

        expect(response.headers()["content-type"]).toMatchSnapshot(
          "response headers content-type"
        );

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });

      it("should handle HEAD request to magic async html (/bundle.other)", async () => {
        await page.setRequestInterception(true);

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          })
          .on("request", (interceptedRequest) => {
            interceptedRequest.continue({ method: "HEAD" });
          });

        const response = await page.goto(
          `http://127.0.0.1:${port}/bundle.other`,
          {
            waitUntil: "networkidle0",
          }
        );

        expect(response.headers()["content-type"]).toMatchSnapshot(
          "response headers content-type"
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

  describe("disabled", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    describe("filename bundle.js", () => {
      beforeEach(async () => {
        compiler = webpack({
          ...config,
          output: {
            path: "/",
            filename: "bundle.js",
          },
        });
        server = new Server({ port, magicHtml: false }, compiler);

        await server.start();

        ({ page, browser } = await runBrowser());

        pageErrors = [];
        consoleMessages = [];
      });

      afterEach(async () => {
        await browser.close();
        await server.stop();
      });

      it("should not handle GET request to magic async html (/bundle)", async () => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`http://127.0.0.1:${port}/bundle`, {
          waitUntil: "networkidle0",
        });

        expect(response.headers()["content-type"]).toMatchSnapshot(
          "response headers content-type"
        );

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });

      it("should not handle HEAD request to magic async html (/bundle)", async () => {
        await page.setRequestInterception(true);

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          })
          .on("request", (interceptedRequest) => {
            interceptedRequest.continue({ method: "HEAD" });
          });

        const response = await page.goto(`http://127.0.0.1:${port}/bundle`, {
          waitUntil: "networkidle0",
        });

        expect(response.headers()["content-type"]).toMatchSnapshot(
          "response headers content-type"
        );

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });
    });

    describe("filename bundle.other.js", () => {
      beforeEach(async () => {
        compiler = webpack({
          ...config,
          output: {
            path: "/",
            filename: "bundle.other.js",
          },
        });
        server = new Server({ port, magicHtml: false }, compiler);

        await server.start();

        ({ page, browser } = await runBrowser());

        pageErrors = [];
        consoleMessages = [];
      });

      afterEach(async () => {
        await browser.close();
        await server.stop();
      });

      it("should not handle GET request to magic async html (/bundle.other)", async () => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(
          `http://127.0.0.1:${port}/bundle.other`,
          {
            waitUntil: "networkidle0",
          }
        );

        expect(response.headers()["content-type"]).toMatchSnapshot(
          "response headers content-type"
        );

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });

      it("should not handle GET request to /bundle", async () => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`http://127.0.0.1:${port}/bundle`, {
          waitUntil: "networkidle0",
        });

        expect(response.headers()["content-type"]).toMatchSnapshot(
          "response headers content-type"
        );

        expect(response.status()).toMatchSnapshot("response status");

        expect(await response.text()).toMatchSnapshot("response text");

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshot("console messages");

        expect(pageErrors).toMatchSnapshot("page errors");
      });

      it("should not handle HEAD request to magic async html (/bundle.other)", async () => {
        await page.setRequestInterception(true);

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          })
          .on("request", (interceptedRequest) => {
            interceptedRequest.continue({ method: "HEAD" });
          });

        const response = await page.goto(
          `http://127.0.0.1:${port}/bundle.other`,
          {
            waitUntil: "networkidle0",
          }
        );

        expect(response.headers()["content-type"]).toMatchSnapshot(
          "response headers content-type"
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
});
