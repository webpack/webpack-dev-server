"use strict";

const path = require("node:path");
const { afterEach, beforeEach, describe, it } = require("node:test");
const { expect } = require("expect");
const { spyOn } = require("jest-mock");
const webpack = require("webpack");
const Server = require("../../lib/Server");
const config2 = require("../fixtures/historyapifallback-2-config/webpack.config");
const config3 = require("../fixtures/historyapifallback-3-config/webpack.config");
const config = require("../fixtures/historyapifallback-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map")["history-api-fallback-option"];

describe("historyApiFallback option", { concurrency: 1 }, () => {
  describe("as boolean", () => {
    let compiler;
    let server;
    let page;
    let browser;
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

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
    });

    it("should handle GET request to directory", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/foo`, {
        waitUntil: "networkidle0",
      });

      await t.test("response headers content-type", async (t) =>
        t.assert.snapshot(response.headers()["content-type"]),
      );

      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );

      await t.test("response text", async (t) =>
        t.assert.snapshot(await response.text()),
      );

      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );

      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    });
  });

  describe("as object", () => {
    let compiler;
    let server;
    let page;
    let browser;
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

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
    });

    it("should handle GET request to directory", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/foo`, {
        waitUntil: "networkidle0",
      });

      await t.test("response headers content-type", async (t) =>
        t.assert.snapshot(response.headers()["content-type"]),
      );

      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );

      await t.test("response text", async (t) =>
        t.assert.snapshot(await response.text()),
      );

      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );

      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    });
  });

  describe("as object with static", () => {
    let compiler;
    let server;
    let page;
    let browser;
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

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
    });

    it("should handle GET request to directory", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/foo`, {
        waitUntil: "networkidle0",
      });

      await t.test("response headers content-type", async (t) =>
        t.assert.snapshot(response.headers()["content-type"]),
      );

      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );

      await t.test("response text", async (t) =>
        t.assert.snapshot(await response.text()),
      );

      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );

      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    });

    it("should prefer static file over historyApiFallback", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://localhost:${port}/random-file.txt`,
        {
          waitUntil: "networkidle2",
        },
      );

      await t.test("response headers content-type", async (t) =>
        t.assert.snapshot(response.headers()["content-type"]),
      );

      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );

      await t.test("response text", async (t) =>
        t.assert.snapshot(await response.text()),
      );

      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );

      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    });
  });

  describe("as object with static set to false", () => {
    let compiler;
    let server;
    let page;
    let browser;
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

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
    });

    it("historyApiFallback should work and ignore static content", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/index.html`, {
        waitUntil: "networkidle0",
      });

      await t.test("response headers content-type", async (t) =>
        t.assert.snapshot(response.headers()["content-type"]),
      );

      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );

      await t.test("response text", async (t) =>
        t.assert.snapshot(await response.text()),
      );

      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );

      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    });
  });

  describe("as object with static and rewrites", () => {
    let compiler;
    let server;
    let page;
    let browser;
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

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
    });

    it("historyApiFallback respect rewrites for index", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      await t.test("response headers content-type", async (t) =>
        t.assert.snapshot(response.headers()["content-type"]),
      );

      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );

      await t.test("response text", async (t) =>
        t.assert.snapshot(await response.text()),
      );

      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );

      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    });

    it("historyApiFallback respect rewrites and shows index for unknown urls", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/acme`, {
        waitUntil: "networkidle0",
      });

      await t.test("response headers content-type", async (t) =>
        t.assert.snapshot(response.headers()["content-type"]),
      );

      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );

      await t.test("response text", async (t) =>
        t.assert.snapshot(await response.text()),
      );

      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );

      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    });

    it("historyApiFallback respect any other specified rewrites", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/other`, {
        waitUntil: "networkidle0",
      });

      await t.test("response headers content-type", async (t) =>
        t.assert.snapshot(response.headers()["content-type"]),
      );

      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );

      await t.test("response text", async (t) =>
        t.assert.snapshot(await response.text()),
      );

      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );

      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    });
  });

  describe('as object with the "verbose" option', () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;
    let consoleSpy;

    beforeEach(async () => {
      consoleSpy = spyOn(globalThis.console, "log");

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

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      consoleSpy.mockRestore();
      await browser.close();
      await server.stop();
    });

    it("request to directory and log", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/foo`, {
        waitUntil: "networkidle0",
      });

      await t.test("response headers content-type", async (t) =>
        t.assert.snapshot(response.headers()["content-type"]),
      );

      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );

      await t.test("response text", async (t) =>
        t.assert.snapshot(await response.text()),
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "Rewriting",
        "GET",
        "/foo",
        "to",
        "/bar.html",
      );

      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );

      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    });
  });

  describe('as object with the "logger" option', () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;
    let consoleSpy;

    beforeEach(async () => {
      consoleSpy = spyOn(globalThis.console, "log");

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

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      consoleSpy.mockRestore();
      await browser.close();
      await server.stop();
    });

    it("request to directory and log", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/foo`, {
        waitUntil: "networkidle0",
      });

      await t.test("response headers content-type", async (t) =>
        t.assert.snapshot(response.headers()["content-type"]),
      );

      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );

      await t.test("response text", async (t) =>
        t.assert.snapshot(await response.text()),
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "Rewriting",
        "GET",
        "/foo",
        "to",
        "/bar.html",
      );

      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );

      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    });
  });

  describe("in-memory files", () => {
    let compiler;
    let server;
    let page;
    let browser;
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

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
    });

    it("should take precedence over static files", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/foo`, {
        waitUntil: "networkidle0",
      });

      await t.test("response headers content-type", async (t) =>
        t.assert.snapshot(response.headers()["content-type"]),
      );

      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );

      await t.test("response text", async (t) =>
        t.assert.snapshot(await response.text()),
      );

      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );

      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    });

    it("should perform HEAD request in same way as GET", async (t) => {
      await page.goto(`http://localhost:${port}/foo`, {
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

      await t.test("response headers content-type", async (t) =>
        t.assert.snapshot(responseGet.contentType),
      );

      await t.test("response status", async (t) =>
        t.assert.snapshot(responseGet.statusText),
      );

      await t.test("response text", async (t) =>
        t.assert.snapshot(responseGet.text),
      );

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
