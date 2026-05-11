import { afterEach, beforeEach, describe, it } from "node:test";
import { expect } from "expect";
import requireFromString from "require-from-string";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import simpleConfig from "../fixtures/module-federation-config/webpack.config.js";
import multiConfig from "../fixtures/module-federation-config/webpack.multi.config.js";
import objectEntryConfig from "../fixtures/module-federation-config/webpack.object-entry.config.js";
import pluginConfig from "../fixtures/module-federation-config/webpack.plugin.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const port = portsMap["module-federation"];

describe("Module federation", () => {
  describe("should work with simple multi-entry config", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(simpleConfig);
      server = new Server({ port }, compiler);

      await server.start();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
    });

    it("should use the last entry export", async (t) => {
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

      const textContent = await response.text();

      expect(textContent).toContain("entry1");

      let exports;

      expect(() => {
        exports = requireFromString(textContent);
      }).not.toThrow();

      expect(exports).toBe("entry2");

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });
  });

  describe("should work with object multi-entry config", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(objectEntryConfig);
      server = new Server({ port }, compiler);

      await server.start();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
    });

    it("should use the last entry export", async (t) => {
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

      const textContent = await response.text();

      expect(textContent).toContain("entry1");

      let exports;

      expect(() => {
        exports = requireFromString(textContent);
      }).not.toThrow();

      expect(exports).toBe("entry2");

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should support the named entry export", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/foo.js`, {
        waitUntil: "networkidle0",
      });

      const textContent = await response.text();

      expect(textContent).not.toContain("entry2");

      let exports;

      expect(() => {
        exports = requireFromString(textContent);
      }).not.toThrow();

      expect(exports).toBe("entry1");

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });
  });

  describe("should work with multi compiler config", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(multiConfig);
      server = new Server({ port }, compiler);

      await server.start();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
    });

    it("should use the last entry export", async (t) => {
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

      const textContent = await response.text();

      expect(textContent).toContain("entry1");

      let exports;

      expect(() => {
        exports = requireFromString(textContent);
      }).not.toThrow();

      expect(exports).toBe("entry2");

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });
  });

  describe("should use plugin", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(pluginConfig);
      server = new Server({ port }, compiler);

      await server.start();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
    });

    it("should contain hot script in remoteEntry.js", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://localhost:${port}/remoteEntry.js`,
        {
          waitUntil: "networkidle0",
        },
      );

      const remoteEntryTextContent = await response.text();

      expect(remoteEntryTextContent).toMatch(/webpack\/hot\/dev-server\.js/);

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should contain hot script in main.js", async (t) => {
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

      const mainEntryTextContent = await response.text();

      expect(mainEntryTextContent).toMatch(/webpack\/hot\/dev-server\.js/);

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });
  });
});
