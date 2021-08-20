/**
 * @jest-environment node
 */

"use strict";

const path = require("path");
const WebSocket = require("ws");
const SockJS = require("sockjs-client");
const webpack = require("webpack");
const request = require("supertest");
const fs = require("graceful-fs");
const Server = require("../../lib/Server");
const reloadConfig = require("../fixtures/reload-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map")["hot-and-live-reload"];

const cssFilePath = path.resolve(
  __dirname,
  "../fixtures/reload-config/main.css"
);

const INVALID_MESSAGE = "[webpack-dev-server] App updated. Recompiling...";

describe("hot and live reload", () => {
  // "sockjs" client cannot add additional headers
  const modes = [
    {
      title: "should work and refresh content using hot module replacement",
    },
    {
      title: "should work and do nothing when web socket server disabled",
      options: {
        webSocketServer: false,
      },
    },
    // Default web socket serve ("ws")
    {
      title:
        "should work and refresh content using hot module replacement when hot enabled",
      options: {
        hot: true,
      },
    },
    {
      title:
        "should work and refresh content using hot module replacement when live reload enabled",
      options: {
        liveReload: true,
      },
    },
    {
      title: "should not refresh content when hot and no live reload disabled",
      options: {
        hot: false,
        liveReload: false,
      },
    },
    {
      title:
        "should work and refresh content using hot module replacement when live reload disabled and hot enabled",
      options: {
        liveReload: false,
        hot: true,
      },
    },
    {
      title: "should work and refresh content using live reload",
      options: {
        liveReload: true,
        hot: false,
      },
    },
    {
      title:
        "should work and refresh content using hot module replacement when live reload enabled and hot disabled",
      options: {
        liveReload: true,
        hot: true,
      },
    },
    // "ws" web socket serve
    {
      title:
        "should work and refresh content using hot module replacement when hot enabled",
      options: {
        webSocketServer: "ws",
        hot: true,
      },
    },
    {
      title:
        "should work and refresh content using hot module replacement when live reload enabled",
      options: {
        webSocketServer: "ws",
        liveReload: true,
      },
    },
    {
      title: "should not refresh content when hot and no live reload disabled",
      options: {
        webSocketServer: "ws",
        hot: false,
        liveReload: false,
      },
    },
    {
      title:
        "should work and refresh content using hot module replacement when live reload disabled and hot enabled",
      options: {
        webSocketServer: "ws",
        liveReload: false,
        hot: true,
      },
    },
    {
      title:
        "should work and refresh content using live reload when live reload enabled and hot disabled",
      options: {
        webSocketServer: "ws",
        liveReload: true,
        hot: false,
      },
    },
    {
      title:
        "should work and refresh content using hot module replacement when live reload and hot enabled",
      options: {
        webSocketServer: "ws",
        liveReload: true,
        hot: true,
      },
    },
    // "sockjs" web socket serve
    {
      title:
        "should work and refresh content using hot module replacement when hot enabled",
      options: {
        allowedHosts: "all",

        webSocketServer: "sockjs",
        hot: true,
      },
    },
    {
      title:
        "should work and refresh content using hot module replacement when live reload enabled",
      options: {
        allowedHosts: "all",

        webSocketServer: "sockjs",
        liveReload: true,
      },
    },
    {
      title: "should not refresh content when hot and no live reload disabled",
      options: {
        allowedHosts: "all",

        webSocketServer: "sockjs",
        hot: false,
        liveReload: false,
      },
    },
    {
      title:
        "should work and refresh content using hot module replacement when live reload disabled and hot enabled",
      options: {
        allowedHosts: "all",

        webSocketServer: "sockjs",
        liveReload: false,
        hot: true,
      },
    },
    {
      title:
        "should work and refresh content using live reload when live reload disabled and hot enabled",
      options: {
        allowedHosts: "all",

        webSocketServer: "sockjs",
        liveReload: true,
        hot: false,
      },
    },
    {
      title:
        "should work and refresh content using hot module replacement when live reload and hot enabled",
      options: {
        allowedHosts: "all",

        webSocketServer: "sockjs",
        liveReload: true,
        hot: true,
      },
    },
    {
      title:
        'should work and allow to disable hot module replacement using the "webpack-dev-server-hot=false"',
      query: "?webpack-dev-server-hot=false",
      options: {
        liveReload: true,
        hot: true,
      },
    },
    {
      title:
        'should work and allow to disable live reload using the "webpack-dev-server-live-reload=false"',
      query: "?webpack-dev-server-live-reload=false",
      options: {
        liveReload: true,
        hot: false,
      },
    },
    {
      title:
        'should work and allow to disable hot module replacement and live reload using the "webpack-dev-server-hot=false&webpack-dev-server-live-reload=false"',
      query:
        "?webpack-dev-server-hot=false&webpack-dev-server-live-reload=false",
      options: {
        liveReload: true,
        hot: true,
      },
    },
    {
      title: "should work with manual client setup",
      webpackOptions: {
        entry: [
          require.resolve("../../client-src/index.js"),
          require.resolve("../fixtures/reload-config/foo.js"),
        ],
      },
      options: {
        client: false,
        liveReload: true,
        hot: true,
      },
    },
    // TODO we still output logs from webpack, need to improve this
    {
      title:
        "should work with manual client setup and allow to enable hot module replacement",
      webpackOptions: {
        entry: [
          "webpack/hot/dev-server",
          `${require.resolve("../../client-src/index.js")}?hot=true`,
          require.resolve("../fixtures/reload-config/foo.js"),
        ],
        plugins: [new webpack.HotModuleReplacementPlugin()],
      },
      options: {
        client: false,
        liveReload: false,
        hot: false,
      },
    },
    {
      title:
        "should work with manual client setup and allow to disable hot module replacement",
      webpackOptions: {
        entry: [
          `${require.resolve("../../client-src/index.js")}?hot=false`,
          require.resolve("../fixtures/reload-config/foo.js"),
        ],
      },
      options: {
        client: false,
        liveReload: true,
        hot: true,
      },
    },
    {
      title:
        "should work with manual client setup and allow to enable live reload",
      webpackOptions: {
        entry: [
          `${require.resolve("../../client-src/index.js")}?live-reload=true`,
          require.resolve("../fixtures/reload-config/foo.js"),
        ],
      },
      options: {
        client: false,
        liveReload: false,
        hot: false,
      },
    },
    {
      title:
        "should work with manual client setup and allow to disable live reload",
      webpackOptions: {
        entry: [
          `${require.resolve("../../client-src/index.js")}?live-reload=false`,
          require.resolve("../fixtures/reload-config/foo.js"),
        ],
      },
      options: {
        client: false,
        liveReload: true,
        hot: false,
      },
    },
  ];

  modes.forEach((mode) => {
    const webSocketServerTitle =
      mode.options && mode.options.webSocketServer
        ? mode.options.webSocketServer
        : "default";

    it(`${mode.title} (${webSocketServerTitle})`, async () => {
      fs.writeFileSync(
        cssFilePath,
        "body { background-color: rgb(0, 0, 255); }"
      );

      const webpackOptions = { ...reloadConfig, ...mode.webpackOptions };
      const compiler = webpack(webpackOptions);
      const testDevServerOptions = mode.options || {};
      const devServerOptions = {
        port,
        ...testDevServerOptions,
      };
      const server = new Server(devServerOptions, compiler);

      await server.start();

      await new Promise((resolve, reject) => {
        request(`http://127.0.0.1:${devServerOptions.port}`)
          .get("/main")
          .expect(200, (error) => {
            if (error) {
              reject(error);

              return;
            }

            resolve();
          });
      });

      const webSocketServerLaunched =
        testDevServerOptions.webSocketServer !== false;

      await new Promise((resolve) => {
        const webSocketTransport =
          typeof testDevServerOptions.webSocketServer !== "undefined" &&
          testDevServerOptions.webSocketServer !== false
            ? testDevServerOptions.webSocketServer
            : "ws";

        if (webSocketTransport === "ws") {
          const ws = new WebSocket(
            `ws://127.0.0.1:${devServerOptions.port}/ws`,
            {
              headers: {
                host: `127.0.0.1:${devServerOptions.port}`,
                origin: `http://127.0.0.1:${devServerOptions.port}`,
              },
            }
          );

          let opened = false;
          let received = false;
          let errored = false;

          ws.on("error", (error) => {
            if (!webSocketServerLaunched && /404/.test(error)) {
              errored = true;
            } else {
              errored = true;
            }

            ws.close();
          });

          ws.on("open", () => {
            opened = true;
          });

          ws.on("message", (data) => {
            const message = JSON.parse(data);

            if (message.type === "ok") {
              received = true;

              ws.close();
            }
          });

          ws.on("close", () => {
            if (opened && received && !errored) {
              resolve();
            } else if (!webSocketServerLaunched && errored) {
              resolve();
            }
          });
        } else {
          const sockjs = new SockJS(
            `http://127.0.0.1:${devServerOptions.port}/ws`
          );

          let opened = false;
          let received = false;
          let errored = false;

          sockjs.onerror = () => {
            errored = true;
          };

          sockjs.onopen = () => {
            opened = true;
          };

          sockjs.onmessage = ({ data }) => {
            const message = JSON.parse(data);

            if (message.type === "ok") {
              received = true;

              sockjs.close();
            }
          };

          sockjs.onclose = (event) => {
            if (opened && received && !errored) {
              resolve();
            } else if (event && event.reason === "Cannot connect to server") {
              resolve();
            }
          };
        }
      });

      const { page, browser } = await runBrowser();

      const consoleMessages = [];
      const pageErrors = [];

      let doneHotUpdate = false;
      let hasDisconnectedMessage = false;

      page
        .on("console", (message) => {
          if (!hasDisconnectedMessage) {
            const text = message.text();

            hasDisconnectedMessage = /Disconnected!/.test(text);
            consoleMessages.push(text);
          }
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        })
        .on("request", (requestObj) => {
          if (/\.hot-update\.json$/.test(requestObj.url())) {
            doneHotUpdate = true;
          }
        });

      await page.goto(`http://localhost:${port}/main${mode.query || ""}`, {
        waitUntil: "networkidle0",
      });

      const backgroundColorBefore = await page.evaluate(() => {
        const body = document.body;

        return getComputedStyle(body)["background-color"];
      });

      expect(backgroundColorBefore).toEqual("rgb(0, 0, 255)");

      fs.writeFileSync(
        cssFilePath,
        "body { background-color: rgb(255, 0, 0); }"
      );

      let waitHot =
        typeof testDevServerOptions.hot !== "undefined"
          ? testDevServerOptions.hot
          : true;
      let waitLiveReload =
        typeof testDevServerOptions.liveReload !== "undefined"
          ? testDevServerOptions.liveReload
          : true;

      if (webSocketServerLaunched === false) {
        waitHot = false;
        waitLiveReload = false;
      }

      if (Array.isArray(webpackOptions.entry)) {
        if (webpackOptions.entry.some((item) => item.includes("hot=true"))) {
          waitHot = true;
        } else if (
          webpackOptions.entry.some((item) => item.includes("hot=false"))
        ) {
          waitHot = false;
        }
      }

      if (Array.isArray(webpackOptions.entry)) {
        if (
          webpackOptions.entry.some((item) => item.includes("live-reload=true"))
        ) {
          waitLiveReload = true;
        } else if (
          webpackOptions.entry.some((item) =>
            item.includes("live-reload=false")
          )
        ) {
          waitLiveReload = false;
        }
      }

      const query = mode.query || "";

      if (query.includes("webpack-dev-server-hot=false")) {
        waitHot = false;
      }

      if (query.includes("webpack-dev-server-live-reload=false")) {
        waitLiveReload = false;
      }

      if (waitHot) {
        await page.waitForFunction(
          () =>
            getComputedStyle(document.body)["background-color"] ===
            "rgb(255, 0, 0)"
        );

        expect(doneHotUpdate).toBe(true);
      } else if (waitLiveReload) {
        await page.waitForNavigation({
          waitUntil: "networkidle0",
        });
      } else if (webSocketServerLaunched) {
        await new Promise((resolve) => {
          const interval = setInterval(() => {
            if (consoleMessages.includes(INVALID_MESSAGE)) {
              clearInterval(interval);

              resolve();
            }
          }, 100);
        });
      }

      const backgroundColorAfter = await page.evaluate(() => {
        const body = document.body;

        return getComputedStyle(body)["background-color"];
      });

      if (!waitHot && !waitLiveReload) {
        expect(backgroundColorAfter).toEqual("rgb(0, 0, 255)");
      } else {
        expect(backgroundColorAfter).toEqual("rgb(255, 0, 0)");
      }

      expect(consoleMessages).toMatchSnapshot("console messages");
      expect(pageErrors).toMatchSnapshot("page errors");

      fs.unlinkSync(cssFilePath);

      await browser.close();
      await server.stop();
    });
  });
});
