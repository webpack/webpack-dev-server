"use strict";

const path = require("node:path");
const puppeteer = require("puppeteer");
const webpack = require("webpack");
const WebpackDevServer = require("../../lib/Server");

describe("overlay runtime error", () => {
  let browser;
  let page;
  let server;

  beforeAll(async () => {
    const config = {
      mode: "development",
      entry: path.resolve(__dirname, "../fixtures/overlay-runtime-error.js"),
    };

    const compiler = webpack(config);

    server = new WebpackDevServer(
      {
        port: 8081,
        client: {
          overlay: true,
        },
      },
      compiler,
    );

    await server.start();

    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
    await server.stop();
  });

  it("should keep overlay visible on runtime error during initial load", async () => {
    await page.goto("http://localhost:8081");

    const overlay = await page.$("webpack-dev-server-client-overlay");

    expect(overlay).not.toBeNull();
  });
});
