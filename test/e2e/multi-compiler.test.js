"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const oneWebTargetConfiguration = require("../fixtures/multi-compiler-one-configuration/webpack.config");
const twoWebTargetConfiguration = require("../fixtures/multi-compiler-two-configurations/webpack.config");
const universalConfiguration = require("../fixtures/universal-compiler-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map")["multi-compiler"];

describe("multi compiler", () => {
  it(`should work with one web target configuration`, async () => {
    const compiler = webpack(oneWebTargetConfiguration);
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

  it(`should work with two web target configurations with hot and live reload`, async () => {
    const compiler = webpack(twoWebTargetConfiguration);
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

  it(`should work with two web target configurations with only hot reload`, async () => {
    const compiler = webpack(twoWebTargetConfiguration);
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

  it(`should work with two web target configurations with only live reload`, async () => {
    const compiler = webpack(twoWebTargetConfiguration);
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

  it("should work with universal configurations with hot and live reload", async () => {
    const compiler = webpack(universalConfiguration);
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

    await page.goto(`http://127.0.0.1:${port}/browser`, {
      waitUntil: "networkidle0",
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    const serverResponse = await page.goto(
      `http://127.0.0.1:${port}/server.js`,
      {
        waitUntil: "networkidle0",
      }
    );

    const serverResponseText = await serverResponse.text();

    expect(serverResponseText).toContain("Hello from the server");
    expect(serverResponseText).not.toContain("WebsocketServer");

    await browser.close();
    await server.stop();
  });

  it("should work with universal configurations with only hot reload", async () => {
    const compiler = webpack(universalConfiguration);
    const devServerOptions = {
      port,
      hot: true,
      liveReload: false,
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

    await page.goto(`http://127.0.0.1:${port}/browser`, {
      waitUntil: "networkidle0",
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    const serverResponse = await page.goto(
      `http://127.0.0.1:${port}/server.js`,
      {
        waitUntil: "networkidle0",
      }
    );

    const serverResponseText = await serverResponse.text();

    expect(serverResponseText).toContain("Hello from the server");
    expect(serverResponseText).not.toContain("WebsocketServer");

    await browser.close();
    await server.stop();
  });

  it("should work with universal configurations with only live reload", async () => {
    const compiler = webpack(universalConfiguration);
    const devServerOptions = {
      port,
      hot: false,
      liveReload: true,
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

    await page.goto(`http://127.0.0.1:${port}/browser`, {
      waitUntil: "networkidle0",
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    const serverResponse = await page.goto(
      `http://127.0.0.1:${port}/server.js`,
      {
        waitUntil: "networkidle0",
      }
    );

    const serverResponseText = await serverResponse.text();

    expect(serverResponseText).toContain("Hello from the server");
    expect(serverResponseText).not.toContain("WebsocketServer");

    await browser.close();
    await server.stop();
  });
});
