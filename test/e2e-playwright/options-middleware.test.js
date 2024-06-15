"use strict";

const webpack = require("webpack");
const { test } = require("@playwright/test");
const { expect } = require("@playwright/test");
const { describe } = require("@playwright/test");
const Express = require("express");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const port = require("../ports-map")["options-request-response"];

const createWaiting = () => {
  let resolve;
  let reject;

  const waiting = new Promise((resolve$, reject$) => {
    resolve = resolve$;
    reject = reject$;
  });

  return {
    resolve,
    reject,
    waiting,
  };
};

describe("handle options-request correctly", () => {
  test("should response with 200 http code", async ({ page }) => {
    const compiler = webpack(config);
    const [portForServer, portForApp] = port;
    const closeApp = await (async () => {
      const { resolve, waiting } = createWaiting();
      const app = new Express();

      app.get("/", (req, res) => {
        res.sendStatus(200);
      });

      const server = app.listen(portForApp, () => {
        resolve();
      });

      await waiting;

      return async () => {
        const { resolve: resolve2, waiting: waiting2 } = createWaiting();

        server.close(() => {
          resolve2();
        });

        await waiting2;
      };
    })();
    const server = new Server(
      {
        port: portForServer,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
        },
      },
      compiler,
    );

    await server.start();

    const prefixUrl = "http://127.0.0.1";
    const htmlUrl = `${prefixUrl}:${portForServer}/test.html`;
    const appUrl = `${prefixUrl}:${portForApp}`;

    try {
      const responseStatus = [];

      page.on("response", (res) => {
        if (/test\.html$/.test(res.url())) {
          responseStatus.push(res.status());
        }
      });

      await page.goto(appUrl, {
        waitUntil: "networkidle0",
      });

      await page.evaluate(
        (url) =>
          // eslint-disable-next-line no-undef
          window.fetch(url, {
            headers: {
              "another-header": "1",
            },
          }),
        htmlUrl,
      );

      expect(responseStatus.sort()).toEqual([200, 204]);
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
      await closeApp();
    }
  });
});
