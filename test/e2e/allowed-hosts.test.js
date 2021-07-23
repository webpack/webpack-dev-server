"use strict";

const express = require("express");
const webpack = require("webpack");
const { createProxyMiddleware } = require("http-proxy-middleware");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const [port1, port2] = require("../ports-map")["allowed-hosts"];

const webSocketServers = ["ws", "sockjs"];

describe("allowed hosts", () => {
  for (const webSocketServer of webSocketServers) {
    it(`should disconnect web socket client using custom hostname from web socket server with the "auto" value based on the "host" header ("${webSocketServer}")`, async () => {
      const devServerHost = "127.0.0.1";
      const devServerPort = port1;
      const proxyHost = devServerHost;
      const proxyPort = port2;

      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            port: port2,
          },
        },
        webSocketServer,
        port: devServerPort,
        host: devServerHost,
        allowedHosts: "auto",
      };
      const server = new Server(devServerOptions, compiler);

      await new Promise((resolve, reject) => {
        server.listen(devServerOptions.port, devServerOptions.host, (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            // Emulation
            onProxyReqWs: (proxyReq) => {
              proxyReq.setHeader("host", "my-test-host");
            },
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logLevel: "warn",
          })
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://${proxyHost}:${proxyPort}/main`, {
        waitUntil: "networkidle0",
      });

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
      expect(pageErrors).toMatchSnapshot("page errors");

      proxy.close();

      await browser.close();
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });
    });

    it(`should disconnect web socket client using custom hostname from web socket server with the "auto" value based on the "origin" header ("${webSocketServer}")`, async () => {
      const devServerHost = "127.0.0.1";
      const devServerPort = port1;
      const proxyHost = devServerHost;
      const proxyPort = port2;

      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            port: port2,
          },
        },
        webSocketServer,
        port: devServerPort,
        host: devServerHost,
        allowedHosts: "auto",
      };
      const server = new Server(devServerOptions, compiler);

      await new Promise((resolve, reject) => {
        server.listen(devServerOptions.port, devServerOptions.host, (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            // Emulation
            onProxyReqWs: (proxyReq) => {
              proxyReq.setHeader("origin", "http://my-test-origin.com/");
            },
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logLevel: "warn",
          })
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://${proxyHost}:${proxyPort}/main`, {
        waitUntil: "networkidle0",
      });

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
      expect(pageErrors).toMatchSnapshot("page errors");

      proxy.close();

      await browser.close();
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });
    });

    it(`should connect web socket client using localhost to web socket server with the "auto" value ("${webSocketServer}")`, async () => {
      const devServerHost = "localhost";
      const devServerPort = port1;
      const proxyHost = devServerHost;
      const proxyPort = port2;

      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            port: port2,
          },
        },
        webSocketServer,
        port: devServerPort,
        host: devServerHost,
        allowedHosts: "auto",
      };
      const server = new Server(devServerOptions, compiler);

      await new Promise((resolve, reject) => {
        server.listen(devServerOptions.port, devServerOptions.host, (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logLevel: "warn",
          })
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://${proxyHost}:${proxyPort}/main`, {
        waitUntil: "networkidle0",
      });

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
      expect(pageErrors).toMatchSnapshot("page errors");

      proxy.close();

      await browser.close();
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });
    });

    it(`should connect web socket client using "127.0.0.1" host to web socket server with the "auto" value ("${webSocketServer}")`, async () => {
      const devServerHost = "127.0.0.1";
      const devServerPort = port1;
      const proxyHost = devServerHost;
      const proxyPort = port2;

      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            port: port2,
          },
        },
        webSocketServer,
        port: devServerPort,
        host: devServerHost,
        allowedHosts: "auto",
      };
      const server = new Server(devServerOptions, compiler);

      await new Promise((resolve, reject) => {
        server.listen(devServerOptions.port, devServerOptions.host, (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logLevel: "warn",
          })
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://${proxyHost}:${proxyPort}/main`, {
        waitUntil: "networkidle0",
      });

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
      expect(pageErrors).toMatchSnapshot("page errors");

      proxy.close();

      await browser.close();
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });
    });

    it(`should connect web socket client using "[::1] host to web socket server with the "auto" value ("${webSocketServer}")`, async () => {
      const devServerHost = "::1";
      const devServerPort = port1;
      const proxyHost = devServerHost;
      const proxyPort = port2;

      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            port: port2,
          },
        },
        webSocketServer,
        port: devServerPort,
        host: devServerHost,
        allowedHosts: "auto",
      };
      const server = new Server(devServerOptions, compiler);

      await new Promise((resolve, reject) => {
        server.listen(devServerOptions.port, devServerOptions.host, (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            target: `http://[${devServerHost}]:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logLevel: "warn",
          })
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://[${proxyHost}]:${proxyPort}/main`, {
        waitUntil: "networkidle0",
      });

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
      expect(pageErrors).toMatchSnapshot("page errors");

      proxy.close();

      await browser.close();
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });
    });

    it(`should connect web socket client using custom hostname to web socket server with the "all" value ("${webSocketServer}")`, async () => {
      const devServerHost = "127.0.0.1";
      const devServerPort = port1;
      const proxyHost = devServerHost;
      const proxyPort = port2;

      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            port: port2,
          },
        },
        webSocketServer,
        port: devServerPort,
        host: devServerHost,
        allowedHosts: "all",
      };
      const server = new Server(devServerOptions, compiler);

      await new Promise((resolve, reject) => {
        server.listen(devServerOptions.port, devServerOptions.host, (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            // Emulation
            onProxyReqWs: (proxyReq) => {
              proxyReq.setHeader("origin", "http://my-test-origin.com/");
            },
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logLevel: "warn",
          })
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://${proxyHost}:${proxyPort}/main`, {
        waitUntil: "networkidle0",
      });

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
      expect(pageErrors).toMatchSnapshot("page errors");

      proxy.close();

      await browser.close();
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });
    });

    it(`should connect web socket client using custom hostname to web socket server with the custom hostname value ("${webSocketServer}")`, async () => {
      const devServerHost = "127.0.0.1";
      const devServerPort = port1;
      const proxyHost = devServerHost;
      const proxyPort = port2;

      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            port: port2,
          },
        },
        webSocketServer,
        port: devServerPort,
        host: devServerHost,
        allowedHosts: "my-test-origin.com",
      };
      const server = new Server(devServerOptions, compiler);

      await new Promise((resolve, reject) => {
        server.listen(devServerOptions.port, devServerOptions.host, (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            // Emulation
            onProxyReqWs: (proxyReq) => {
              proxyReq.setHeader("origin", "http://my-test-origin.com/");
            },
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logLevel: "warn",
          })
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://${proxyHost}:${proxyPort}/main`, {
        waitUntil: "networkidle0",
      });

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
      expect(pageErrors).toMatchSnapshot("page errors");

      proxy.close();

      await browser.close();
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });
    });

    it(`should connect web socket client using custom hostname to web socket server with the custom hostname value starting with dot ("${webSocketServer}")`, async () => {
      const devServerHost = "127.0.0.1";
      const devServerPort = port1;
      const proxyHost = devServerHost;
      const proxyPort = port2;

      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            port: port2,
          },
        },
        webSocketServer,
        port: devServerPort,
        host: devServerHost,
        allowedHosts: ".my-test-origin.com",
      };
      const server = new Server(devServerOptions, compiler);

      await new Promise((resolve, reject) => {
        server.listen(devServerOptions.port, devServerOptions.host, (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            // Emulation
            onProxyReqWs: (proxyReq) => {
              proxyReq.setHeader("origin", "http://my-test-origin.com/");
            },
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logLevel: "warn",
          })
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://${proxyHost}:${proxyPort}/main`, {
        waitUntil: "networkidle0",
      });

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
      expect(pageErrors).toMatchSnapshot("page errors");

      proxy.close();

      await browser.close();
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });
    });

    it(`should connect web socket client using custom sub hostname to web socket server with the custom hostname value ("${webSocketServer}")`, async () => {
      const devServerHost = "127.0.0.1";
      const devServerPort = port1;
      const proxyHost = devServerHost;
      const proxyPort = port2;

      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            port: port2,
          },
        },
        webSocketServer,
        port: devServerPort,
        host: devServerHost,
        allowedHosts: ".my-test-origin.com",
      };
      const server = new Server(devServerOptions, compiler);

      await new Promise((resolve, reject) => {
        server.listen(devServerOptions.port, devServerOptions.host, (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            // Emulation
            onProxyReqWs: (proxyReq) => {
              proxyReq.setHeader(
                "origin",
                "http://foo.bar.baz.my-test-origin.com/"
              );
            },
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logLevel: "warn",
          })
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://${proxyHost}:${proxyPort}/main`, {
        waitUntil: "networkidle0",
      });

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
      expect(pageErrors).toMatchSnapshot("page errors");

      proxy.close();

      await browser.close();
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });
    });

    it(`should connect web socket client using custom hostname to web socket server with the multiple custom hostname values ("${webSocketServer}")`, async () => {
      const devServerHost = "127.0.0.1";
      const devServerPort = port1;
      const proxyHost = devServerHost;
      const proxyPort = port2;

      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            port: port2,
          },
        },
        webSocketServer,
        port: devServerPort,
        host: devServerHost,
        allowedHosts: ["my-test-origin.com"],
      };
      const server = new Server(devServerOptions, compiler);

      await new Promise((resolve, reject) => {
        server.listen(devServerOptions.port, devServerOptions.host, (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            // Emulation
            onProxyReqWs: (proxyReq) => {
              proxyReq.setHeader("origin", "http://my-test-origin.com/");
            },
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logLevel: "warn",
          })
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://${proxyHost}:${proxyPort}/main`, {
        waitUntil: "networkidle0",
      });

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
      expect(pageErrors).toMatchSnapshot("page errors");

      proxy.close();

      await browser.close();
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });
    });

    it(`should disconnect web client using localhost to web socket server with the "auto" value ("${webSocketServer}")`, async () => {
      const devServerHost = "127.0.0.1";
      const devServerPort = port1;
      const proxyHost = devServerHost;
      const proxyPort = port2;

      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            port: port2,
          },
        },
        webSocketServer,
        port: devServerPort,
        host: devServerHost,
        allowedHosts: "auto",
      };
      const server = new Server(devServerOptions, compiler);

      await new Promise((resolve, reject) => {
        server.listen(devServerOptions.port, devServerOptions.host, (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            // Emulation
            onProxyReq: (proxyReq, req, res) => {
              proxyReq.setHeader("host", "unknown");
              res.setHeader("host", devServerHost);
            },
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logLevel: "warn",
          })
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://${proxyHost}:${proxyPort}/main`, {
        waitUntil: "networkidle0",
      });

      const html = await page.content();

      expect(html).toMatchSnapshot("html");
      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
      expect(pageErrors).toMatchSnapshot("page errors");

      proxy.close();

      await browser.close();
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });
    });
  }
});
