"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const oneConfiguration = require("../fixtures/multi-compiler-one-configuration/webpack.config");
const twoConfiguration = require("../fixtures/multi-compiler-two-configurations/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map")["multi-compiler"];

describe("multi compiler", () => {
  it(`should work with one configuration`, async () => {
    const compiler = webpack(oneConfiguration);
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    const pageErrors = [];
    const consoleMessages = [];

    page
      .on("console", (message) => {
        consoleMessages.push(message.text());
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    await page.goto(`http://127.0.0.1:${port}/main`, {
      waitUntil: "networkidle0",
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    await browser.close();
    await server.stop();
  });

  it(`should work with two configurations with hot and live reload`, async () => {
    const compiler = webpack(twoConfiguration);
    const devServerOptions = {
      port,
    };

    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page: pageOne, browser } = await runBrowser();

    let pageErrors = [];
    let consoleMessages = [];

    pageOne
      .on("console", (message) => {
        consoleMessages.push(message.text());
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    await pageOne.goto(`http://127.0.0.1:${port}/one-main`, {
      waitUntil: "networkidle0",
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    pageErrors = [];
    consoleMessages = [];

    await pageOne.goto(`http://127.0.0.1:${port}/two-main`, {
      waitUntil: "networkidle0",
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    await browser.close();
    await server.stop();
  });

  it(`should work with two configurations with only hot reload`, async () => {
    const compiler = webpack(twoConfiguration);
    const devServerOptions = {
      port,
      hot: true,
      liveReload: false,
    };

    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page: pageOne, browser } = await runBrowser();

    let pageErrors = [];
    let consoleMessages = [];

    pageOne
      .on("console", (message) => {
        consoleMessages.push(message.text());
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    await pageOne.goto(`http://127.0.0.1:${port}/one-main`, {
      waitUntil: "networkidle0",
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    pageErrors = [];
    consoleMessages = [];

    await pageOne.goto(`http://127.0.0.1:${port}/two-main`, {
      waitUntil: "networkidle0",
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    await browser.close();
    await server.stop();
  });

  it(`should work with two configurations with only live reload`, async () => {
    const compiler = webpack(twoConfiguration);
    const devServerOptions = {
      port,
      hot: false,
      liveReload: true,
    };

    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page: pageOne, browser } = await runBrowser();

    let pageErrors = [];
    let consoleMessages = [];

    pageOne
      .on("console", (message) => {
        consoleMessages.push(message.text());
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    await pageOne.goto(`http://127.0.0.1:${port}/one-main`, {
      waitUntil: "networkidle0",
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    pageErrors = [];
    consoleMessages = [];

    await pageOne.goto(`http://127.0.0.1:${port}/two-main`, {
      waitUntil: "networkidle0",
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    await browser.close();
    await server.stop();
  });
});
