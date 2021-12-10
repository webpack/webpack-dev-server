"use strict";

const path = require("path");
const util = require("util");
const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map").api;

describe("API", () => {
  it(`should work with async API`, async () => {
    const compiler = webpack(config);
    const server = new Server({ port }, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    const pageErrors = [];
    const consoleMessages = [];

    page
      .on("console", (message) => {
        consoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    await page.goto(`http://127.0.0.1:${port}/main`, {
      waitUntil: "networkidle0",
    });

    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      "console messages"
    );
    expect(pageErrors).toMatchSnapshot("page errors");

    await browser.close();
    await server.stop();
  });

  it(`should work with callback API`, async () => {
    const compiler = webpack(config);
    const server = new Server({ port }, compiler);

    await new Promise((resolve) => {
      server.startCallback(() => {
        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    const pageErrors = [];
    const consoleMessages = [];

    page
      .on("console", (message) => {
        consoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    await page.goto(`http://127.0.0.1:${port}/main`, {
      waitUntil: "networkidle0",
    });

    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      "console messages"
    );
    expect(pageErrors).toMatchSnapshot("page errors");

    await browser.close();
    await new Promise((resolve) => {
      server.stopCallback(() => {
        resolve();
      });
    });
  });

  it(`should catch errors within startCallback`, async () => {
    const compiler = webpack(config);
    const server = new Server(
      { port, static: "https://absolute-url.com/somewhere" },
      compiler
    );

    await new Promise((resolve) => {
      server.startCallback((err) => {
        expect(err.message).toEqual(
          "Using a URL as static.directory is not supported"
        );
        resolve();
      });
    });

    await new Promise((resolve) => {
      server.stopCallback(() => {
        resolve();
      });
    });
  });

  it(`should work when using configured manually`, async () => {
    const compiler = webpack({
      ...config,
      entry: [
        "webpack/hot/dev-server.js",
        `${path.resolve(
          __dirname,
          "../../client/index.js"
        )}?hot=true&live-reload=true"`,
        path.resolve(__dirname, "../fixtures/client-config/foo.js"),
      ],
      plugins: [...config.plugins, new webpack.HotModuleReplacementPlugin()],
    });
    const server = new Server({ port, hot: false, client: false }, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    const pageErrors = [];
    const consoleMessages = [];

    page
      .on("console", (message) => {
        consoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    await page.goto(`http://127.0.0.1:${port}/main`, {
      waitUntil: "networkidle0",
    });

    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      "console messages"
    );
    expect(pageErrors).toMatchSnapshot("page errors");

    await browser.close();
    await server.stop();
  });

  it(`should work and allow to rerun dev server multiple times`, async () => {
    const compiler = webpack(config);
    const server = new Server({ port }, compiler);

    await server.start();

    const { page: firstPage, browser } = await runBrowser();

    const firstPageErrors = [];
    const firstConsoleMessages = [];

    firstPage
      .on("console", (message) => {
        firstConsoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        firstPageErrors.push(error);
      });

    await firstPage.goto(`http://127.0.0.1:${port}/main`, {
      waitUntil: "networkidle0",
    });

    expect(
      firstConsoleMessages.map((message) => message.text())
    ).toMatchSnapshot("console messages");
    expect(firstPageErrors).toMatchSnapshot("page errors");

    await server.stop();
    await server.start();

    const secondPage = await browser.newPage();

    const secondPageErrors = [];
    const secondConsoleMessages = [];

    secondPage
      .on("console", (message) => {
        secondConsoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        secondPageErrors.push(error);
      });

    await secondPage.goto(`http://127.0.0.1:${port}/main`, {
      waitUntil: "networkidle0",
    });

    expect(
      secondConsoleMessages.map((message) => message.text())
    ).toMatchSnapshot("console messages");
    expect(secondPageErrors).toMatchSnapshot("page errors");

    await browser.close();
    await server.stop();
  });

  it("should work with deprecated API ('listen' and `close` methods)", async () => {
    const compiler = webpack(config);
    const devServerOptions = { port };
    const utilSpy = jest.spyOn(util, "deprecate");
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(devServerOptions.port, devServerOptions.host, (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    const pageErrors = [];
    const consoleMessages = [];

    page
      .on("console", (message) => {
        consoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    await page.goto(`http://127.0.0.1:${port}/main`, {
      waitUntil: "networkidle0",
    });

    expect(utilSpy.mock.calls[0][1]).toMatchSnapshot("deprecation log");
    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      "console messages"
    );
    expect(pageErrors).toMatchSnapshot("page errors");

    utilSpy.mockRestore();
    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it(`should work with deprecated API (the order of the arguments in the constructor)`, async () => {
    const compiler = webpack(config);
    const devServerOptions = { port };
    const utilSpy = jest.spyOn(util, "deprecate");
    const server = new Server(compiler, devServerOptions);

    await server.start();

    const { page, browser } = await runBrowser();

    const pageErrors = [];
    const consoleMessages = [];

    page
      .on("console", (message) => {
        consoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    await page.goto(`http://127.0.0.1:${port}/main`, {
      waitUntil: "networkidle0",
    });

    expect(utilSpy.mock.calls[0][1]).toMatchSnapshot("deprecation log");

    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      "console messages"
    );
    expect(pageErrors).toMatchSnapshot("page errors");

    utilSpy.mockRestore();
    await browser.close();
    await server.stop();
  });

  it(`should work with deprecated API (only compiler in constructor)`, async () => {
    const compiler = webpack(config);
    const utilSpy = jest.spyOn(util, "deprecate");
    const server = new Server(compiler);

    server.options.port = port;

    await server.start();

    const { page, browser } = await runBrowser();

    const pageErrors = [];
    const consoleMessages = [];

    page
      .on("console", (message) => {
        consoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    await page.goto(`http://127.0.0.1:${port}/main`, {
      waitUntil: "networkidle0",
    });

    expect(utilSpy.mock.calls[0][1]).toMatchSnapshot("deprecation log");
    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      "console messages"
    );
    expect(pageErrors).toMatchSnapshot("page errors");

    utilSpy.mockRestore();
    await browser.close();
    await server.stop();
  });
});
