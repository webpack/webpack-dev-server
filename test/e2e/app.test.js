"use strict";

const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const wdm = require("webpack-dev-middleware");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map").app;

const staticDirectory = path.resolve(
  __dirname,
  "../fixtures/static-config/public",
);

const apps = [
  ["express", () => require("express")(), "http"],
  ["express", () => require("express")(), "https"],
  ["express", () => require("express")(), "spdy"],
  ["connect", () => require("connect")(), "http"],
  ["connect", () => require("connect")(), "https"],
  ["connect", () => require("connect")(), "spdy"],
  ["connect", () => require("connect")(), "http2"],
  ["connect (async)", () => require("connect")(), "http"],
  [
    "hono",
    () => new (require("hono").Hono)(),
    (_, app) => require("@hono/node-server").serve({ fetch: app.fetch }),
    (_, devServer) => [
      {
        name: "webpack-dev-middleware",
        middleware: wdm.honoWrapper(devServer.compiler),
      },
    ],
  ],
  [
    "hono",
    () => new (require("hono").Hono)(),
    (_, app) =>
      require("@hono/node-server").serve({
        fetch: app.fetch,
        createServer: require("node:https").createServer,
        serverOptions: {
          key: fs.readFileSync(
            path.resolve(__dirname, "../fixtures/ssl/localhost-privkey.pem"),
          ),
          cert: fs.readFileSync(
            path.resolve(__dirname, "../fixtures/ssl/localhost-cert.pem"),
          ),
        },
      }),
    (_, devServer) => [
      {
        name: "webpack-dev-middleware",
        middleware: wdm.honoWrapper(devServer.compiler),
      },
    ],
  ],
  [
    "hono",
    () => new (require("hono").Hono)(),
    {
      type: (options, app) =>
        require("@hono/node-server").serve({
          fetch: app.fetch,
          createServer: require("node:http2").createSecureServer,
          serverOptions: options,
        }),
      options: {
        allowHTTP1: true,
        key: fs.readFileSync(
          path.resolve(__dirname, "../fixtures/ssl/localhost-privkey.pem"),
        ),
        cert: fs.readFileSync(
          path.resolve(__dirname, "../fixtures/ssl/localhost-cert.pem"),
        ),
      },
    },
    (_, devServer) => [
      {
        name: "webpack-dev-middleware",
        middleware: wdm.honoWrapper(devServer.compiler),
      },
    ],
  ],
];

describe("app option", () => {
  for (const [appName, app, server, setupMiddlewares] of apps) {
    let compiler;
    let devServer;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    describe(`should work using "${appName}" application and "${typeof server === "function" ? "custom server" : server}" server`, () => {
      beforeEach(async () => {
        compiler = webpack(config);

        devServer = new Server(
          {
            static: {
              directory: staticDirectory,
              watch: false,
            },
            app,
            server,
            port,
            setupMiddlewares:
              typeof setupMiddlewares !== "undefined"
                ? setupMiddlewares
                : // eslint-disable-next-line no-undefined
                  undefined,
          },
          compiler,
        );

        await devServer.start();

        ({ page, browser } = await runBrowser());

        pageErrors = [];
        consoleMessages = [];
      });

      afterEach(async () => {
        await browser.close();
        await devServer.stop();
        await new Promise((resolve) => {
          compiler.close(() => {
            resolve();
          });
        });
      });

      it("should handle GET request to index route (/)", async () => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const pageUrl = devServer.isTlsServer
          ? `https://127.0.0.1:${port}/`
          : `http://127.0.0.1:${port}/`;

        const response = await page.goto(pageUrl, {
          waitUntil: "networkidle0",
        });

        const HTTPVersion = await page.evaluate(
          () => performance.getEntries()[0].nextHopProtocol,
        );

        if (
          server === "spdy" ||
          server === "http2" ||
          (server.options && server.options.allowHTTP1)
        ) {
          expect(HTTPVersion).toEqual("h2");
        } else {
          expect(HTTPVersion).toEqual("http/1.1");
        }

        expect(response.status()).toMatchSnapshot("response status");
        expect(await response.text()).toMatchSnapshot("response text");
        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshot("console messages");
        expect(pageErrors).toMatchSnapshot("page errors");
      });
    });
  }
});
