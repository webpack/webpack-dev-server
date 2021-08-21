"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const multiConfig = require("../fixtures/multi-public-path-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map").routes;

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

    it("should handles GET request to sockjs bundle", async () => {
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
        }
      );

      expect(response.headers()["content-type"]).toMatchSnapshot(
        "response headers content-type"
      );

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
    });

    it("should handles HEAD request to sockjs bundle", async () => {
      await page.setRequestInterception(true);

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        })
        .on("request", (interceptedRequest) => {
          interceptedRequest.continue({ method: "HEAD" });
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}/__webpack_dev_server__/sockjs.bundle.js`,
        {
          waitUntil: "networkidle0",
        }
      );

      expect(response.headers()["content-type"]).toMatchSnapshot(
        "response headers content-type"
      );

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
    });

    it("should handle GET request to invalidate endpoint", async () => {
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
        }
      );

      expect(response.headers()["content-type"]).not.toEqual("text/html");

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
    });

    it("should handle GET request to directory index and list all middleware directories", async () => {
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
        }
      );

      const bodyHandle = await page.$("body");
      const htmlContent = await page.evaluate(
        (body) => body.innerHTML,
        bodyHandle
      );

      expect(response.headers()["content-type"]).toMatchSnapshot(
        "response headers content-type"
      );

      expect(response.status()).toMatchSnapshot("response status");

      expect(htmlContent).toMatchSnapshot("directory list");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
    });

    it("should handle HEAD request to directory index", async () => {
      await page.setRequestInterception(true);

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        })
        .on("request", (interceptedRequest) => {
          interceptedRequest.continue({ method: "HEAD" });
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}/webpack-dev-server/`,
        {
          waitUntil: "networkidle0",
        }
      );

      const bodyHandle = await page.$("body");
      const htmlContent = await page.evaluate(
        (body) => body.innerHTML,
        bodyHandle
      );

      expect(response.headers()["content-type"]).toMatchSnapshot(
        "response headers content-type"
      );

      expect(response.status()).toMatchSnapshot("response status");

      expect(htmlContent).toMatchSnapshot("directory list");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
    });

    it("should handle GET request to magic async html", async () => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/main`, {
        waitUntil: "networkidle0",
      });

      expect(response.headers()["content-type"]).toMatchSnapshot(
        "response headers content-type"
      );

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
    });

    it("should handle HEAD request to magic async html", async () => {
      await page.setRequestInterception(true);

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        })
        .on("request", (interceptedRequest) => {
          interceptedRequest.continue({ method: "HEAD" });
        });

      const response = await page.goto(`http://127.0.0.1:${port}/main`, {
        waitUntil: "networkidle0",
      });

      expect(response.headers()["content-type"]).toMatchSnapshot(
        "response headers content-type"
      );

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
    });

    it("should handle GET request to magic async chunk", async () => {
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

      expect(response.headers()["content-type"]).toMatchSnapshot(
        "response headers content-type"
      );

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
    });

    it("should handle HEAD request to magic async chunk", async () => {
      await page.setRequestInterception(true);

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        })
        .on("request", (interceptedRequest) => {
          interceptedRequest.continue({ method: "HEAD" });
        });

      const response = await page.goto(`http://127.0.0.1:${port}/main.js`, {
        waitUntil: "networkidle0",
      });

      expect(response.headers()["content-type"]).toMatchSnapshot(
        "response headers content-type"
      );

      expect(response.status()).toMatchSnapshot("response status");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
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

    it("should handle GET request to directory index and list all middleware directories", async () => {
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
        }
      );

      const bodyHandle = await page.$("body");
      const htmlContent = await page.evaluate(
        (body) => body.innerHTML,
        bodyHandle
      );

      expect(response.headers()["content-type"]).toMatchSnapshot(
        "response headers content-type"
      );

      expect(response.status()).toMatchSnapshot("response status");

      expect(htmlContent).toMatchSnapshot("directory list");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
    });
  });
});
