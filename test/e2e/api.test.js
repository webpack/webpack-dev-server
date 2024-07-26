"use strict";

const path = require("path");
const webpack = require("webpack");
const { describe, test, beforeEach, afterEach } = require("@playwright/test");
const sinon = require("sinon");
const { expect } = require("../helpers/playwright-custom-expects");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const sessionSubscribe = require("../helpers/session-subscribe");
const port = require("../ports-map").api;

describe(
  "API",
  {
    annotation: {
      type: "flaky",
      description:
        "https://github.com/webpack/webpack-dev-server/actions/runs/9975184174/job/27564350442",
    },
  },
  () => {
    describe("WEBPACK_SERVE environment variable", () => {
      const OLD_ENV = process.env;
      let server;
      let pageErrors;
      let consoleMessages;

      beforeEach(async () => {
        Object.keys(require.cache).forEach((key) => delete require.cache[key]);

        process.env = { ...OLD_ENV };

        delete process.env.WEBPACK_SERVE;

        pageErrors = [];
        consoleMessages = [];
      });

      afterEach(async () => {
        await server.stop();
        process.env = OLD_ENV;
      });

      test(
        "should be present",
        { tag: ["@flaky", "@fails"] },
        async ({ page }) => {
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

          expect(process.env.WEBPACK_SERVE).toBe("true");

          const response = await page.goto(`http://127.0.0.1:${port}/`, {
            waitUntil: "networkidle0",
          });

          expect(response.status()).toMatchSnapshotWithArray();

          expect(
            consoleMessages.map((message) => message.text()),
          ).toMatchSnapshotWithArray();

          expect(pageErrors).toMatchSnapshotWithArray();
        },
      );
    });

    describe("latest async API", () => {
      test(`should work with async API`, async ({ page }) => {
        const compiler = webpack(config);
        const server = new Server({ port }, compiler);

        await server.start();

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

          await page.goto(`http://127.0.0.1:${port}/`, {
            waitUntil: "networkidle0",
          });

          expect(
            consoleMessages.map((message) => message.text()),
          ).toMatchSnapshotWithArray();
          expect(pageErrors).toMatchSnapshotWithArray();
        } catch (error) {
          throw error;
        } finally {
          await server.stop();
        }
      });

      test(`should work with callback API`, async ({ page }) => {
        const compiler = webpack(config);
        const server = new Server({ port }, compiler);

        await new Promise((resolve) => {
          server.startCallback(() => {
            resolve();
          });
        });

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

          await page.goto(`http://127.0.0.1:${port}/`, {
            waitUntil: "networkidle0",
          });

          expect(
            consoleMessages.map((message) => message.text()),
          ).toMatchSnapshotWithArray();
          expect(pageErrors).toMatchSnapshotWithArray();
        } catch (error) {
          throw error;
        } finally {
          await new Promise((resolve) => {
            server.stopCallback(() => {
              resolve();
            });
          });
        }
      });

      test(`should catch errors within startCallback`, async () => {
        const compiler = webpack(config);
        const server = new Server(
          { port, static: "https://absolute-url.com/somewhere" },
          compiler,
        );

        await new Promise((resolve) => {
          server.startCallback((err) => {
            expect(err.message).toEqual(
              "Using a URL as static.directory is not supported",
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

      // TODO: snapshot comparison fails
      test.fixme(
        `should work when using configured manually`,
        { tag: "@fails" },
        async ({ page }) => {
          const compiler = webpack({
            ...config,
            entry: [
              "webpack/hot/dev-server.js",
              `${path.resolve(
                __dirname,
                "../../client/index.js",
              )}?hot=true&live-reload=true"`,
              path.resolve(__dirname, "../fixtures/client-config/foo.js"),
            ],
            plugins: [
              ...config.plugins,
              new webpack.HotModuleReplacementPlugin(),
            ],
          });
          const server = new Server(
            { port, hot: false, client: false },
            compiler,
          );

          await server.start();

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

            await page.goto(`http://127.0.0.1:${port}/`, {
              waitUntil: "networkidle0",
            });

            expect(
              consoleMessages.map((message) => message.text()),
            ).toMatchSnapshotWithArray();
            expect(pageErrors).toMatchSnapshotWithArray();
          } catch (error) {
            throw error;
          } finally {
            await server.stop();
          }
        },
      );

      test(`should work and allow to rerun dev server multiple times`, async ({
        browser,
      }) => {
        const browserContext = await browser.newContext();

        const compiler = webpack(config);
        const server = new Server({ port }, compiler);

        await server.start();

        const firstPage = await browserContext.newPage();

        try {
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
            firstConsoleMessages.map((message) => message.text()),
          ).toMatchSnapshotWithArray();
          expect(firstPageErrors).toMatchSnapshotWithArray();
        } catch (error) {
          throw error;
        } finally {
          await server.stop();
        }

        await server.start();

        const secondPage = await browserContext.newPage();

        try {
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
            secondConsoleMessages.map((message) => message.text()),
          ).toMatchSnapshotWithArray();
          expect(secondPageErrors).toMatchSnapshotWithArray();
        } catch (error) {
          throw error;
        } finally {
          await server.stop();
        }
      });
    });

    describe("Invalidate callback", () => {
      let compiler;
      let server;
      let pageErrors;
      let consoleMessages;

      beforeEach(async () => {
        compiler = webpack(config);

        pageErrors = [];
        consoleMessages = [];

        server = new Server({ port, static: false }, compiler);

        await server.start();
      });

      afterEach(async () => {
        await server.stop();
      });

      test("should use the default `noop` callback when invalidate is called without any callback", async ({
        page,
      }) => {
        const callback = sinon.spy();

        server.invalidate();
        server.middleware.context.callbacks[0] = callback;

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`http://127.0.0.1:${port}/`, {
          waitUntil: "networkidle0",
        });

        sinon.assert.calledOnce(callback);
        expect(response.status()).toMatchSnapshotWithArray();

        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshotWithArray();
        expect(pageErrors).toMatchSnapshotWithArray();
      });

      test("should use the provided `callback` function", async ({ page }) => {
        const callback = sinon.spy();

        server.invalidate(callback);

        const response = await page.goto(`http://127.0.0.1:${port}/`, {
          waitUntil: "networkidle0",
        });

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        sinon.assert.calledOnce(callback);
        expect(response.status()).toMatchSnapshotWithArray();

        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshotWithArray();

        expect(pageErrors).toMatchSnapshotWithArray();
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
                  }),
              ),
            Promise.resolve(),
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
                    compiler,
                  );

                  dummyServers.push(server);

                  server.startCallback(() => {
                    resolve();
                  });
                }),
            ),
          Promise.resolve(),
        );
      }

      test("should return the port when the port is specified", async () => {
        const retryCount = 1;

        process.env.WEBPACK_DEV_SERVER_PORT_RETRY = retryCount;

        const freePort = await Server.getFreePort(9082);

        expect(freePort).toEqual(9082);
      });

      // TODO: fails on windows
      test(
        "should return the port when the port is `null`",
        {
          annotation: {
            type: "fails",
            description:
              "https://github.com/webpack/webpack-dev-server/actions/runs/9932853499/job/27434779983",
          },
        },
        async ({ page }) => {
          const retryCount = 2;

          process.env.WEBPACK_DEV_SERVER_PORT_RETRY = retryCount;

          await createDummyServers(retryCount);

          const freePort = await Server.getFreePort(null);

          expect(freePort).toEqual(60000 + retryCount);

          const pageErrors = [];
          const consoleMessages = [];

          page
            .on("console", (message) => {
              consoleMessages.push(message);
            })
            .on("pageerror", (error) => {
              pageErrors.push(error);
            });

          const response = await page.goto(
            `http://127.0.0.1:${devServerPort}/`,
            {
              waitUntil: "networkidle0",
            },
          );

          expect(response.status()).toMatchSnapshotWithArray();

          expect(
            consoleMessages.map((message) => message.text()),
          ).toMatchSnapshotWithArray();

          expect(pageErrors).toMatchSnapshotWithArray();
        },
      );

      test("should return the port when the port is undefined", async ({
        page,
      }) => {
        const retryCount = 3;

        process.env.WEBPACK_DEV_SERVER_PORT_RETRY = retryCount;

        await createDummyServers(retryCount);

        // eslint-disable-next-line no-undefined
        const freePort = await Server.getFreePort(undefined);

        expect(freePort).toEqual(60000 + retryCount);

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

        expect(response.status()).toMatchSnapshotWithArray();

        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshotWithArray();

        expect(pageErrors).toMatchSnapshotWithArray();
      });

      test("should retry finding the port for up to defaultPortRetry times (number)", async ({
        page,
      }) => {
        const retryCount = 4;

        process.env.WEBPACK_DEV_SERVER_PORT_RETRY = retryCount;

        await createDummyServers(retryCount);

        const freePort = await Server.getFreePort();

        expect(freePort).toEqual(60000 + retryCount);

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

        expect(response.status()).toMatchSnapshotWithArray();

        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshotWithArray();

        expect(pageErrors).toMatchSnapshotWithArray();
      });

      test("should retry finding the port for up to defaultPortRetry times (string)", async ({
        page,
      }) => {
        const retryCount = 5;

        process.env.WEBPACK_DEV_SERVER_PORT_RETRY = retryCount;

        await createDummyServers(retryCount);

        const freePort = await Server.getFreePort();

        expect(freePort).toEqual(60000 + retryCount);

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

        expect(response.status()).toMatchSnapshotWithArray();

        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshotWithArray();

        expect(pageErrors).toMatchSnapshotWithArray();
      });

      test("should retry finding the port when serial ports are busy", async ({
        page,
      }) => {
        const busyPorts = [60000, 60001, 60002, 60003, 60004, 60005];

        process.env.WEBPACK_DEV_SERVER_PORT_RETRY = 1000;

        await createDummyServers(busyPorts);

        const freePort = await Server.getFreePort();

        expect(freePort).toBeGreaterThan(60005);

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

          const response = await page.goto(
            `http://127.0.0.1:${devServerPort}/`,
            {
              waitUntil: "networkidle0",
            },
          );

          expect(response.status()).toMatchSnapshotWithArray();

          expect(
            consoleMessages.map((message) => message.text()),
          ).toMatchSnapshotWithArray();

          expect(pageErrors).toMatchSnapshotWithArray();
        } catch (error) {
          throw error;
        }
      });

      test("should throw the error when the port isn't found", async () => {
        expect.assertions(1);

        const getPort = require("../../lib/getPort");
        sinon.stub(getPort, "call").rejects(new Error("busy"));

        process.env.WEBPACK_DEV_SERVER_PORT_RETRY = 1;

        try {
          await Server.getFreePort();
        } catch (error) {
          expect(error.message).toMatchSnapshotWithArray();
        }
      });
    });

    describe("Server.checkHostHeader", () => {
      test("should allow access for every requests using an IP", () => {
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

        tests.forEach((host) => {
          const headers = { host };

          if (!server.checkHeader(headers, "host")) {
            throw new Error("Validation didn't pass");
          }
        });
      });

      test('should allow URLs with scheme for checking origin when the "option.client.webSocketURL" is object', async ({
        page,
      }) => {
        const options = {
          port,
          client: {
            reconnect: false,
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

          const webSocketRequests = [];
          const session = await page.context().newCDPSession(page);

          session.on("Network.webSocketCreated", (payload) => {
            webSocketRequests.push(payload);
          });

          await session.send("Target.setAutoAttach", {
            autoAttach: true,
            flatten: true,
            waitForDebuggerOnStart: true,
          });

          sessionSubscribe(session);

          const response = await page.goto(`http://127.0.0.1:${port}/`, {
            waitUntil: "networkidle0",
          });

          if (!server.checkHeader(headers, "origin")) {
            throw new Error("Validation didn't fail");
          }

          await new Promise((resolve) => {
            const interval = setInterval(() => {
              const needFinish = consoleMessages.filter((message) =>
                /Trying to reconnect/.test(message.text()),
              );

              if (needFinish.length > 0) {
                clearInterval(interval);
                resolve();
              }
            }, 100);
          });

          expect(webSocketRequests[0].url).toMatchSnapshotWithArray();

          expect(response.status()).toMatchSnapshotWithArray();

          expect(
            // net::ERR_NAME_NOT_RESOLVED can be multiple times
            consoleMessages.map((message) => message.text()).slice(0, 7),
          ).toMatchSnapshotWithArray();

          expect(pageErrors).toMatchSnapshotWithArray();
        } catch (error) {
          throw error;
        } finally {
          await server.stop();
        }
      });
    });
  },
);
