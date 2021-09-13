"use strict";

const path = require("path");
const fs = require("graceful-fs");
const webpack = require("webpack");
const Server = require("../../lib/Server");
const oneWebTargetConfiguration = require("../fixtures/multi-compiler-one-configuration/webpack.config");
const twoWebTargetConfiguration = require("../fixtures/multi-compiler-two-configurations/webpack.config");
const universalConfiguration = require("../fixtures/universal-compiler-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map")["multi-compiler"];

describe("multi compiler", () => {
  it(`should work with one web target configuration and do nothing`, async () => {
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

  it(`should work with web target configurations and do nothing`, async () => {
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

  it(`should work with web target configurations when hot and live reloads are enabled, and do hot reload by default when changing own entries`, async () => {
    const compiler = webpack(twoWebTargetConfiguration);
    const devServerOptions = {
      port,
      hot: true,
      liveReload: true,
    };
    const pathToOneEntry = path.resolve(
      __dirname,
      "../fixtures/multi-compiler-two-configurations/one.js"
    );
    const originalOneEntryContent = fs.readFileSync(pathToOneEntry);
    const pathToTwoEntry = path.resolve(
      __dirname,
      "../fixtures/multi-compiler-two-configurations/two.js"
    );
    const originalTwoEntryContent = fs.readFileSync(pathToTwoEntry);

    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page: pageOne, browser } = await runBrowser();

    let pageErrors = [];
    let consoleMessages = [];

    pageOne
      .on("console", (message) => {
        let text = message.text();

        if (/Error: Aborted because/.test(text)) {
          const splittedText = text.split("\n");

          text = `${splittedText[0]}\n${splittedText[1]}\n    <stack>`;
        }

        consoleMessages.push(text);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    await pageOne.goto(`http://127.0.0.1:${port}/one-main`, {
      waitUntil: "networkidle0",
    });

    fs.writeFileSync(pathToOneEntry, `${originalOneEntryContent}// comment`);

    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (
          consoleMessages.filter(
            (item) =>
              item === "[webpack-dev-server] Hot Module Replacement enabled."
          ).length === 2 &&
          consoleMessages.filter(
            (item) => item === "[webpack-dev-server] Live Reloading enabled."
          ).length === 2 &&
          consoleMessages.includes(
            "[webpack-dev-server] App updated. Recompiling..."
          ) &&
          consoleMessages.includes(
            "[HMR] Cannot apply update. Need to do a full reload!"
          )
        ) {
          clearInterval(interval);

          resolve();
        }
      }, 100);
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    pageErrors = [];
    consoleMessages = [];

    await pageOne.goto(`http://127.0.0.1:${port}/two-main`, {
      waitUntil: "networkidle0",
    });

    fs.writeFileSync(pathToTwoEntry, `${originalTwoEntryContent}// comment`);

    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (
          consoleMessages.filter(
            (item) =>
              item === "[webpack-dev-server] Hot Module Replacement enabled."
          ).length === 2 &&
          consoleMessages.filter(
            (item) => item === "[webpack-dev-server] Live Reloading enabled."
          ).length === 2 &&
          consoleMessages.includes(
            "[webpack-dev-server] App updated. Recompiling..."
          ) &&
          consoleMessages.includes(
            "[HMR] Cannot apply update. Need to do a full reload!"
          )
        ) {
          clearInterval(interval);

          resolve();
        }
      }, 100);
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    fs.writeFileSync(pathToOneEntry, originalOneEntryContent);
    fs.writeFileSync(pathToTwoEntry, originalTwoEntryContent);

    await browser.close();
    await server.stop();
  });

  it(`should work with web target configurations when only hot reload is enabled, and do hot reload when changing own entries`, async () => {
    const compiler = webpack(twoWebTargetConfiguration);
    const devServerOptions = {
      port,
      hot: true,
      liveReload: false,
    };
    const pathToOneEntry = path.resolve(
      __dirname,
      "../fixtures/multi-compiler-two-configurations/one.js"
    );
    const originalOneEntryContent = fs.readFileSync(pathToOneEntry);
    const pathToTwoEntry = path.resolve(
      __dirname,
      "../fixtures/multi-compiler-two-configurations/two.js"
    );
    const originalTwoEntryContent = fs.readFileSync(pathToTwoEntry);

    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page: pageOne, browser } = await runBrowser();

    let pageErrors = [];
    let consoleMessages = [];

    pageOne
      .on("console", (message) => {
        let text = message.text();

        if (/Error: Aborted because/.test(text)) {
          const splittedText = text.split("\n");

          text = `${splittedText[0]}\n${splittedText[1]}\n    <stack>`;
        }

        consoleMessages.push(text);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    await pageOne.goto(`http://127.0.0.1:${port}/one-main`, {
      waitUntil: "networkidle0",
    });

    fs.writeFileSync(pathToOneEntry, `${originalOneEntryContent}// comment`);

    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (
          consoleMessages.filter(
            (item) =>
              item === "[webpack-dev-server] Hot Module Replacement enabled."
          ).length === 2 &&
          consoleMessages.includes(
            "[webpack-dev-server] App updated. Recompiling..."
          ) &&
          consoleMessages.includes(
            "[HMR] Cannot apply update. Need to do a full reload!"
          )
        ) {
          clearInterval(interval);

          resolve();
        }
      }, 100);
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    pageErrors = [];
    consoleMessages = [];

    await pageOne.goto(`http://127.0.0.1:${port}/two-main`, {
      waitUntil: "networkidle0",
    });

    fs.writeFileSync(pathToTwoEntry, `${originalTwoEntryContent}// comment`);

    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (
          consoleMessages.filter(
            (item) =>
              item === "[webpack-dev-server] Hot Module Replacement enabled."
          ).length === 2 &&
          consoleMessages.includes(
            "[webpack-dev-server] App updated. Recompiling..."
          ) &&
          consoleMessages.includes(
            "[HMR] Cannot apply update. Need to do a full reload!"
          )
        ) {
          clearInterval(interval);

          resolve();
        }
      }, 100);
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    fs.writeFileSync(pathToOneEntry, originalOneEntryContent);
    fs.writeFileSync(pathToTwoEntry, originalTwoEntryContent);

    await browser.close();
    await server.stop();
  });

  it(`should work with web target configurations when only live reload is enabled, and do live reload when changing own entries`, async () => {
    const compiler = webpack(twoWebTargetConfiguration);
    const devServerOptions = {
      port,
      hot: false,
      liveReload: true,
    };
    const pathToOneEntry = path.resolve(
      __dirname,
      "../fixtures/multi-compiler-two-configurations/one.js"
    );
    const originalOneEntryContent = fs.readFileSync(pathToOneEntry);
    const pathToTwoEntry = path.resolve(
      __dirname,
      "../fixtures/multi-compiler-two-configurations/two.js"
    );
    const originalTwoEntryContent = fs.readFileSync(pathToTwoEntry);

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

    fs.writeFileSync(pathToOneEntry, `${originalOneEntryContent}// comment`);

    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (
          consoleMessages.filter(
            (item) => item === "[webpack-dev-server] Live Reloading enabled."
          ).length === 2 &&
          consoleMessages.includes(
            "[webpack-dev-server] App updated. Reloading..."
          )
        ) {
          clearInterval(interval);

          resolve();
        }
      }, 100);
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    pageErrors = [];
    consoleMessages = [];

    await pageOne.goto(`http://127.0.0.1:${port}/two-main`, {
      waitUntil: "networkidle0",
    });

    fs.writeFileSync(pathToTwoEntry, `${originalTwoEntryContent}// comment`);

    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (
          consoleMessages.filter(
            (item) => item === "[webpack-dev-server] Live Reloading enabled."
          ).length === 2 &&
          consoleMessages.includes(
            "[webpack-dev-server] App updated. Reloading..."
          )
        ) {
          clearInterval(interval);

          resolve();
        }
      }, 100);
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    fs.writeFileSync(pathToOneEntry, originalOneEntryContent);
    fs.writeFileSync(pathToTwoEntry, originalTwoEntryContent);

    await browser.close();
    await server.stop();
  });

  it(`should work with web target configurations when only live reload is enabled and do live reload when changing other entries`, async () => {
    const compiler = webpack(twoWebTargetConfiguration);
    const devServerOptions = {
      port,
      hot: false,
      liveReload: true,
    };
    const pathToOneEntry = path.resolve(
      __dirname,
      "../fixtures/multi-compiler-two-configurations/one.js"
    );
    const originalOneEntryContent = fs.readFileSync(pathToOneEntry);
    const pathToTwoEntry = path.resolve(
      __dirname,
      "../fixtures/multi-compiler-two-configurations/two.js"
    );
    const originalTwoEntryContent = fs.readFileSync(pathToTwoEntry);

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

    fs.writeFileSync(pathToTwoEntry, `${originalTwoEntryContent}// comment`);

    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (
          consoleMessages.filter(
            (item) => item === "[webpack-dev-server] Live Reloading enabled."
          ).length === 2 &&
          consoleMessages.includes(
            "[webpack-dev-server] App updated. Reloading..."
          )
        ) {
          clearInterval(interval);

          resolve();
        }
      }, 100);
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    pageErrors = [];
    consoleMessages = [];

    await pageOne.goto(`http://127.0.0.1:${port}/two-main`, {
      waitUntil: "networkidle0",
    });

    fs.writeFileSync(pathToOneEntry, `${originalOneEntryContent}// comment`);

    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (
          consoleMessages.filter(
            (item) => item === "[webpack-dev-server] Live Reloading enabled."
          ).length === 2 &&
          consoleMessages.includes(
            "[webpack-dev-server] App updated. Reloading..."
          )
        ) {
          clearInterval(interval);

          resolve();
        }
      }, 100);
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    fs.writeFileSync(pathToOneEntry, originalOneEntryContent);
    fs.writeFileSync(pathToTwoEntry, originalTwoEntryContent);

    await browser.close();
    await server.stop();
  });

  it("should work with universal configuration and do nothing", async () => {
    const compiler = webpack(universalConfiguration);
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    const serverResponse = await page.goto(
      `http://127.0.0.1:${port}/server.js`,
      {
        waitUntil: "networkidle0",
      }
    );

    const serverResponseText = await serverResponse.text();

    expect(serverResponseText).toContain("Hello from the server");
    expect(serverResponseText).not.toContain("WebsocketServer");

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

    await browser.close();
    await server.stop();
  });

  it(`should work with universal configuration when hot and live reloads are enabled, and do hot reload for browser compiler by default when browser entry changed`, async () => {
    const compiler = webpack(universalConfiguration);
    const devServerOptions = {
      port,
      hot: true,
      liveReload: true,
    };
    const pathToBrowserEntry = path.resolve(
      __dirname,
      "../fixtures/universal-compiler-config/browser.js"
    );
    const originalBrowserEntryContent = fs.readFileSync(pathToBrowserEntry);
    const pathToServerEntry = path.resolve(
      __dirname,
      "../fixtures/universal-compiler-config/server.js"
    );
    const originalServerEntryContent = fs.readFileSync(pathToServerEntry);

    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page: pageOne, browser } = await runBrowser();

    const serverResponse = await pageOne.goto(
      `http://127.0.0.1:${port}/server.js`,
      {
        waitUntil: "networkidle0",
      }
    );

    const serverResponseText = await serverResponse.text();

    expect(serverResponseText).toContain("Hello from the server");
    expect(serverResponseText).not.toContain("WebsocketServer");

    const pageErrors = [];
    const consoleMessages = [];

    pageOne
      .on("console", (message) => {
        let text = message.text();

        if (/Error: Aborted because/.test(text)) {
          const splittedText = text.split("\n");

          text = `${splittedText[0]}\n${splittedText[1]}\n    <stack>`;
        }

        consoleMessages.push(text);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    await pageOne.goto(`http://127.0.0.1:${port}/browser`, {
      waitUntil: "networkidle0",
    });

    fs.writeFileSync(
      pathToBrowserEntry,
      `${originalBrowserEntryContent}// comment`
    );

    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (
          consoleMessages.filter(
            (item) =>
              item === "[webpack-dev-server] Hot Module Replacement enabled."
          ).length === 2 &&
          consoleMessages.filter(
            (item) => item === "[webpack-dev-server] Live Reloading enabled."
          ).length === 2 &&
          consoleMessages.includes(
            "[webpack-dev-server] App updated. Recompiling..."
          ) &&
          consoleMessages.includes(
            "[HMR] Cannot apply update. Need to do a full reload!"
          )
        ) {
          clearInterval(interval);

          resolve();
        }
      }, 100);
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    fs.writeFileSync(pathToBrowserEntry, originalBrowserEntryContent);
    fs.writeFileSync(pathToServerEntry, originalServerEntryContent);

    await browser.close();
    await server.stop();
  });

  it(`should work with universal configuration when only hot reload is enabled, and do hot reload for browser compiler when browser entry changed`, async () => {
    const compiler = webpack(universalConfiguration);
    const devServerOptions = {
      port,
      hot: true,
      liveReload: false,
    };
    const pathToBrowserEntry = path.resolve(
      __dirname,
      "../fixtures/universal-compiler-config/browser.js"
    );
    const originalBrowserEntryContent = fs.readFileSync(pathToBrowserEntry);

    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page: pageOne, browser } = await runBrowser();

    const serverResponse = await pageOne.goto(
      `http://127.0.0.1:${port}/server.js`,
      {
        waitUntil: "networkidle0",
      }
    );

    const serverResponseText = await serverResponse.text();

    expect(serverResponseText).toContain("Hello from the server");
    expect(serverResponseText).not.toContain("WebsocketServer");

    const pageErrors = [];
    const consoleMessages = [];

    pageOne
      .on("console", (message) => {
        let text = message.text();

        if (/Error: Aborted because/.test(text)) {
          const splittedText = text.split("\n");

          text = `${splittedText[0]}\n${splittedText[1]}\n    <stack>`;
        }

        consoleMessages.push(message.text());
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    await pageOne.goto(`http://127.0.0.1:${port}/browser`, {
      waitUntil: "networkidle0",
    });

    fs.writeFileSync(
      pathToBrowserEntry,
      `${originalBrowserEntryContent}// comment`
    );

    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (
          consoleMessages.filter(
            (item) =>
              item === "[webpack-dev-server] Hot Module Replacement enabled."
          ).length === 2 &&
          consoleMessages.includes(
            "[webpack-dev-server] App updated. Recompiling..."
          ) &&
          consoleMessages.includes(
            "[HMR] Cannot apply update. Need to do a full reload!"
          )
        ) {
          clearInterval(interval);

          resolve();
        }
      }, 100);
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    fs.writeFileSync(pathToBrowserEntry, originalBrowserEntryContent);

    await browser.close();
    await server.stop();
  });

  it(`should work with universal configuration when only live reload is enabled, and do live reload for browser compiler when changing browser and server entries`, async () => {
    const compiler = webpack(universalConfiguration);
    const devServerOptions = {
      port,
      hot: false,
      liveReload: true,
    };
    const pathToBrowserEntry = path.resolve(
      __dirname,
      "../fixtures/universal-compiler-config/browser.js"
    );
    const originalBrowserEntryContent = fs.readFileSync(pathToBrowserEntry);
    const pathToServerEntry = path.resolve(
      __dirname,
      "../fixtures/universal-compiler-config/server.js"
    );
    const originalServerEntryContent = fs.readFileSync(pathToServerEntry);

    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page: pageOne, browser } = await runBrowser();

    const serverResponse = await pageOne.goto(
      `http://127.0.0.1:${port}/server.js`,
      {
        waitUntil: "networkidle0",
      }
    );

    const serverResponseText = await serverResponse.text();

    expect(serverResponseText).toContain("Hello from the server");
    expect(serverResponseText).not.toContain("WebsocketServer");

    let pageErrors = [];
    let consoleMessages = [];

    pageOne
      .on("console", (message) => {
        consoleMessages.push(message.text());
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    await pageOne.goto(`http://127.0.0.1:${port}/browser`, {
      waitUntil: "networkidle0",
    });

    fs.writeFileSync(
      pathToBrowserEntry,
      `${originalBrowserEntryContent}// comment`
    );

    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (
          consoleMessages.filter(
            (item) => item === "[webpack-dev-server] Live Reloading enabled."
          ).length === 2 &&
          consoleMessages.includes(
            "[webpack-dev-server] App updated. Reloading..."
          )
        ) {
          clearInterval(interval);

          resolve();
        }
      }, 100);
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    pageErrors = [];
    consoleMessages = [];

    await pageOne.goto(`http://127.0.0.1:${port}/browser`, {
      waitUntil: "networkidle0",
    });

    fs.writeFileSync(
      pathToServerEntry,
      `${originalServerEntryContent}// comment`
    );

    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (
          consoleMessages.filter(
            (item) => item === "[webpack-dev-server] Live Reloading enabled."
          ).length === 2 &&
          consoleMessages.includes(
            "[webpack-dev-server] App updated. Reloading..."
          )
        ) {
          clearInterval(interval);

          resolve();
        }
      }, 100);
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    fs.writeFileSync(pathToBrowserEntry, originalBrowserEntryContent);
    fs.writeFileSync(pathToServerEntry, originalServerEntryContent);

    await browser.close();
    await server.stop();
  });

  it(`should work with universal configuration when only live reload is enabled, and do live reload for browser compiler when changing server and browser entries`, async () => {
    const compiler = webpack(universalConfiguration);
    const devServerOptions = {
      port,
      hot: false,
      liveReload: true,
    };
    const pathToBrowserEntry = path.resolve(
      __dirname,
      "../fixtures/universal-compiler-config/browser.js"
    );
    const originalBrowserEntryContent = fs.readFileSync(pathToBrowserEntry);
    const pathToServerEntry = path.resolve(
      __dirname,
      "../fixtures/universal-compiler-config/server.js"
    );
    const originalServerEntryContent = fs.readFileSync(pathToServerEntry);

    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page: pageOne, browser } = await runBrowser();

    const serverResponse = await pageOne.goto(
      `http://127.0.0.1:${port}/server.js`,
      {
        waitUntil: "networkidle0",
      }
    );

    const serverResponseText = await serverResponse.text();

    expect(serverResponseText).toContain("Hello from the server");
    expect(serverResponseText).not.toContain("WebsocketServer");

    let pageErrors = [];
    let consoleMessages = [];

    pageOne
      .on("console", (message) => {
        consoleMessages.push(message.text());
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    await pageOne.goto(`http://127.0.0.1:${port}/browser`, {
      waitUntil: "networkidle0",
    });

    fs.writeFileSync(
      pathToServerEntry,
      `${originalServerEntryContent}// comment`
    );

    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (
          consoleMessages.filter(
            (item) => item === "[webpack-dev-server] Live Reloading enabled."
          ).length === 2 &&
          consoleMessages.includes(
            "[webpack-dev-server] App updated. Reloading..."
          )
        ) {
          clearInterval(interval);

          resolve();
        }
      }, 100);
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    pageErrors = [];
    consoleMessages = [];

    await pageOne.goto(`http://127.0.0.1:${port}/browser`, {
      waitUntil: "networkidle0",
    });

    fs.writeFileSync(
      pathToBrowserEntry,
      `${originalBrowserEntryContent}// comment`
    );

    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (
          consoleMessages.filter(
            (item) => item === "[webpack-dev-server] Live Reloading enabled."
          ).length === 2 &&
          consoleMessages.includes(
            "[webpack-dev-server] App updated. Reloading..."
          )
        ) {
          clearInterval(interval);

          resolve();
        }
      }, 100);
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    fs.writeFileSync(pathToBrowserEntry, originalBrowserEntryContent);
    fs.writeFileSync(pathToServerEntry, originalServerEntryContent);

    await browser.close();
    await server.stop();
  });
});
