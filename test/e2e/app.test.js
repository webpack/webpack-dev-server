import fs from "node:fs";
import { createSecureServer } from "node:http2";
import { createServer as createHttpsServer } from "node:https";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { createAdaptorServer } from "@hono/node-server";
import connect from "connect";
import { expect } from "expect";
import express from "express";
import { Hono } from "hono";
import webpack from "webpack";
import wdm from "webpack-dev-middleware";
import Server from "../../lib/Server.js";
import config from "../fixtures/client-config/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const port = portsMap.app;

const staticDirectory = path.resolve(
  __dirname,
  "../fixtures/static-config/public",
);

const apps = [
  ["express", () => express(), "http"],
  ["express", () => express(), "https"],
  ["connect", () => connect(), "http"],
  ["connect", () => connect(), "https"],
  ["connect", () => connect(), "http2"],
  ["connect (async)", () => connect(), "http"],
  [
    "hono",
    () => new Hono(),
    (options, app) =>
      createAdaptorServer({
        fetch: app.fetch,
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
    () => new Hono(),
    (_, app) =>
      createAdaptorServer({
        fetch: app.fetch,
        createServer: createHttpsServer,
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
    () => new Hono(),
    {
      type: (options, app) =>
        createAdaptorServer({
          fetch: app.fetch,
          createServer: createSecureServer,
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
                : undefined,
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
          ? `https://localhost:${port}/`
          : `http://localhost:${port}/`;

        const response = await page.goto(pageUrl, {
          waitUntil: "networkidle0",
        });

        const HTTPVersion = await page.evaluate(
          () => performance.getEntries()[0].nextHopProtocol,
        );

        if (
          server === "http2" ||
          (server.options && server.options.allowHTTP1)
        ) {
          expect(HTTPVersion).toBe("h2");
        } else {
          expect(HTTPVersion).toBe("http/1.1");
        }

        expect(response.status()).toBe(200);

        const text = await response.text();

        expect(text).toContain(
          '<script type="text/javascript" charset="utf-8" src="/main.js"></script>',
        );
        expect(consoleMessages.map((message) => message.text())).toEqual([
          "[webpack-dev-server] Server started: Hot Module Replacement enabled, Live Reloading enabled, Progress disabled, Overlay enabled.",
          "[HMR] Waiting for update signal from WDS...",
          "Hey.",
        ]);
        expect(pageErrors).toHaveLength(0);
      });
    });
  }
});
