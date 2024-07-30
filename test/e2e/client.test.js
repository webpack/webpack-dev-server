"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const { test } = require("../helpers/playwright-test");
const { expect } = require("../helpers/playwright-custom-expects");
const config = require("../fixtures/simple-config-other/webpack.config");
const port = require("../ports-map")["client-option"];

test.describe("client option", () => {
  test.describe("default behaviour", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    test.beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          client: {
            webSocketTransport: "sockjs",
          },
          webSocketServer: "sockjs",
          port,
        },
        compiler,
      );

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    test.afterEach(async () => {
      await server.stop();
    });

    test("responds with a 200 status code for /ws path", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/ws`, {
        waitUntil: "networkidle0",
      });

      // overlay should be true by default
      expect(server.options.client.overlay).toBe(true);

      expect(response.status()).toEqual(200);

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });
  });

  test.describe("should respect path option", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    test.beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          client: {
            webSocketTransport: "sockjs",
          },
          webSocketServer: {
            type: "sockjs",
            options: {
              host: "localhost",
              port,
              path: "/foo/test/bar",
            },
          },
          port,
        },
        compiler,
      );

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    test.afterEach(async () => {
      await server.stop();
    });

    test("responds with a 200 status code for /foo/test/bar path", async ({
      page,
    }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}/foo/test/bar`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(response.status()).toEqual(200);

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });
  });

  test.describe("configure client entry", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    test.beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          client: false,
          port,
        },
        compiler,
      );

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    test.afterEach(async () => {
      await server.stop();
    });

    test("should disable client entry", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/main.js`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      expect(await response.text()).not.toMatch(/client\/index\.js/);

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });
  });

  test.describe("webSocketTransport", () => {
    const clientModes = [
      {
        title: 'as a string ("sockjs")',
        client: {
          webSocketTransport: "sockjs",
        },
        webSocketServer: "sockjs",
        shouldThrow: false,
      },
      {
        title: 'as a string ("ws")',
        client: {
          webSocketTransport: "ws",
        },
        webSocketServer: "ws",
        shouldThrow: false,
      },
      {
        title: 'as a path ("sockjs")',
        client: {
          webSocketTransport: require.resolve(
            "../../client-src/clients/SockJSClient",
          ),
        },
        webSocketServer: "sockjs",
        shouldThrow: false,
      },
      {
        title: 'as a path ("ws")',
        client: {
          webSocketTransport: require.resolve(
            "../../client-src/clients/WebSocketClient",
          ),
        },
        webSocketServer: "ws",
        shouldThrow: false,
      },
      {
        title: "as a nonexistent path (sockjs)",
        client: {
          webSocketTransport: "/bad/path/to/implementation",
        },
        webSocketServer: "sockjs",
        shouldThrow: true,
      },
      {
        title: "as a nonexistent path (ws)",
        client: {
          webSocketTransport: "/bad/path/to/implementation",
        },
        webSocketServer: "ws",
        shouldThrow: true,
      },
    ];

    test.describe("passed to server", () => {
      clientModes.forEach((data) => {
        test(`${data.title} ${
          data.shouldThrow ? "should throw" : "should not throw"
        }`, async () => {
          const compiler = webpack(config);

          const server = new Server(
            {
              client: data.client,
              port,
            },
            compiler,
          );

          let thrownError;

          try {
            await server.start();
          } catch (error) {
            thrownError = error;
          }

          if (data.shouldThrow) {
            expect(thrownError.message).toMatch(
              /client\.webSocketTransport must be a string/,
            );
          }

          await server.stop();
        });
      });
    });
  });
});
