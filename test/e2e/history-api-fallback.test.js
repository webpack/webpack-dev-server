"use strict";

const path = require("path");
const webpack = require("webpack");
const { describe, test, beforeEach, afterEach } = require("@playwright/test");
const sinon = require("sinon");
const { expect } = require("../helpers/playwright-custom-expects");
const Server = require("../../lib/Server");
const config = require("../fixtures/historyapifallback-config/webpack.config");
const config2 = require("../fixtures/historyapifallback-2-config/webpack.config");
const config3 = require("../fixtures/historyapifallback-3-config/webpack.config");
const port = require("../ports-map")["history-api-fallback-option"];

describe("historyApiFallback option", () => {
  describe("as boolean", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          historyApiFallback: true,
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

    test("should handle GET request to directory", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/foo`, {
        waitUntil: "networkidle0",
      });

      expect(
        response.headers()["content-type"],
      ).toMatchSnapshotWithArray();

      expect(response.status()).toMatchSnapshotWithArray();

      expect(await response.text()).toMatchSnapshotWithArray();

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray();

      expect(pageErrors).toMatchSnapshotWithArray();
    });
  });

  describe("as object", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          historyApiFallback: {
            index: "/bar.html",
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

    test("should handle GET request to directory", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/foo`, {
        waitUntil: "networkidle0",
      });

      expect(
        response.headers()["content-type"])
      .toMatchSnapshotWithArray();

      expect(response.status()).toMatchSnapshotWithArray();

      expect(await response.text()).toMatchSnapshotWithArray();

      expect(
        consoleMessages.map((message) => message.text()))
      .toMatchSnapshotWithArray();

      expect(pageErrors).toMatchSnapshotWithArray();
    });
  });

  describe("as object with static", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config2);

      server = new Server(
        {
          static: path.resolve(
            __dirname,
            "../fixtures/historyapifallback-2-config",
          ),
          historyApiFallback: {
            index: "/bar.html",
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

    test("should handle GET request to directory", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/foo`, {
        waitUntil: "networkidle0",
      });

      expect(
        response.headers()["content-type"])
      .toMatchSnapshotWithArray();

      expect(response.status()).toMatchSnapshotWithArray();

      expect(await response.text()).toMatchSnapshotWithArray();

      expect(
        consoleMessages.map((message) => message.text()))
      .toMatchSnapshotWithArray();

      expect(pageErrors).toMatchSnapshotWithArray();
    });

    test("should prefer static file over historyApiFallback", async ({
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
        `http://127.0.0.1:${port}/random-file.txt`,
        {
          // in Playwright, it has changed from networkidle2 to networkidle
          waitUntil: "networkidle",
        },
      );

      expect(
        response.headers()["content-type"])
      .toMatchSnapshotWithArray();

      expect(response.status()).toMatchSnapshotWithArray();

      expect(await response.text()).toMatchSnapshotWithArray();

      expect(
        consoleMessages.map((message) => message.text()))
      .toMatchSnapshotWithArray();

      expect(pageErrors).toMatchSnapshotWithArray();
    });
  });

  describe("as object with static set to false", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config3);

      server = new Server(
        {
          static: false,
          historyApiFallback: {
            index: "/bar.html",
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

    test("historyApiFallback should work and ignore static content", async ({
      page,
    }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/index.html`, {
        waitUntil: "networkidle0",
      });

      expect(
        response.headers()["content-type"])
      .toMatchSnapshotWithArray();

      expect(response.status()).toMatchSnapshotWithArray();

      expect(await response.text()).toMatchSnapshotWithArray();

      expect(
        consoleMessages.map((message) => message.text()))
      .toMatchSnapshotWithArray();

      expect(pageErrors).toMatchSnapshotWithArray();
    });
  });

  describe("as object with static and rewrites", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config2);

      server = new Server(
        {
          port,
          static: path.resolve(
            __dirname,
            "../fixtures/historyapifallback-2-config",
          ),
          historyApiFallback: {
            rewrites: [
              {
                from: /other/,
                to: "/other.html",
              },
              {
                from: /.*/,
                to: "/bar.html",
              },
            ],
          },
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

    test("historyApiFallback respect rewrites for index", async ({ page }) => {
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

      expect(
        response.headers()["content-type"])
      .toMatchSnapshotWithArray();

      expect(response.status()).toMatchSnapshotWithArray();

      expect(await response.text()).toMatchSnapshotWithArray();

      expect(
        consoleMessages.map((message) => message.text()))
      .toMatchSnapshotWithArray();

      expect(pageErrors).toMatchSnapshotWithArray();
    });

    test("historyApiFallback respect rewrites and shows index for unknown urls", async ({
      page,
    }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/acme`, {
        waitUntil: "networkidle0",
      });

      expect(
        response.headers()["content-type"])
      .toMatchSnapshotWithArray();

      expect(response.status()).toMatchSnapshotWithArray();

      expect(await response.text()).toMatchSnapshotWithArray();

      expect(
        consoleMessages.map((message) => message.text()))
      .toMatchSnapshotWithArray();

      expect(pageErrors).toMatchSnapshotWithArray();
    });

    test("historyApiFallback respect any other specified rewrites", async ({
      page,
    }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/other`, {
        waitUntil: "networkidle0",
      });

      expect(
        response.headers()["content-type"])
      .toMatchSnapshotWithArray();

      expect(response.status()).toMatchSnapshotWithArray();

      expect(await response.text()).toMatchSnapshotWithArray();

      expect(
        consoleMessages.map((message) => message.text()))
      .toMatchSnapshotWithArray();

      expect(pageErrors).toMatchSnapshotWithArray();
    });
  });

  describe('as object with the "verbose" option', () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;
    let consoleSpy;

    beforeEach(async () => {
      consoleSpy = sinon.spy(global.console, "log");

      compiler = webpack(config);

      server = new Server(
        {
          historyApiFallback: {
            index: "/bar.html",
            verbose: true,
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
      sinon.restore();
      await server.stop();
    });

    test("request to directory and log", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/foo`, {
        waitUntil: "networkidle0",
      });

      expect(
        response.headers()["content-type"])
      .toMatchSnapshotWithArray();

      expect(response.status()).toMatchSnapshotWithArray();

      expect(await response.text()).toMatchSnapshotWithArray();

      sinon.assert.calledWith(consoleSpy,
        "Rewriting",
        "GET",
        "/foo",
        "to",
        "/bar.html",
      );

      expect(
        consoleMessages.map((message) => message.text()))
      .toMatchSnapshotWithArray();

      expect(pageErrors).toMatchSnapshotWithArray();
    });
  });

  describe('as object with the "logger" option', () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;
    let consoleSpy;

    beforeEach(async () => {
      consoleSpy = sinon.spy(global.console, "log");

      compiler = webpack(config);

      server = new Server(
        {
          historyApiFallback: {
            index: "/bar.html",
            logger: consoleSpy,
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
      sinon.restore();
      await server.stop();
    });

    test("request to directory and log", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/foo`, {
        waitUntil: "networkidle0",
      });

      expect(
        response.headers()["content-type"])
      .toMatchSnapshotWithArray();

      expect(response.status()).toMatchSnapshotWithArray();

      expect(await response.text()).toMatchSnapshotWithArray();

      sinon.assert.calledWith(consoleSpy,
        "Rewriting",
        "GET",
        "/foo",
        "to",
        "/bar.html",
      );

      expect(
        consoleMessages.map((message) => message.text()))
      .toMatchSnapshotWithArray();

      expect(pageErrors).toMatchSnapshotWithArray();
    });
  });

  describe("in-memory files", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config3);

      server = new Server(
        {
          static: path.resolve(
            __dirname,
            "../fixtures/historyapifallback-3-config",
          ),
          historyApiFallback: true,
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

    test("should take precedence over static files", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/foo`, {
        waitUntil: "networkidle0",
      });

      expect(
        response.headers()["content-type"])
      .toMatchSnapshotWithArray();

      expect(response.status()).toMatchSnapshotWithArray();

      expect(await response.text()).toMatchSnapshotWithArray();

      expect(
        consoleMessages.map((message) => message.text()))
      .toMatchSnapshotWithArray();

      expect(pageErrors).toMatchSnapshotWithArray();
    });

    test("should perform HEAD request in same way as GET", async ({ page }) => {
      await page.goto(`http://127.0.0.1:${port}/foo`, {
        waitUntil: "networkidle0",
      });

      const responseGet = await page.evaluate(async () => {
        const response = await fetch("/foo", { method: "GET" });

        return {
          contentType: response.headers.get("content-type"),
          statusText: response.statusText,
          text: await response.text(),
        };
      });

      expect(responseGet.contentType).toMatchSnapshotWithArray();

      expect(responseGet.statusText).toMatchSnapshotWithArray();

      expect(responseGet.text).toMatchSnapshotWithArray();

      const responseHead = await page.evaluate(async () => {
        const response = await fetch("/foo", { method: "HEAD" });

        return {
          contentType: response.headers.get("content-type"),
          statusText: response.statusText,
          text: await response.text(),
        };
      });

      expect(responseHead).toMatchObject({
        ...responseGet,
        // HEAD response has an empty body
        text: "",
      });
    });
  });
});
