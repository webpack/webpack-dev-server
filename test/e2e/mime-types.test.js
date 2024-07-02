"use strict";

const webpack = require("webpack");
const { test } = require("@playwright/test");
const { describe } = require("@playwright/test");
const { expect } = require("@playwright/test");
const { beforeEach, afterEach } = require("@playwright/test");
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

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(
        JSON.stringify(response.headers()["content-type"]),
      ).toMatchSnapshot();

      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
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

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(
        JSON.stringify(response.headers()["content-type"]),
      ).toMatchSnapshot();

      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });
});
