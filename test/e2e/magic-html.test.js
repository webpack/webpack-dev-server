"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map")["magic-html-option"];

describe("magicHtml option", () => {
  describe("enabled", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);
      server = new Server({ port, magicHtml: true }, compiler);

      await server.start();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
    });

    it("should handle GET request to magic async html", async () => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/main`, {
        waitUntil: "networkidle0",
      });

      expect(response.headers()["content-type"]).toMatchSnapshot(
        "response headers content-type"
      );

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
    });

    it("should handle HEAD request to magic async html", async () => {
      await page.setRequestInterception(true);

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        })
        .on("request", (interceptedRequest) => {
          interceptedRequest.continue({ method: "HEAD" });
        });

      const response = await page.goto(`http://127.0.0.1:${port}/main`, {
        waitUntil: "networkidle0",
      });

      expect(response.headers()["content-type"]).toMatchSnapshot(
        "response headers content-type"
      );

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
    });
  });

  describe("disabled", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);
      server = new Server({ port, magicHtml: false }, compiler);

      await server.start();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
    });

    it("should not handle GET request to magic async html", async () => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/main`, {
        waitUntil: "networkidle0",
      });

      expect(response.headers()["content-type"]).toMatchSnapshot(
        "response headers content-type"
      );

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
    });

    it("should not handle HEAD request to magic async html", async () => {
      await page.setRequestInterception(true);

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        })
        .on("request", (interceptedRequest) => {
          interceptedRequest.continue({ method: "HEAD" });
        });

      const response = await page.goto(`http://127.0.0.1:${port}/main`, {
        waitUntil: "networkidle0",
      });

      expect(response.headers()["content-type"]).toMatchSnapshot(
        "response headers content-type"
      );

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
    });
  });
});
