"use strict";

const webpack = require("webpack");
const request = require("supertest");
const { test } = require("@playwright/test");
const { expect } = require("@playwright/test");
const { describe } = require("@playwright/test");
const { afterEach } = require("@playwright/test");
const { beforeEach } = require("@playwright/test");
const Server = require("../../lib/Server");
const config = require("../fixtures/simple-config/webpack.config");
const port = require("../ports-map")["headers-option"];

describe("headers option", () => {
  describe("as a string", () => {
    let compiler;
    let server;
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

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await server.stop();
    });

    test("should handle GET request with headers", async ({ page }) => {
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

      expect(JSON.stringify(response.headers()["x-foo"])).toMatchSnapshot();

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("as an array of objects", () => {
    let compiler;
    let server;
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

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await server.stop();
    });

    test("should handle GET request with headers", async ({ page }) => {
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

      expect(JSON.stringify(response.headers()["x-foo"])).toMatchSnapshot();

      expect(JSON.stringify(response.headers()["x-bar"])).toMatchSnapshot();

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("as an array", () => {
    let compiler;
    let server;
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

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await server.stop();
    });

    test("should handle GET request with headers as an array", async ({
      page,
    }) => {
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

      expect(JSON.stringify(response.headers()["x-bar"])).toMatchSnapshot();

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("as a function", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          headers: () => {
            return { "X-Bar": ["key1=value1", "key2=value2"] };
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

    test("should handle GET request with headers as a function", async ({
      page,
    }) => {
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

      expect(JSON.stringify(response.headers()["x-bar"])).toMatchSnapshot();

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("as a function returning an array", () => {
    let compiler;
    let server;
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

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await server.stop();
    });

    test("should handle GET request with headers", async ({ page }) => {
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

      expect(JSON.stringify(response.headers()["x-foo"])).toMatchSnapshot();

      expect(JSON.stringify(response.headers()["x-bar"])).toMatchSnapshot();

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("dev middleware headers take precedence for dev middleware output files", () => {
    let compiler;
    let server;
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

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await server.stop();
    });

    test("should handle GET request with headers as a function", async ({
      page,
    }) => {
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

      expect(JSON.stringify(response.headers()["x-foo"])).toMatchSnapshot();

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("as a string and support HEAD request", () => {
    let compiler;
    let server;
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

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await server.stop();
    });

    test("should handle HEAD request with headers", async ({ page }) => {
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

      expect(JSON.stringify(response.headers()["x-foo"])).toMatchSnapshot();
      expect(JSON.stringify(response.status())).toMatchSnapshot();
      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();
      expect(JSON.stringify(pageErrors)).toMatchSnapshot();

      const responseForHead = await req.get(`/`);

      expect(responseForHead.headers["x-foo"]).toBe("dev-server headers");
    });
  });
});
