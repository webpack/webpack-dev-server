"use strict";

const { afterEach, beforeEach, describe, it } = require("node:test");

const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/mime-types-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map")["mime-types-option"];

describe("mimeTypes option", { concurrency: 1 }, () => {
  describe("as an object with a remapped type", () => {
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
          devMiddleware: {
            mimeTypes: {
              js: "text/plain",
            },
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

    it("should request file with different js mime type", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/main.js`, {
        waitUntil: "networkidle0",
      });

      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );

      await t.test("response headers content-type", async (t) =>
        t.assert.snapshot(response.headers()["content-type"]),
      );

      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );

      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    });
  });

  describe("as an object with a custom type", () => {
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
          devMiddleware: {
            mimeTypes: {
              custom: "text/html",
            },
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

    it("should request file with different js mime type", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/file.custom`, {
        waitUntil: "networkidle0",
      });

      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );

      await t.test("response headers content-type", async (t) =>
        t.assert.snapshot(response.headers()["content-type"]),
      );

      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );

      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    });
  });
});
