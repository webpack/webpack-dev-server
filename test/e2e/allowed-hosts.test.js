import { afterEach, beforeEach, describe, it } from "node:test";

import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import config from "../fixtures/client-config/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const [port1, port2] = portsMap["allowed-hosts"];

const webSocketServers = ["ws"];

describe("allowed hosts", () => {
  for (const webSocketServer of webSocketServers) {
    it(`should connect web socket client using localhost to web socket server with the "auto" value ("${webSocketServer}")`, async (t) => {
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

      await server.start();

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logger: server.logger,
          }),
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();
      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://${proxyHost}:${proxyPort}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        proxy.close();

        await browser.close();
        await server.stop();
      }
    });

    it(`should connect web socket client using "localhost" host to web socket server by default ("${webSocketServer}")`, async (t) => {
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
      };
      const server = new Server(devServerOptions, compiler);

      await server.start();

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logger: server.logger,
          }),
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://${proxyHost}:${proxyPort}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        proxy.close();

        await browser.close();
        await server.stop();
      }
    });

    it(`should connect web socket client using "127.0.0.1" host to web socket server by default ("${webSocketServer}")`, async (t) => {
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
      };
      const server = new Server(devServerOptions, compiler);

      await server.start();

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logger: server.logger,
          }),
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://${proxyHost}:${proxyPort}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        proxy.close();

        await browser.close();
        await server.stop();
      }
    });

    it(`should connect web socket client using "127.0.0.1" host to web socket server with the "auto" value ("${webSocketServer}")`, async (t) => {
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

      await server.start();

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logger: server.logger,
          }),
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://${proxyHost}:${proxyPort}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        proxy.close();

        await browser.close();
        await server.stop();
      }
    });

    it(`should connect web socket client using "[::1] host to web socket server with the "auto" value ("${webSocketServer}")`, async (t) => {
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

      await server.start();

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            target: `http://[${devServerHost}]:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logger: server.logger,
          }),
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://[${proxyHost}]:${proxyPort}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        proxy.close();

        await browser.close();
        await server.stop();
      }
    });

    it(`should connect web socket client using "0.0.0.0" host to web socket server with the "auto" value ("${webSocketServer}")`, async (t) => {
      const devServerHost = "0.0.0.0";
      const IPv4 = Server.findIp("v4");
      const devServerPort = port1;
      const proxyHost = IPv4;
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

      await server.start();

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            target: `http://${IPv4}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logger: server.logger,
          }),
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://${proxyHost}:${proxyPort}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        proxy.close();

        await browser.close();
        await server.stop();
      }
    });

    it(`should connect web socket client using "file:" protocol to web socket server with the "auto" value ("${webSocketServer}")`, async (t) => {
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

      await server.start();

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            target: `http://${devServerHost}:${devServerPort}`,
            on: {
              proxyReqWs: (proxyReq) => {
                proxyReq.setHeader("origin", "file:///path/to/local/file.js");
              },
            },
            ws: true,
            changeOrigin: true,
            logger: server.logger,
          }),
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://${proxyHost}:${proxyPort}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        proxy.close();

        await browser.close();
        await server.stop();
      }
    });

    it(`should connect web socket client using "chrome-extension:" protocol to web socket server with the "auto" value ("${webSocketServer}")`, async (t) => {
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

      await server.start();

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            target: `http://${devServerHost}:${devServerPort}`,
            on: {
              proxyReqWs: (proxyReq) => {
                proxyReq.setHeader("origin", "chrome-extension:///abcdef");
              },
            },
            ws: true,
            changeOrigin: true,
            logger: server.logger,
          }),
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://${proxyHost}:${proxyPort}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        proxy.close();

        await browser.close();
        await server.stop();
      }
    });

    it(`should connect web socket client using custom hostname to web socket server with the "all" value ("${webSocketServer}")`, async (t) => {
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

      await server.start();

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            // Emulation
            on: {
              proxyReqWs: (proxyReq) => {
                proxyReq.setHeader("origin", "http://my-test-origin.com/");
              },
            },
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logger: server.logger,
          }),
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://${proxyHost}:${proxyPort}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        proxy.close();

        await browser.close();
        await server.stop();
      }
    });

    it(`should connect web socket client using custom hostname to web socket server with the "all" value in array ("${webSocketServer}")`, async (t) => {
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
        allowedHosts: ["all"],
      };
      const server = new Server(devServerOptions, compiler);

      await server.start();

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            // Emulation
            on: {
              proxyReqWs: (proxyReq) => {
                proxyReq.setHeader("origin", "http://my-test-origin.com/");
              },
            },
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logger: server.logger,
          }),
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://${proxyHost}:${proxyPort}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        proxy.close();

        await browser.close();
        await server.stop();
      }
    });

    it(`should connect web socket client using custom hostname to web socket server with the custom hostname value ("${webSocketServer}")`, async (t) => {
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

      await server.start();

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            // Emulation
            on: {
              proxyReqWs: (proxyReq) => {
                proxyReq.setHeader("origin", "http://my-test-origin.com/");
              },
            },
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logger: server.logger,
          }),
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://${proxyHost}:${proxyPort}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        proxy.close();

        await browser.close();
        await server.stop();
      }
    });

    it(`should connect web socket client using custom hostname to web socket server with the custom hostname value starting with dot ("${webSocketServer}")`, async (t) => {
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

      await server.start();

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            // Emulation
            on: {
              proxyReqWs: (proxyReq) => {
                proxyReq.setHeader("origin", "http://my-test-origin.com/");
              },
            },
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logger: server.logger,
          }),
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://${proxyHost}:${proxyPort}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        proxy.close();

        await browser.close();
        await server.stop();
      }
    });

    it(`should connect web socket client using custom sub hostname to web socket server with the custom hostname value ("${webSocketServer}")`, async (t) => {
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

      await server.start();

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            // Emulation
            on: {
              proxyReqWs: (proxyReq) => {
                proxyReq.setHeader(
                  "origin",
                  "http://foo.bar.baz.my-test-origin.com/",
                );
              },
            },
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logger: server.logger,
          }),
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://${proxyHost}:${proxyPort}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        proxy.close();

        await browser.close();
        await server.stop();
      }
    });

    it(`should connect web socket client using custom hostname to web socket server with the multiple custom hostname values ("${webSocketServer}")`, async (t) => {
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

      await server.start();

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            // Emulation
            on: {
              proxyReqWs: (proxyReq) => {
                proxyReq.setHeader("origin", "http://my-test-origin.com/");
              },
            },
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logger: server.logger,
          }),
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://${proxyHost}:${proxyPort}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        proxy.close();

        await browser.close();
        await server.stop();
      }
    });

    it(`should connect web socket client using origin header containing an IP address with the custom hostname value ("${webSocketServer}")`, async (t) => {
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
        allowedHosts: ["192.168.1.1"],
      };
      const server = new Server(devServerOptions, compiler);

      await server.start();

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            // Emulation
            on: {
              proxyReqWs: (proxyReq) => {
                proxyReq.setHeader("origin", "http://192.168.1.1");
              },
            },
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logger: server.logger,
          }),
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://${proxyHost}:${proxyPort}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        proxy.close();

        await browser.close();
        await server.stop();
      }
    });

    it(`should disconnect web socket client using custom hostname from web socket server with the "auto" value based on the "host" header ("${webSocketServer}")`, async (t) => {
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

      await server.start();

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            // Emulation
            on: {
              proxyReqWs: (proxyReq) => {
                proxyReq.setHeader("host", "my-test-host");
              },
            },
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logger: server.logger,
          }),
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://${proxyHost}:${proxyPort}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        proxy.close();

        await browser.close();
        await server.stop();
      }
    });

    it(`should disconnect web socket client using custom hostname from web socket server with the "auto" value based on the "host" header when "server: 'https'" is enabled ("${webSocketServer}")`, async (t) => {
      const devServerHost = "127.0.0.1";
      const devServerPort = port1;
      const proxyHost = devServerHost;
      const proxyPort = port2;

      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            port: port2,
            protocol: "ws",
          },
        },
        webSocketServer,
        port: devServerPort,
        host: devServerHost,
        allowedHosts: "auto",
        server: "https",
      };
      const server = new Server(devServerOptions, compiler);

      await server.start();

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            // Emulation
            on: {
              proxyReqWs: (proxyReq) => {
                proxyReq.setHeader("origin", "my-test-host/");
              },
            },
            target: `https://${devServerHost}:${devServerPort}`,
            secure: false,
            ws: true,
            changeOrigin: true,
            logger: server.logger,
          }),
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://${proxyHost}:${proxyPort}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        proxy.close();

        await browser.close();
        await server.stop();
      }
    });

    it(`should disconnect web socket client using custom hostname from web socket server with the "auto" value based on the "origin" header ("${webSocketServer}")`, async (t) => {
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

      await server.start();

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            // Emulation
            on: {
              proxyReqWs: (proxyReq) => {
                proxyReq.setHeader("origin", "http://my-test-origin.com/");
              },
            },
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logger: server.logger,
          }),
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://${proxyHost}:${proxyPort}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        proxy.close();

        await browser.close();
        await server.stop();
      }
    });

    it(`should disconnect web client using localhost to web socket server with the "auto" value ("${webSocketServer}")`, async (t) => {
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

      await server.start();

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            // Emulation
            on: {
              proxyReq: (proxyReq, req, res) => {
                proxyReq.setHeader("host", "unknown");
                res.setHeader("host", devServerHost);
              },
            },
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logger: server.logger,
          }),
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://${proxyHost}:${proxyPort}/`, {
          waitUntil: "networkidle0",
        });

        const html = await page.content();

        t.assert.snapshot(html);
        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        proxy.close();

        await browser.close();
        await server.stop();
      }
    });

    it(`should disconnect web client using origin header containing an IP address with the "auto" value ("${webSocketServer}")`, async (t) => {
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
        allowedHosts: ["192.168.1.1"],
      };
      const server = new Server(devServerOptions, compiler);

      await server.start();

      function startProxy(callback) {
        const app = express();

        app.use(
          "/",
          createProxyMiddleware({
            // Emulation
            on: {
              proxyReqWs: (proxyReq) => {
                proxyReq.setHeader("origin", "http://192.168.0.1");
              },
            },
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logger: server.logger,
          }),
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const { page, browser } = await runBrowser();

      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://${proxyHost}:${proxyPort}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        proxy.close();

        await browser.close();
        await server.stop();
      }
    });
  }

  describe("check host headers", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(() => {
      compiler = webpack(config);
      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
    });

    it("should always allow `localhost` if options.allowedHosts is auto", async (t) => {
      const options = {
        allowedHosts: "auto",
        port: port1,
      };

      const headers = {
        host: "localhost",
      };

      server = new Server(options, compiler);

      await server.start();

      ({ page, browser } = await runBrowser());

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port1}/main.js`, {
        waitUntil: "networkidle0",
      });

      if (!server.isValidHost(headers, "host")) {
        throw new Error("Validation didn't fail");
      }

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should always allow `localhost` subdomain if options.allowedHosts is auto", async (t) => {
      const options = {
        allowedHosts: "auto",
        port: port1,
      };

      const headers = {
        host: "app.localhost",
      };

      server = new Server(options, compiler);

      await server.start();

      ({ page, browser } = await runBrowser());

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port1}/main.js`, {
        waitUntil: "networkidle0",
      });

      if (!server.isValidHost(headers, "host")) {
        throw new Error("Validation didn't fail");
      }

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should always allow value from the `host` options if options.allowedHosts is auto", async (t) => {
      const networkIP = Server.findIp("v4", false);
      const options = {
        host: networkIP,
        allowedHosts: "auto",
        port: port1,
      };

      const headers = {
        host: networkIP,
      };

      server = new Server(options, compiler);

      await server.start();

      ({ page, browser } = await runBrowser());

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://${networkIP}:${port1}/main.js`, {
        waitUntil: "networkidle0",
      });

      if (!server.isValidHost(headers, "host")) {
        throw new Error("Validation didn't fail");
      }

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should always allow value of the `host` option from the `client.webSocketURL` option if options.allowedHosts is auto", async (t) => {
      const options = {
        allowedHosts: "auto",
        port: port1,
        client: {
          webSocketURL: "ws://test.host:80",
        },
      };

      const headers = {
        host: "test.host",
      };

      server = new Server(options, compiler);

      await server.start();

      ({ page, browser } = await runBrowser());

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port1}/main.js`, {
        waitUntil: "networkidle0",
      });

      if (!server.isValidHost(headers, "host")) {
        throw new Error("Validation didn't fail");
      }

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should always allow any host if options.allowedHosts is all", async (t) => {
      const options = {
        allowedHosts: "all",
        port: port1,
      };
      const headers = {
        host: "bad.host",
      };

      server = new Server(options, compiler);

      await server.start();

      ({ page, browser } = await runBrowser());

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port1}/main.js`, {
        waitUntil: "networkidle0",
      });

      if (!server.isValidHost(headers, "host")) {
        throw new Error("Validation didn't fail");
      }

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should allow hosts in allowedHosts", async (t) => {
      const tests = ["test.host", "test2.host", "test3.host"];
      const options = {
        allowedHosts: tests,
        port: port1,
      };

      server = new Server(options, compiler);

      await server.start();

      ({ page, browser } = await runBrowser());

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port1}/main.js`, {
        waitUntil: "networkidle0",
      });

      for (const test of tests) {
        const headers = { host: test };

        if (!server.isValidHost(headers, "host")) {
          throw new Error("Validation didn't fail");
        }
      }

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should allow hosts that pass a wildcard in allowedHosts", async (t) => {
      const options = {
        allowedHosts: [".example.com"],
        port: port1,
      };

      server = new Server(options, compiler);

      await server.start();

      ({ page, browser } = await runBrowser());

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port1}/main.js`, {
        waitUntil: "networkidle0",
      });

      const tests = [
        "www.example.com",
        "subdomain.example.com",
        "example.com",
        "subsubcomain.subdomain.example.com",
        "example.com:80",
        "subdomain.example.com:80",
      ];

      for (const test of tests) {
        const headers = { host: test };

        if (!server.isValidHost(headers, "host")) {
          throw new Error("Validation didn't fail");
        }
      }

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should allow websocket connection when host is 'localhost' but resolves to '127.0.0.1' (loopback alias mismatch)", async (t) => {
      const options = {
        allowedHosts: "auto",
        host: "localhost",
        port: port1,
      };

      server = new Server(options, compiler);

      await server.start();

      ({ page, browser } = await runBrowser());

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      // Simulate: browser opens from localhost, but OS resolved
      // 'localhost' to '127.0.0.1' so host header is the IP
      const headersLocalhostOriginIPv4Host = {
        host: "127.0.0.1",
        origin: "http://localhost",
      };

      if (!server.isSameOrigin(headersLocalhostOriginIPv4Host)) {
        throw new Error(
          "isSameOrigin should treat localhost and 127.0.0.1 as equivalent loopback addresses",
        );
      }

      const response = await page.goto(`http://localhost:${port1}/main.js`, {
        waitUntil: "networkidle0",
      });

      t.assert.snapshot(response.status());
      t.assert.snapshot(consoleMessages.map((message) => message.text()));
      t.assert.snapshot(pageErrors);
    });

    it("should allow websocket connection when host is 'localhost' but resolves to '::1' (loopback alias mismatch)", async (t) => {
      const options = {
        allowedHosts: "auto",
        host: "localhost",
        port: port1,
      };

      server = new Server(options, compiler);

      await server.start();

      ({ page, browser } = await runBrowser());

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      // Simulate: page loaded via localhost, but a WS client built the
      // connection URL using the IPv6 loopback, so the Host header is
      // the bracketed IPv6 form (per RFC 3986/7230) while Origin keeps
      // the original 'localhost'.
      const headersLocalhostOriginIPv6Host = {
        host: "[::1]",
        origin: "http://localhost",
      };

      if (!server.isSameOrigin(headersLocalhostOriginIPv6Host)) {
        throw new Error(
          "isSameOrigin should treat localhost and ::1 as equivalent loopback addresses",
        );
      }

      const response = await page.goto(`http://localhost:${port1}/main.js`, {
        waitUntil: "networkidle0",
      });

      t.assert.snapshot(response.status());
      t.assert.snapshot(consoleMessages.map((message) => message.text()));
      t.assert.snapshot(pageErrors);
    });

    it("should allow websocket connection when origin is '127.0.0.1' but host is 'localhost' (reverse loopback alias mismatch)", async (t) => {
      const options = {
        allowedHosts: "auto",
        host: "127.0.0.1",
        port: port1,
      };

      server = new Server(options, compiler);

      await server.start();

      ({ page, browser } = await runBrowser());

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      // Reverse of above: server bound to 127.0.0.1, but browser
      // sent origin header using 'localhost' name
      const headersIPv4OriginLocalhostHost = {
        host: "localhost",
        origin: "http://127.0.0.1",
      };

      if (!server.isSameOrigin(headersIPv4OriginLocalhostHost)) {
        throw new Error(
          "isSameOrigin should treat 127.0.0.1 and localhost as equivalent loopback addresses",
        );
      }

      const response = await page.goto(`http://127.0.0.1:${port1}/main.js`, {
        waitUntil: "networkidle0",
      });

      t.assert.snapshot(response.status());
      t.assert.snapshot(consoleMessages.map((message) => message.text()));
      t.assert.snapshot(pageErrors);
    });

    it("should NOT allow websocket connection when allowedHosts is restrictive and excludes every loopback alias", async (t) => {
      const options = {
        // Explicit allow-list without any loopback alias: the loopback
        // equivalence must NOT override the user's configuration.
        allowedHosts: ["example.com"],
        host: "localhost",
        port: port1,
      };

      server = new Server(options, compiler);

      await server.start();

      ({ page, browser } = await runBrowser());

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const headersLoopbackButNotAllowed = {
        host: "127.0.0.1",
        origin: "http://localhost",
      };

      if (server.isSameOrigin(headersLoopbackButNotAllowed)) {
        throw new Error(
          "isSameOrigin must respect explicit allowedHosts when no loopback alias is permitted",
        );
      }

      const response = await page.goto(`http://localhost:${port1}/main.js`, {
        waitUntil: "networkidle0",
      });

      t.assert.snapshot(response.status());
      t.assert.snapshot(consoleMessages.map((message) => message.text()));
      t.assert.snapshot(pageErrors);
    });

    it("should NOT allow websocket connection when origin is a non-loopback address mismatching host (loopback fix must not widen trust)", async (t) => {
      const options = {
        allowedHosts: "auto",
        host: "localhost",
        port: port1,
      };

      server = new Server(options, compiler);

      await server.start();

      ({ page, browser } = await runBrowser());

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      // A real external origin must never pass as loopback equivalent.
      const headersExternalOrigin = {
        host: "localhost",
        origin: "http://evil.example.com",
      };

      if (server.isSameOrigin(headersExternalOrigin)) {
        throw new Error(
          "isSameOrigin must NOT allow external origins to match loopback host",
        );
      }

      const response = await page.goto(`http://localhost:${port1}/main.js`, {
        waitUntil: "networkidle0",
      });

      t.assert.snapshot(response.status());
      t.assert.snapshot(consoleMessages.map((message) => message.text()));
      t.assert.snapshot(pageErrors);
    });
  });
});
