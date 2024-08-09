"use strict";

const webpack = require("webpack");
const { test } = require("../helpers/playwright-test");
const { expect } = require("../helpers/playwright-custom-expects");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const multiConfig = require("../fixtures/multi-public-path-config/webpack.config");
const port = require("../ports-map").routes;

test.describe("Built in routes", () => {
  test.describe("with simple config", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    test.beforeEach(async () => {
      compiler = webpack(config);
      server = new Server({ port }, compiler);

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    test.afterEach(async () => {
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

      expect(response.headers()["content-type"]).toMatchSnapshotWithArray(
        "response headers",
      );

      expect(response.status()).toEqual(200);

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });

    test("should handles HEAD request to sockjs bundle", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.route("**/*", (route) => {
        route.continue({ method: "HEAD" });
      });

      const response = await page.goto(
        `http://127.0.0.1:${port}/__webpack_dev_server__/sockjs.bundle.js`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(response.headers()["content-type"]).toMatchSnapshotWithArray(
        "response headers",
      );

      expect(response.status()).toEqual(200);

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });

    test("should handle GET request to invalidate endpoint", async ({
      page,
    }) => {
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

      expect(response.headers()["content-type"]).not.toEqual("text/html");

      expect(response.status()).toEqual(200);

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });

    test("should handle GET request to directory index and list all middleware directories", async ({
      page,
    }) => {
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

      expect(response.headers()["content-type"]).toMatchSnapshotWithArray(
        "response headers",
      );

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });

    test("should handle HEAD request to directory index", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.route("**/*", (route) => {
        route.continue({ method: "HEAD" });
      });

      const response = await page.goto(
        `http://127.0.0.1:${port}/webpack-dev-server/`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(response.headers()["content-type"]).toMatchSnapshotWithArray(
        "response headers",
      );

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
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

      expect(response.headers()["content-type"]).toMatchSnapshotWithArray(
        "response headers",
      );

      expect(response.status()).toEqual(200);

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });

    // FIXME: improve it
    test("should handle HEAD request to magic async chunk", async ({
      page,
    }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.route("**/*", (route) => {
        route.continue({ method: "HEAD" });
      });

      const response = await page.goto(`http://127.0.0.1:${port}/main.js`, {
        waitUntil: "networkidle0",
      });

      expect(response.headers()["content-type"]).toMatchSnapshotWithArray(
        "response headers",
      );

      expect(response.status()).toEqual(200);

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });
  });

  test.describe("with multi config", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    test.beforeEach(async () => {
      compiler = webpack(multiConfig);
      server = new Server({ port }, compiler);

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    test.afterEach(async () => {
      await server.stop();
    });

    test("should handle GET request to directory index and list all middleware directories", async ({
      page,
    }) => {
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

      expect(response.headers()["content-type"]).toMatchSnapshotWithArray(
        "response headers",
      );

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });
  });
});
