"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map")["setup-middlewares-option"];

describe("setupMiddlewares option", () => {
  let compiler;
  let server;
  let page;
  let browser;
  let pageErrors;
  let consoleMessages;

  beforeEach(async () => {
    compiler = webpack(config);
    server = new Server(
      {
        setupMiddlewares: (middlewares, devServer) => {
          if (!devServer) {
            throw new Error("webpack-dev-server is not defined");
          }

          const sendResponses = (server) => {
            server.app.get("/setup-middleware/some/path", (_, response) => {
              response.send("setup-middlewares option GET");
            });

            server.app.post("/setup-middleware/some/path", (_, response) => {
              response.send("setup-middlewares option POST");
            });
          };

          middlewares.push(sendResponses(devServer));

          return middlewares;
        },
        port,
      },
      compiler
    );

    await server.start();

    ({ page, browser } = await runBrowser());

    pageErrors = [];
    consoleMessages = [];
  });

  afterEach(async () => {
    await browser.close();
    await server.stop();
  });

  it("should handle GET request to /setup-middleware/some/path route", async () => {
    page
      .on("console", (message) => {
        consoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    const response = await page.goto(
      `http://127.0.0.1:${port}/setup-middleware/some/path`,
      {
        waitUntil: "networkidle0",
      }
    );

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

  it("should handle POST request to /setup-middleware/some/path route", async () => {
    await page.setRequestInterception(true);

    page
      .on("console", (message) => {
        consoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      })
      .on("request", (interceptedRequest) => {
        interceptedRequest.continue({ method: "POST" });
      });

    const response = await page.goto(
      `http://127.0.0.1:${port}/setup-middleware/some/path`,
      {
        waitUntil: "networkidle0",
      }
    );

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
