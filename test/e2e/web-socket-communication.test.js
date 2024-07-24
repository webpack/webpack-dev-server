"use strict";

const webpack = require("webpack");
const WebSocket = require("ws");
const { describe, test } = require("@playwright/test");
const Server = require("../../lib/Server");
const { expect } = require("../helpers/playwright-custom-expects");
const WebsocketServer = require("../../lib/servers/WebsocketServer");
const config = require("../fixtures/client-config/webpack.config");
const port = require("../ports-map")["web-socket-communication"];

test.setTimeout(60_000);

describe("web socket communication", () => {
  const webSocketServers = ["ws", "sockjs"];
  webSocketServers.forEach((websocketServer) => {
    test(`should work and close web socket client connection when web socket server closed ("${websocketServer}")`, async ({
      page,
    }) => {
      WebsocketServer.heartbeatInterval = 100;

      const compiler = webpack(config);
      const devServerOptions = {
        port,
        webSocketServer: websocketServer,
      };
      const server = new Server(devServerOptions, compiler);

      await server.start();

      try {
        const pageErrors = [];
        const consoleMessages = [];

        page
          .on("console", (message) => {
            consoleMessages.push(message.text());
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        await page.goto(`http://127.0.0.1:${port}/`, {
          waitUntil: "networkidle0",
        });

        await server.stop();
        await new Promise((resolve) => {
          const interval = setInterval(() => {
            if (
              consoleMessages.includes("[webpack-dev-server] Disconnected!")
            ) {
              clearInterval(interval);

              resolve();
            }
          }, 100);
        });

        expect(consoleMessages).toMatchSnapshotWithArray();
        expect(pageErrors).toMatchSnapshotWithArray();
      } catch (error) {
        throw error;
      }
    });

    // TODO: test fails, is there sth wrong with the timeout?
    test.fixme(
      `should work and terminate client that is not alive ("${websocketServer}")`,
      async ({ page }) => {
        WebsocketServer.heartbeatInterval = 100;

        const compiler = webpack(config);
        const devServerOptions = {
          port,
          webSocketServer: websocketServer,
        };
        const server = new Server(devServerOptions, compiler);

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

          // Wait heartbeat
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 200);
          });

          expect(server.webSocketServer.clients.length).toBe(0);
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

    test(`should work and reconnect when the connection is lost ("${websocketServer}")`, async ({
      page,
    }) => {
      WebsocketServer.heartbeatInterval = 100;

      const compiler = webpack(config);
      const devServerOptions = {
        port,
        webSocketServer: websocketServer,
      };
      const server = new Server(devServerOptions, compiler);

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

        await server.stop();
        await server.start();

        await page.waitForNavigation({
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
  });

  test(`should work and do heartbeat using ("ws" web socket server)`, async () => {
    WebsocketServer.heartbeatInterval = 100;

    const compiler = webpack(config);
    const devServerOptions = {
      port,
      webSocketServer: "ws",
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    server.webSocketServer.heartbeatInterval = 100;

    await new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://127.0.0.1:${devServerOptions.port}/ws`, {
        headers: {
          host: `127.0.0.1:${devServerOptions.port}`,
          origin: `http://127.0.0.1:${devServerOptions.port}`,
        },
      });

      let opened = false;
      let received = false;

      ws.on("open", () => {
        opened = true;
      });

      ws.on("error", (error) => {
        reject(error);
      });

      ws.on("ping", () => {
        if (opened && received) {
          ws.close();
        }
      });

      ws.on("message", (data) => {
        const message = JSON.parse(data);

        if (message.type === "ok") {
          received = true;
        }
      });

      ws.on("close", () => {
        resolve();
      });
    });

    await server.stop();
  });
});
