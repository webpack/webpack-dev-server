"use strict";

const path = require("path");
const http2 = require("http2");
const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/static-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map")["https-option"];

const staticDirectory = path.resolve(
  __dirname,
  "../fixtures/static-config/public"
);

describe("http2 option", () => {
  describe("http2 works with https", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let HTTPVersion;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          static: staticDirectory,
          https: true,
          http2: true,
          port,
        },
        compiler
      );

      await server.start();

      ({ page, browser } = await runBrowser());

      await page.goto(`https://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      HTTPVersion = await page.evaluate(
        () => performance.getEntries()[0].nextHopProtocol
      );
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
    });

    it("should confirm that http2 client can connect", (done) => {
      const client = http2.connect(`https://localhost:${port}`, {
        rejectUnauthorized: false,
      });

      client.on("error", (err) => console.error(err));

      const http2Req = client.request({ ":path": "/" });

      http2Req.on("response", (headers) => {
        expect(headers[":status"]).toEqual(200);
      });

      http2Req.setEncoding("utf8");

      let data = "";

      http2Req.on("data", (chunk) => {
        data += chunk;
      });

      http2Req.on("end", () => {
        expect(data).toEqual(expect.stringMatching(/Heyo/));
        client.close();
        done();
      });

      expect(HTTPVersion).toEqual("h2");

      http2Req.end();
    });
  });

  describe("server works with http2 option, without https option enabled", () => {
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
          static: staticDirectory,
          http2: true,
          port,
        },
        compiler
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

    it("should handle GET request to index route (/)", async () => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`https://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      const HTTPVersion = await page.evaluate(
        () => performance.getEntries()[0].nextHopProtocol
      );

      expect(HTTPVersion).toMatchSnapshot("HTTP version");

      expect(response.status()).toMatchSnapshot("response status");

      expect(await response.text()).toMatchSnapshot("response text");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
    });
  });

  describe("https without http2, disables HTTP/2", () => {
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
          static: staticDirectory,
          https: true,
          http2: false,
          port,
        },
        compiler
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

    it("should handle GET request to index route (/)", async () => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`https://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      const HTTPVersion = await page.evaluate(
        () => performance.getEntries()[0].nextHopProtocol
      );

      expect(HTTPVersion).toMatchSnapshot("HTTP version");

      expect(response.status()).toMatchSnapshot("response status");

      expect(await response.text()).toMatchSnapshot("response text");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      expect(pageErrors).toMatchSnapshot("page errors");
    });
  });
});
