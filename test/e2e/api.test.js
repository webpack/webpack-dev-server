"use strict";

const path = require("path");
const util = require("util");
const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map").api;

describe("API", () => {
  describe("WEBPACK_SERVE environment variable", () => {
    const OLD_ENV = process.env;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      // this is important - it clears the cache
      jest.resetModules();

      process.env = { ...OLD_ENV };

      delete process.env.WEBPACK_SERVE;

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
      process.env = OLD_ENV;
    });

    it("should be present", async () => {
      expect(process.env.WEBPACK_SERVE).toBeUndefined();

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const WebpackDevServer = require("../../lib/Server");

      const compiler = webpack(config);
      server = new WebpackDevServer({ port }, compiler);

      await server.start();

      expect(process.env.WEBPACK_SERVE).toBe(true);

      const response = await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
    });
  });

  describe("latest async API", () => {
    it(`should work with async API`, async () => {
      const compiler = webpack(config);
      const server = new Server({ port }, compiler);

      await server.start();

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

      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
      expect(pageErrors).toMatchSnapshot("page errors");

      await browser.close();
      await server.stop();
    });

    it(`should work with callback API`, async () => {
      const compiler = webpack(config);
      const server = new Server({ port }, compiler);

      await new Promise((resolve) => {
        server.startCallback(() => {
          resolve();
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

      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
      expect(pageErrors).toMatchSnapshot("page errors");

      await browser.close();
      await new Promise((resolve) => {
        server.stopCallback(() => {
          resolve();
        });
      });
    });

    it(`should catch errors within startCallback`, async () => {
      const compiler = webpack(config);
      const server = new Server(
        { port, static: "https://absolute-url.com/somewhere" },
        compiler
      );

      await new Promise((resolve) => {
        server.startCallback((err) => {
          expect(err.message).toEqual(
            "Using a URL as static.directory is not supported"
          );
          resolve();
        });
      });

      await new Promise((resolve) => {
        server.stopCallback(() => {
          resolve();
        });
      });
    });

    it(`should work when using configured manually`, async () => {
      const compiler = webpack({
        ...config,
        entry: [
          "webpack/hot/dev-server.js",
          `${path.resolve(
            __dirname,
            "../../client/index.js"
          )}?hot=true&live-reload=true"`,
          path.resolve(__dirname, "../fixtures/client-config/foo.js"),
        ],
        plugins: [...config.plugins, new webpack.HotModuleReplacementPlugin()],
      });
      const server = new Server({ port, hot: false, client: false }, compiler);

      await server.start();

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

      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
      expect(pageErrors).toMatchSnapshot("page errors");

      await browser.close();
      await server.stop();
    });

    it(`should work and allow to rerun dev server multiple times`, async () => {
      const compiler = webpack(config);
      const server = new Server({ port }, compiler);

      await server.start();

      const { page: firstPage, browser } = await runBrowser();

      const firstPageErrors = [];
      const firstConsoleMessages = [];

      firstPage
        .on("console", (message) => {
          firstConsoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          firstPageErrors.push(error);
        });

      await firstPage.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(
        firstConsoleMessages.map((message) => message.text())
      ).toMatchSnapshot("console messages");
      expect(firstPageErrors).toMatchSnapshot("page errors");

      await server.stop();
      await server.start();

      const secondPage = await browser.newPage();

      const secondPageErrors = [];
      const secondConsoleMessages = [];

      secondPage
        .on("console", (message) => {
          secondConsoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          secondPageErrors.push(error);
        });

      await secondPage.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(
        secondConsoleMessages.map((message) => message.text())
      ).toMatchSnapshot("console messages");
      expect(secondPageErrors).toMatchSnapshot("page errors");

      await browser.close();
      await server.stop();
    });
  });

  describe("deprecated API", () => {
    it("should work with deprecated API ('listen' and 'close' methods)", async () => {
      const compiler = webpack(config);
      const devServerOptions = { port };
      const utilSpy = jest.spyOn(util, "deprecate");
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

      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(utilSpy.mock.calls[0][1]).toMatchSnapshot(
        "listen deprecation log"
      );
      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
      expect(pageErrors).toMatchSnapshot("page errors");

      await browser.close();
      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });

      expect(
        utilSpy.mock.calls[utilSpy.mock.calls.length - 1][1]
      ).toMatchSnapshot("close deprecation log");

      utilSpy.mockRestore();
    });

    it(`should log warning when the "port" and "host" options from options different from arguments ('listen' method)`, async () => {
      const compiler = webpack(config);
      const devServerOptions = { port: 9999, host: "127.0.0.2" };
      const warnSpy = jest.fn();
      const getInfrastructureLoggerSpy = jest
        .spyOn(compiler, "getInfrastructureLogger")
        .mockImplementation(() => {
          return {
            warn: warnSpy,
            info: () => {},
            log: () => {},
          };
        });
      const server = new Server(devServerOptions, compiler);

      await new Promise((resolve, reject) => {
        server.listen(port, "127.0.0.1", (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
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

      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(warnSpy).toHaveBeenNthCalledWith(
        1,
        'The "port" specified in options is different from the port passed as an argument. Will be used from arguments.'
      );
      expect(warnSpy).toHaveBeenNthCalledWith(
        2,
        'The "host" specified in options is different from the host passed as an argument. Will be used from arguments.'
      );

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
      expect(pageErrors).toMatchSnapshot("page errors");

      warnSpy.mockRestore();
      getInfrastructureLoggerSpy.mockRestore();

      await browser.close();
      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    });

    it(`should work with deprecated API (the order of the arguments in the constructor)`, async () => {
      const compiler = webpack(config);
      const devServerOptions = { port };
      const utilSpy = jest.spyOn(util, "deprecate");
      const server = new Server(compiler, devServerOptions);

      await server.start();

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

      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(utilSpy.mock.calls[0][1]).toMatchSnapshot("deprecation log");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
      expect(pageErrors).toMatchSnapshot("page errors");

      utilSpy.mockRestore();
      await browser.close();
      await server.stop();
    });

    it(`should work with deprecated API (only compiler in constructor)`, async () => {
      const compiler = webpack(config);
      const utilSpy = jest.spyOn(util, "deprecate");
      const server = new Server(compiler);

      server.options.port = port;

      await server.start();

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

      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(utilSpy.mock.calls[0][1]).toMatchSnapshot("deprecation log");
      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
      expect(pageErrors).toMatchSnapshot("page errors");

      utilSpy.mockRestore();
      await browser.close();
      await server.stop();
    });
  });

  describe("Invalidate callback", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      server = new Server({ port, static: false }, compiler);

      await server.start();
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
    });

    it("should use the default `noop` callback when invalidate is called without any callback", async () => {
      server.invalidate();

      expect(server.middleware.context.callbacks.length).toEqual(1);

      const response = await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
      expect(pageErrors).toMatchSnapshot("page errors");
    });

    it("should use the provided `callback` function", async () => {
      const callback = jest.fn();

      server.invalidate(callback);

      expect(server.middleware.context.callbacks[0]).toBe(callback);

      const response = await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
    });
  });

  describe("Server.getFreePort", () => {
    let dummyServers = [];
    let devServerPort;

    afterEach(() => {
      delete process.env.WEBPACK_DEV_SERVER_BASE_PORT;
      delete process.env.WEBPACK_DEV_SERVER_PORT_RETRY;

      return dummyServers
        .reduce(
          (p, server) =>
            p.then(
              () =>
                new Promise((resolve) => {
                  server.stopCallback(() => {
                    resolve();
                  });
                })
            ),
          Promise.resolve()
        )
        .then(() => {
          dummyServers = [];
        });
    });

    function createDummyServers(n) {
      process.env.WEBPACK_DEV_SERVER_BASE_PORT = 60000;

      return (Array.isArray(n) ? n : [...new Array(n)]).reduce(
        (p, _, i) =>
          p.then(
            () =>
              new Promise((resolve) => {
                devServerPort = 60000 + i;
                const compiler = webpack(config);
                const server = new Server(
                  { port: devServerPort, host: "0.0.0.0" },
                  compiler
                );

                dummyServers.push(server);

                server.startCallback(() => {
                  resolve();
                });
              })
          ),
        Promise.resolve()
      );
    }

    it("should return the port when the port is specified", async () => {
      const retryCount = 1;

      process.env.WEBPACK_DEV_SERVER_PORT_RETRY = retryCount;

      const freePort = await Server.getFreePort(9082);

      expect(freePort).toEqual(9082);
    });

    it("should return the port when the port is `null`", async () => {
      const retryCount = 2;

      process.env.WEBPACK_DEV_SERVER_PORT_RETRY = retryCount;

      await createDummyServers(retryCount);

      const freePort = await Server.getFreePort(null);

      expect(freePort).toEqual(60000 + retryCount);

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

      const response = await page.goto(`http://127.0.0.1:${devServerPort}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");

      await browser.close();
    });

    it("should return the port when the port is undefined", async () => {
      const retryCount = 3;

      process.env.WEBPACK_DEV_SERVER_PORT_RETRY = retryCount;

      await createDummyServers(retryCount);

      // eslint-disable-next-line no-undefined
      const freePort = await Server.getFreePort(undefined);

      expect(freePort).toEqual(60000 + retryCount);

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

      const response = await page.goto(`http://127.0.0.1:${devServerPort}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");

      await browser.close();
    });

    it("should retry finding the port for up to defaultPortRetry times (number)", async () => {
      const retryCount = 4;

      process.env.WEBPACK_DEV_SERVER_PORT_RETRY = retryCount;

      await createDummyServers(retryCount);

      const freePort = await Server.getFreePort();

      expect(freePort).toEqual(60000 + retryCount);

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

      const response = await page.goto(`http://127.0.0.1:${devServerPort}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");

      await browser.close();
    });

    it("should retry finding the port for up to defaultPortRetry times (string)", async () => {
      const retryCount = 5;

      process.env.WEBPACK_DEV_SERVER_PORT_RETRY = retryCount;

      await createDummyServers(retryCount);

      const freePort = await Server.getFreePort();

      expect(freePort).toEqual(60000 + retryCount);

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

      const response = await page.goto(`http://127.0.0.1:${devServerPort}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");

      await browser.close();
    });

    it("should retry finding the port when serial ports are busy", async () => {
      const busyPorts = [60000, 60001, 60002, 60003, 60004, 60005];

      process.env.WEBPACK_DEV_SERVER_PORT_RETRY = 1000;

      await createDummyServers(busyPorts);

      const freePort = await Server.getFreePort();

      expect(freePort).toBeGreaterThan(60005);

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

      const response = await page.goto(`http://127.0.0.1:${devServerPort}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");

      await browser.close();
    });

    it("should throw the error when the port isn't found", async () => {
      expect.assertions(1);

      jest.mock(
        "../../lib/getPort",
        () => () => Promise.reject(new Error("busy"))
      );

      process.env.WEBPACK_DEV_SERVER_PORT_RETRY = 1;

      try {
        await Server.getFreePort();
      } catch (error) {
        expect(error.message).toMatchSnapshot();
      }
    });
  });

  describe("Server.checkHostHeader", () => {
    it("should allow access for every requests using an IP", () => {
      const options = {};

      const tests = [
        "192.168.1.123",
        "192.168.1.2:8080",
        "[::1]",
        "[::1]:8080",
        "[ad42::1de2:54c2:c2fa:1234]",
        "[ad42::1de2:54c2:c2fa:1234]:8080",
      ];

      const compiler = webpack(config);
      const server = new Server(options, compiler);

      tests.forEach((test) => {
        const headers = { host: test };

        if (!server.checkHeader(headers, "host")) {
          throw new Error("Validation didn't pass");
        }
      });
    });

    it('should allow URLs with scheme for checking origin when the "option.client.webSocketURL" is object', async () => {
      const options = {
        port,
        client: {
          webSocketURL: {
            hostname: "test.host",
          },
        },
        webSocketServer: "ws",
      };
      const headers = {
        origin: "https://test.host",
      };

      const compiler = webpack(config);
      const server = new Server(options, compiler);

      await server.start();

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

      const webSocketRequests = [];
      const client = page._client;

      client.on("Network.webSocketCreated", (test) => {
        webSocketRequests.push(test);
      });

      const response = await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      if (!server.checkHeader(headers, "origin")) {
        throw new Error("Validation didn't fail");
      }

      expect(webSocketRequests[0].url).toMatchSnapshot("web socket URL");

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");

      await browser.close();
      await server.stop();
    });
  });
});
