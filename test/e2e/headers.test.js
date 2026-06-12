import { afterEach, beforeEach, describe, it } from "node:test";
import { expect } from "expect";
import request from "supertest";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import config from "../fixtures/simple-config/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const port = portsMap["headers-option"];

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

      t.assert.snapshot(response.headers()["x-foo"]);

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
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

      t.assert.snapshot(response.headers()["x-foo"]);

      t.assert.snapshot(response.headers()["x-bar"]);

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
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

      t.assert.snapshot(response.headers()["x-bar"]);

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
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

      t.assert.snapshot(response.headers()["x-bar"]);

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
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

      t.assert.snapshot(response.headers()["x-foo"]);

      t.assert.snapshot(response.headers()["x-bar"]);

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
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

      t.assert.snapshot(response.headers()["x-foo"]);

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
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

      t.assert.snapshot(response.headers()["x-foo"]);
      t.assert.snapshot(response.status());
      t.assert.snapshot(consoleMessages.map((message) => message.text()));
      t.assert.snapshot(pageErrors);

      const responseForHead = await req.get("/");

      expect(responseForHead.headers["x-foo"]).toBe("dev-server headers");
    });
  });
});
