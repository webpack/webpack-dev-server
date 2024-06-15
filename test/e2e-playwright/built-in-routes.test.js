"use strict";

const webpack = require("webpack");
const { test } = require("@playwright/test");
const { expect } = require("@playwright/test");
const { describe } = require("@playwright/test");
const { afterEach } = require("@playwright/test");
const { beforeEach } = require("@playwright/test");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const multiConfig = require("../fixtures/multi-public-path-config/webpack.config");
const port = require("../ports-map").routes;

describe("Built in routes", () => {
  describe("with simple config", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);
      server = new Server({ port }, compiler);

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await server.stop();
    });

    test("should handles GET request to sockjs bundle", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}/__webpack_dev_server__/sockjs.bundle.js`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.headers()["content-type"])).toMatchSnapshot();

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });

    test("should handles HEAD request to sockjs bundle", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        })
        .on("request", (interceptedRequest) => {
          if (interceptedRequest.isInterceptResolutionHandled()) return;

          interceptedRequest.continue({ method: "HEAD" }, 10);
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}/__webpack_dev_server__/sockjs.bundle.js`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.headers()["content-type"])).toMatchSnapshot();

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });

    test("should handle GET request to invalidate endpoint", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}/webpack-dev-server/invalidate`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.headers()["content-type"])).not.toEqual("text/html");

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });

    test("should handle GET request to directory index and list all middleware directories", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}/webpack-dev-server/`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.headers()["content-type"])).toMatchSnapshot();

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(await response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });

    test("should handle HEAD request to directory index", async ({ page }) => {
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
        `http://127.0.0.1:${port}/webpack-dev-server/`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.headers()["content-type"])).toMatchSnapshot();

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(await response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });

    test("should handle GET request to magic async chunk", async ({ page }) => {
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

      expect(JSON.stringify(response.headers()["content-type"])).toMatchSnapshot();

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();
    });

    test("should handle HEAD request to magic async chunk", async ({ page }) => {
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

      const response = await page.goto(`http://127.0.0.1:${port}/main.js`, {
        waitUntil: "networkidle0",
      });

      expect(JSON.stringify(response.headers()["content-type"])).toMatchSnapshot();

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();
    });
  });

  describe("with multi config", () => {
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

    test("should handle GET request to directory index and list all middleware directories", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}/webpack-dev-server/`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.headers()["content-type"])).toMatchSnapshot();

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(await response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });
});
