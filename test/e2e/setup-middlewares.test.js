import { afterEach, beforeEach, describe, it } from "node:test";

import webpack from "webpack";
import Server from "../../lib/Server.js";
import config from "../fixtures/client-config/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const port = portsMap["setup-middlewares-option"];

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

  it("should handle GET request to /setup-middleware/some/path route", async (t) => {
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

    t.assert.snapshot(response.headers()["content-type"]);
    t.assert.snapshot(response.status());
    t.assert.snapshot(await response.text());

    const response1 = await page.goto(`http://localhost:${port}/foo/bar`, {
      waitUntil: "networkidle0",
    });

    t.assert.snapshot(response1.headers()["content-type"]);
    t.assert.snapshot(response1.status());
    t.assert.snapshot(await response1.text());

    const response2 = await page.goto(`http://localhost:${port}/foo/bar/baz`, {
      waitUntil: "networkidle0",
    });

    t.assert.snapshot(response2.headers()["content-type"]);
    t.assert.snapshot(response2.status());
    t.assert.snapshot(await response2.text());

    const response3 = await page.goto(
      `http://localhost:${port}/setup-middleware/unknown`,
      {
        waitUntil: "networkidle0",
      },
    );

    t.assert.snapshot(response3.headers()["content-type"]);
    t.assert.snapshot(response3.status());
    t.assert.snapshot(await response3.text());

    t.assert.snapshot(consoleMessages.map((message) => message.text()));
    t.assert.snapshot(pageErrors);
  });

  it("should handle POST request to /setup-middleware/some/path route", async (t) => {
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

    t.assert.snapshot(response.headers()["content-type"]);
    t.assert.snapshot(response.status());
    t.assert.snapshot(await response.text());
    t.assert.snapshot(consoleMessages.map((message) => message.text()));
    t.assert.snapshot(pageErrors);
  });
});
