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

          devServer.app.use("/setup-middleware/some/path", (req, res, next) => {
            if (req.method === "GET") {
              res.setHeader("Content-Type", "text/html; charset=utf-8");
              res.end("setup-middlewares option GET");
              return;
            } else if (req.method === "POST") {
              res.setHeader("Content-Type", "text/html; charset=utf-8");
              res.end("setup-middlewares option POST");
              return;
            }

            return next();
          });

          middlewares.push({
            name: "hello-world-test-two",
            middleware: (req, res, next) => {
              if (req.url !== "/foo/bar/baz") {
                next();
                return;
              }

              res.setHeader("Content-Type", "text/html; charset=utf-8");
              res.end("Hello World without path!");
            },
          });
          middlewares.push({
            name: "hello-world-test-one",
            path: "/foo/bar",
            middleware: (req, res) => {
              res.setHeader("Content-Type", "text/html; charset=utf-8");
              res.end("Hello World with path!");
            },
          });
          middlewares.push((req, res) => {
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.end("Hello World as function!");
          });

          return middlewares;
        },
        port,
      },
      compiler,
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
      `http://localhost:${port}/setup-middleware/some/path`,
      {
        waitUntil: "networkidle0",
      },
    );

    expect(response.headers()["content-type"]).toMatchSnapshot(
      "response headers content-type",
    );
    expect(response.status()).toMatchSnapshot("response status");
    expect(await response.text()).toMatchSnapshot("response text");

    const response1 = await page.goto(`http://localhost:${port}/foo/bar`, {
      waitUntil: "networkidle0",
    });

    expect(response1.headers()["content-type"]).toMatchSnapshot(
      "response headers content-type",
    );
    expect(response1.status()).toMatchSnapshot("response status");
    expect(await response1.text()).toMatchSnapshot("response text");

    const response2 = await page.goto(`http://localhost:${port}/foo/bar/baz`, {
      waitUntil: "networkidle0",
    });

    expect(response2.headers()["content-type"]).toMatchSnapshot(
      "response headers content-type",
    );
    expect(response2.status()).toMatchSnapshot("response status");
    expect(await response2.text()).toMatchSnapshot("response text");

    const response3 = await page.goto(
      `http://localhost:${port}/setup-middleware/unknown`,
      {
        waitUntil: "networkidle0",
      },
    );

    expect(response3.headers()["content-type"]).toMatchSnapshot(
      "response headers content-type",
    );
    expect(response3.status()).toMatchSnapshot("response status");
    expect(await response3.text()).toMatchSnapshot("response text");

    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      "console messages",
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
        if (interceptedRequest.isInterceptResolutionHandled()) return;

        interceptedRequest.continue({ method: "POST" });
      });

    const response = await page.goto(
      `http://localhost:${port}/setup-middleware/some/path`,
      {
        waitUntil: "networkidle0",
      },
    );

    expect(response.headers()["content-type"]).toMatchSnapshot(
      "response headers content-type",
    );
    expect(response.status()).toMatchSnapshot("response status");
    expect(await response.text()).toMatchSnapshot("response text");
    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      "console messages",
    );
    expect(pageErrors).toMatchSnapshot("page errors");
  });
});
