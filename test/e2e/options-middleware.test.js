"use strict";

const webpack = require("webpack");
const Express = require("express");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map")["options-request-response"];

const createWaiting = () => {
  let reslove;
  let reject;
  const waiting = new Promise((resolve$, reject$) => {
    reslove = resolve$;
    reject = reject$;
  });
  return {
    reslove,
    reject,
    waiting,
  };
};

describe("handle options-request correctly", () => {
  it("should response with 200 http code", async () => {
    const compiler = webpack(config);
    const [portForServer, portForApp] = port;
    const closeApp = await (async () => {
      const { reslove, waiting } = createWaiting();
      const app = new Express();
      app.get("/", (req, res) => {
        res.sendStatus(200);
      });
      const server = app.listen(portForApp, () => {
        reslove();
      });
      await waiting;
      return async () => {
        const { reslove: reslove2, waiting: waiting2 } = createWaiting();
        server.close(() => {
          reslove2();
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
      compiler
    );
    await server.start();
    const { page, browser } = await runBrowser();
    const prefixUrl = "http://127.0.0.1";
    const htmlUrl = `${prefixUrl}:${portForServer}/test.html`;
    const appUrl = `${prefixUrl}:${portForApp}`;
    await page.goto(appUrl);
    const responseStatus = [];
    page.on("response", (res) => {
      responseStatus.push(res.status());
    });
    await page.evaluate(
      (url) =>
        window.fetch(url, {
          headers: {
            "another-header": "1",
          },
        }),
      htmlUrl
    );
    await browser.close();
    await server.stop();
    await closeApp();
    expect(responseStatus).toEqual([204, 200]);
  });
});
