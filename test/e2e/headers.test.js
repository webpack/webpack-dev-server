"use strict";

const { afterEach, beforeEach, describe, it } = require("node:test");
const { expect } = require("expect");
const request = require("supertest");
const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/simple-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map")["headers-option"];

describe("headers option", () => {
  describe("as a string", () => {
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
          headers: { "X-Foo": "dev-server headers" },
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

    it("should handle GET request with headers", async (t) => {
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

      await t.test("response headers x-foo", async (t) =>
        t.assert.snapshot(response.headers()["x-foo"]),
      );

      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );

      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );

      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    });
  });

  describe("as an array of objects", () => {
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
          headers: [
            {
              key: "X-Foo",
              value: "value1",
            },
            {
              key: "X-Bar",
              value: "value2",
            },
          ],
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

    it("should handle GET request with headers", async (t) => {
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

      await t.test("response headers x-foo", async (t) =>
        t.assert.snapshot(response.headers()["x-foo"]),
      );

      await t.test("response headers x-bar", async (t) =>
        t.assert.snapshot(response.headers()["x-bar"]),
      );

      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );

      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );

      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    });
  });

  describe("as an array", () => {
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
          headers: { "X-Bar": ["key1=value1", "key2=value2"] },
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

    it("should handle GET request with headers as an array", async (t) => {
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

      await t.test("response headers x-bar", async (t) =>
        t.assert.snapshot(response.headers()["x-bar"]),
      );

      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );

      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );

      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    });
  });

  describe("as a function", () => {
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
          headers: () => ({ "X-Bar": ["key1=value1", "key2=value2"] }),
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

    it("should handle GET request with headers as a function", async (t) => {
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

      await t.test("response headers x-bar", async (t) =>
        t.assert.snapshot(response.headers()["x-bar"]),
      );

      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );

      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );

      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    });
  });

  describe("as a function returning an array", () => {
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
          headers: () => [
            {
              key: "X-Foo",
              value: "value1",
            },
            {
              key: "X-Bar",
              value: "value2",
            },
          ],
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

    it("should handle GET request with headers", async (t) => {
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

      await t.test("response headers x-foo", async (t) =>
        t.assert.snapshot(response.headers()["x-foo"]),
      );

      await t.test("response headers x-bar", async (t) =>
        t.assert.snapshot(response.headers()["x-bar"]),
      );

      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );

      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );

      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    });
  });

  describe("dev middleware headers take precedence for dev middleware output files", () => {
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
          headers: { "X-Foo": "dev-server-headers" },
          devMiddleware: {
            headers: { "X-Foo": "dev-middleware-headers" },
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

    it("should handle GET request with headers as a function", async (t) => {
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

      await t.test("response headers x-foo", async (t) =>
        t.assert.snapshot(response.headers()["x-foo"]),
      );

      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );

      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );

      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    });
  });

  describe("as a string and support HEAD request", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;
    let req;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          headers: { "X-Foo": "dev-server headers" },
          port,
        },
        compiler,
      );

      await server.start();

      req = request(server.app);

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
    });

    it("should handle HEAD request with headers", async (t) => {
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

      await t.test("response headers x-foo", async (t) =>
        t.assert.snapshot(response.headers()["x-foo"]),
      );
      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );
      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );
      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));

      const responseForHead = await req.get("/");

      expect(responseForHead.headers["x-foo"]).toBe("dev-server headers");
    });
  });
});
