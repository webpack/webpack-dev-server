import { afterEach, beforeEach, describe, it } from "node:test";
import { expect } from "expect";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import config from "../fixtures/client-config/webpack.config.js";
import multiConfig from "../fixtures/multi-public-path-config/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const port = portsMap.routes;

describe("Built in routes", () => {
  describe("with simple config", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);
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

    it("should handle GET request to invalidate endpoint", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://localhost:${port}/webpack-dev-server/invalidate`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(response.headers()["content-type"]).not.toBe("text/html");

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should handle GET request to directory index and list all middleware directories", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://localhost:${port}/webpack-dev-server/`,
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

    it("should handle HEAD request to directory index", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        })
        .on("request", (interceptedRequest) => {
          if (interceptedRequest.isInterceptResolutionHandled()) return;

          interceptedRequest.continue({ method: "HEAD" });
        });

      const response = await page.goto(
        `http://localhost:${port}/webpack-dev-server/`,
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

    it("should handle GET request to magic async chunk", async (t) => {
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

      t.assert.snapshot(response.headers()["content-type"]);

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));
    });

    it("should handle HEAD request to magic async chunk", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        })
        .on("request", (interceptedRequest) => {
          if (interceptedRequest.isInterceptResolutionHandled()) return;

          interceptedRequest.continue({ method: "HEAD" });
        });

      const response = await page.goto(`http://localhost:${port}/main.js`, {
        waitUntil: "networkidle0",
      });

      t.assert.snapshot(response.headers()["content-type"]);

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));
    });
  });

  describe("with multi config", () => {
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

    it("should handle GET request to directory index and list all middleware directories", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://localhost:${port}/webpack-dev-server/`,
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
});
