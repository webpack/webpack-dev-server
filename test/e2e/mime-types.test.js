"use strict";

const webpack = require("webpack");
const { describe, beforeEach, afterEach, test } = require("@playwright/test");
const { expect } = require("../helpers/playwright-custom-expects");
const Server = require("../../lib/Server");
const config = require("../fixtures/mime-types-config/webpack.config");
const port = require("../ports-map")["mime-types-option"];

describe("mimeTypes option", () => {
  describe("as an object with a remapped type", () => {
    let compiler;
    let server;
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

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await server.stop();
    });

    test("should request file with different js mime type", async ({
      page,
    }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/main.js`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshotWithArray();

      expect(
        response.headers()["content-type"],
      ).toMatchSnapshotWithArray();

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshotWithArray();

      expect(pageErrors).toMatchSnapshotWithArray();
    });
  });

  describe("as an object with a custom type", () => {
    let compiler;
    let server;
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

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await server.stop();
    });

    test("should request file with different js mime type", async ({
      page,
    }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/file.custom`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshotWithArray();

      expect(
        response.headers()["content-type"],
      ).toMatchSnapshotWithArray();

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray();

      expect(pageErrors).toMatchSnapshotWithArray();
    });
  });
});
