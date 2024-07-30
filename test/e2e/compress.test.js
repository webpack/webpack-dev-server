"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const { expect } = require("../helpers/playwright-custom-expects");
const { test } = require("../helpers/playwright-test");
const config = require("../fixtures/simple-config-other/webpack.config");
const port = require("../ports-map")["compress-option"];

test.describe("compress option", { tag: ["@flaky", "@fails"] }, () => {
  test.describe("enabled by default when not specified", () => {
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

    test("should handle GET request to bundle file", async ({ page }) => {
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

      expect(response.status()).toEqual(200);

      expect(response.headers()["content-encoding"]).toMatchSnapshotWithArray(
        "response headers",
      );

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });
  });

  test.describe("as true", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    test.beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          compress: true,
          port,
        },
        compiler,
      );

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    test.afterEach(async () => {
      await server.stop();
    });

    test("should handle GET request to bundle file", async ({ page }) => {
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

      expect(response.status()).toEqual(200);

      expect(response.headers()["content-encoding"]).toMatchSnapshotWithArray(
        "response headers",
      );

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });
  });

  test.describe("as false", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    test.beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          compress: false,
          port,
        },
        compiler,
      );

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    test.afterEach(async () => {
      await server.stop();
    });

    test(
      "should handle GET request to bundle file",
      {
        tag: ["@flaky"],
        annotation: {
          type: "issue",
          description:
            "https://github.com/webpack/webpack-dev-server/blob/master/test/e2e/__snapshots__/compress.test.js.snap.webpack5#L7",
        },
      },
      async ({ page }) => {
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

        expect(response.status()).toEqual(200);

        // the response sometimes is []
        // and sometimes {"accept-ranges": "bytes", "connection": "keep-alive", "content-length": "276518", "content-type": "application/javascript; charset=utf-8", "date": "Wed, 24 Jul 2024 12:49:54 GMT", "keep-alive": "timeout=5", "x-powered-by": "Express"}
        // the thing is that the content-encoding does not exist in the response headers object
        // expect(
        //   response.headers()["content-encoding"],
        // ).toMatchSnapshotWithArray();

        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshotWithArray("console messages");

        expect(pageErrors).toMatchSnapshotWithArray("page errors");
      },
    );
  });
});
