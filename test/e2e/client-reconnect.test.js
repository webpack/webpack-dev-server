"use strict";

const webpack = require("webpack");
const { test } = require("@playwright/test");
const { expect } = require("@playwright/test");
const { describe } = require("@playwright/test");
const { beforeEach } = require("@playwright/test");
const Server = require("../../lib/Server");
const config = require("../fixtures/simple-config/webpack.config");
const port = require("../ports-map")["client-reconnect-option"];

describe("client.reconnect option", () => {
  describe("specified as true", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server({ port, client: { reconnect: true } }, compiler);

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    test("should try to reconnect unlimited times", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      try {
        expect(JSON.stringify(response.status())).toMatchSnapshot();
      } catch (error) {
        throw error;
      } finally {
        await server.stop();
      }

      let interval;

      await new Promise((resolve) => {
        interval = setInterval(() => {
          const retryingMessages = consoleMessages.filter((message) =>
            message.text().includes("Trying to reconnect..."),
          );

          if (retryingMessages.length >= 5) {
            clearInterval(interval);

            resolve();
          }
        }, 1000);
      });

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("specified as false", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server({ port, client: { reconnect: false } }, compiler);

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    test("should not try to reconnect", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      try {
        expect(JSON.stringify(response.status())).toMatchSnapshot();
      } catch (error) {
        throw error;
      } finally {
        await server.stop();
      }

      // Can't wait to check for unlimited times so wait only for couple retries
      await new Promise((resolve) =>
        setTimeout(
          () => {
            resolve();
          },
          // eslint-disable-next-line no-restricted-properties
          1000 * Math.pow(2, 3),
        ),
      );

      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("specified as number", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server({ port, client: { reconnect: 2 } }, compiler);

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    test("should try to reconnect 2 times", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      try {
        expect(JSON.stringify(response.status())).toMatchSnapshot();
      } catch (error) {
        throw error;
      } finally {
        await server.stop();
      }

      // Can't wait to check for unlimited times so wait only for couple retries
      await new Promise((resolve) =>
        setTimeout(
          () => {
            resolve();
          },
          // eslint-disable-next-line no-restricted-properties
          1000 * Math.pow(2, 3),
        ),
      );

      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });
});
