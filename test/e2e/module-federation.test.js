"use strict";

const webpack = require("webpack");
const requireFromString = require("require-from-string");
const { test } = require("@playwright/test");
const { describe } = require("@playwright/test");
const { expect } = require("@playwright/test");
const { beforeEach, afterEach } = require("@playwright/test");
const Server = require("../../lib/Server");
const simpleConfig = require("../fixtures/module-federation-config/webpack.config");
const objectEntryConfig = require("../fixtures/module-federation-config/webpack.object-entry.config");
const multiConfig = require("../fixtures/module-federation-config/webpack.multi.config");
const port = require("../ports-map")["module-federation"];
const pluginConfig = require("../fixtures/module-federation-config/webpack.plugin");

describe("Module federation", () => {
  describe("should work with simple multi-entry config", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(simpleConfig);
      server = new Server({ port }, compiler);

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await server.stop();
    });

    test("should use the last entry export", async ({ page }) => {
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

      const textContent = await response.text();

      expect(textContent).toContain("entry1");

      let exports;

      expect(() => {
        exports = requireFromString(textContent);
      }).not.toThrow();

      expect(exports).toEqual("entry2");

      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("should work with object multi-entry config", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(objectEntryConfig);
      server = new Server({ port }, compiler);

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await server.stop();
    });

    test("should use the last entry export", async ({ page }) => {
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

      const textContent = await response.text();

      expect(textContent).toContain("entry1");

      let exports;

      expect(() => {
        exports = requireFromString(textContent);
      }).not.toThrow();

      expect(exports).toEqual("entry2");

      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });

    test("should support the named entry export", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/foo.js`, {
        waitUntil: "networkidle0",
      });

      const textContent = await response.text();

      expect(textContent).not.toContain("entry2");

      let exports;

      expect(() => {
        exports = requireFromString(textContent);
      }).not.toThrow();

      expect(exports).toEqual("entry1");

      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("should work with multi compiler config", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(multiConfig);
      server = new Server({ port }, compiler);

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await server.stop();
    });

    test("should use the last entry export", async ({ page }) => {
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

      const textContent = await response.text();

      expect(textContent).toContain("entry1");

      let exports;

      expect(() => {
        exports = requireFromString(textContent);
      }).not.toThrow();

      expect(exports).toEqual("entry2");

      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("should use plugin", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(pluginConfig);
      server = new Server({ port }, compiler);

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await server.stop();
    });

    test("should contain hot script in remoteEntry.js", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}/remoteEntry.js`,
        {
          waitUntil: "networkidle0",
        },
      );

      const remoteEntryTextContent = await response.text();

      expect(remoteEntryTextContent).toMatch(/webpack\/hot\/dev-server\.js/);

      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });

    test("should contain hot script in main.js", async ({ page }) => {
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

      const mainEntryTextContent = await response.text();

      expect(mainEntryTextContent).toMatch(/webpack\/hot\/dev-server\.js/);

      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });
});
