"use strict";

const path = require("path");
const fs = require("graceful-fs");
const webpack = require("webpack");
const sinon = require("sinon");
const { test } = require("../helpers/playwright-test");
const { expect } = require("../helpers/playwright-custom-expects");
const Server = require("../../lib/Server");
const testServer = require("../helpers/test-server");
const config = require("../fixtures/static-config/webpack.config");
const port = require("../ports-map")["static-directory-option"];

const staticDirectory = path.resolve(__dirname, "../fixtures/static-config");
const publicDirectory = path.resolve(staticDirectory, "public");
const otherPublicDirectory = path.resolve(staticDirectory, "other");

test.describe("static.directory option", () => {
  test.describe("to directory", () => {
    const nestedFile = path.resolve(publicDirectory, "assets/example.txt");

    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    test.beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: publicDirectory,
            watch: true,
          },
          port,
        },
        compiler,
      );

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    test.afterEach(async () => {
      await server.stop();
      fs.truncateSync(nestedFile);
    });

    test("should handle request to index route", async ({ page }) => {
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

      expect(response.status()).toMatchSnapshotWithArray("response status");

      expect(await response.text()).toMatchSnapshotWithArray("response text");

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });

    test("should handle request to other file", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/other.html`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshotWithArray("response status");

      expect(response.text()).toMatchSnapshotWithArray("response text");

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });

    test("Watches folder recursively", () => {
      // chokidar emitted a change,
      // meaning it watched the file correctly
      server.staticWatchers[0].on("change", (event) => {
        console.log(event);
      });

      // change a file manually
      setTimeout(() => {
        fs.writeFileSync(nestedFile, "Heyo", "utf8");
      }, 1000);
    });

    test.fixme(
      "Watches node_modules",
      { tag: "@fails" },
      ({ done }) => {
        const filePath = path.join(
          publicDirectory,
          "node_modules",
          "index.html",
        );

        fs.writeFileSync(filePath, "foo", "utf8");

        // chokidar emitted a change,
        // meaning it watched the file correctly
        server.staticWatchers[0].on("change", () => {
          fs.unlinkSync(filePath);

          done();
        });

        // change a file manually
        setTimeout(() => {
          fs.writeFileSync(filePath, "bar", "utf8");
        }, 1000);
      },
      { timeout: 60000 },
    );
  });

  test.describe("test listing files in folders without index.html using the option static.serveIndex: false", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    test.beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: publicDirectory,
            watch: true,
            serveIndex: false,
          },
          port,
        },
        compiler,
      );

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    test.afterEach(async () => {
      await server.stop();
    });

    test("should not list the files inside the assets folder (404)", async ({
      page,
    }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/assets`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshotWithArray("response status");

      expect(await response.text()).toMatchSnapshotWithArray("response text");

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });

    test("should show Heyo. because bar has index.html inside it (200)", async ({
      page,
    }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/bar`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshotWithArray("response status");

      expect(await response.text()).toMatchSnapshotWithArray("response text");

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });
  });

  test.describe("test listing files in folders without index.html using the option static.serveIndex: true", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    test.beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: publicDirectory,
            watch: true,
            serveIndex: true,
          },
          port,
        },
        compiler,
      );

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    test.afterEach(async () => {
      await server.stop();
    });

    test("should list the files inside the assets folder (200)", async ({
      page,
    }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/assets/`, {
        waitUntil: "networkidle0",
      });

      const text = await response.text();

      expect(response.status()).toMatchSnapshotWithArray("response status");

      expect(text).toContain("example.txt");
      expect(text).toContain("other.txt");

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });

    test("should show Heyo. because bar has index.html inside it (200)", async ({
      page,
    }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/bar/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshotWithArray("response status");

      expect(await response.text()).toMatchSnapshotWithArray("response text");

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });
  });

  test.describe("test listing files in folders without index.html using the default static.serveIndex option (true)", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    test.beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: publicDirectory,
            watch: true,
          },
          port,
        },
        compiler,
      );

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    test.afterEach(async () => {
      await server.stop();
    });

    test("should list the files inside the assets folder (200)", async ({
      page,
    }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/assets`, {
        waitUntil: "networkidle0",
      });

      const text = await response.text();

      expect(response.status()).toMatchSnapshotWithArray("response status");

      expect(text).toContain("example.txt");
      expect(text).toContain("other.txt");

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });

    test("should show Heyo. because bar has index.html inside it (200)", async ({
      page,
    }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/bar`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshotWithArray("response status");

      expect(await response.text()).toMatchSnapshotWithArray("response text");

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });
  });

  test.describe("to multiple directories", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    test.beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          static: [publicDirectory, otherPublicDirectory],
          port,
        },
        compiler,
      );

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    test.afterEach(async () => {
      await server.stop();
    });

    test("should handle request first directory", async ({ page }) => {
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

      expect(response.status()).toMatchSnapshotWithArray("response status");

      expect(await response.text()).toMatchSnapshotWithArray("response text");

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });

    test("should handle request to second directory", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/foo.html`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshotWithArray("response status");

      expect(await response.text()).toMatchSnapshotWithArray("response text");

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });
  });

  test.describe("testing single & multiple external paths", () => {
    let server;

    test.afterEach(({ done }) => {
      testServer.close(() => {
        done();
      });
    });

    test("Should throw exception (external url)", ({ done }) => {
      expect.assertions(1);

      server = testServer.start(
        config,
        {
          static: "https://example.com/",
        },
        (error) => {
          expect(error.message).toBe(
            "Using a URL as static.directory is not supported",
          );

          server.stopCallback(done);
        },
      );
    });

    test("Should not throw exception (local path with lower case first character)", ({
      done,
    }) => {
      testServer.start(
        config,
        {
          static: {
            directory:
              publicDirectory.charAt(0).toLowerCase() +
              publicDirectory.substring(1),
            watch: true,
          },
          port,
        },
        done,
      );
    });

    test("Should not throw exception (local path with lower case first character & has '-')", ({
      done,
    }) => {
      testServer.start(
        config,
        {
          static: {
            directory: "c:\\absolute\\path\\to\\content-base",
            watch: true,
          },
          port,
        },
        done,
      );
    });

    test("Should not throw exception (local path with upper case first character & has '-')", ({
      done,
    }) => {
      testServer.start(
        config,
        {
          static: {
            directory: "C:\\absolute\\path\\to\\content-base",
            watch: true,
          },
          port,
        },
        done,
      );
    });

    test("Should throw exception (array with absolute url)", ({ done }) => {
      server = testServer.start(
        config,
        {
          static: [publicDirectory, "https://example.com/"],
        },
        (error) => {
          expect(error.message).toBe(
            "Using a URL as static.directory is not supported",
          );

          server.stopCallback(done);
        },
      );
    });
  });

  test.describe("defaults to PWD", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    test.beforeEach(async () => {
      sinon.stub(process, "cwd").callsFake(() => path.resolve(staticDirectory));
      compiler = webpack(config);

      server = new Server(
        {
          // eslint-disable-next-line no-undefined
          static: undefined,
          port,
        },
        compiler,
      );

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    test.afterEach(async () => {
      await server.stop();
    });

    test("should handle request to /index.html", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/index.html`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshotWithArray("response status");

      expect(await response.text()).toMatchSnapshotWithArray("response text");

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });
  });

  // FIXME: check the below error
  // TypeError: Attempted to wrap cwd which is already wrapped
  // TypeError: Cannot read properties of undefined (reading 'stop')
  //
  // at checkWrappedMethod (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/sinon/lib/sinon/util/core/wrap-method.js:67:21)
  // at wrapMethod (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/sinon/lib/sinon/util/core/wrap-method.js:132:13)
  // at Function.stub (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/sinon/lib/sinon/stub.js:130:44)
  // at Sandbox.stub (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/sinon/lib/sinon/sandbox.js:454:39)
  // at /Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/test/e2e/static-directory.test.js:617:13
  // at /Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/fixtureRunner.js:254:13
  // at /Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/testInfo.js:297:17
  // at TimeoutManager.withRunnable (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/timeoutManager.js:53:34)
  // at TestInfoImpl._runAsStage (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/testInfo.js:295:34)
  // at FixtureRunner.resolveParametersAndRunFunction (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/fixtureRunner.js:250:20)
  // at /Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/workerMain.js:588:11
  // at /Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/testInfo.js:297:11
  // at TimeoutManager.withRunnable (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/timeoutManager.js:41:27)
  // at TestInfoImpl._runAsStage (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/testInfo.js:295:7)
  // at WorkerMain._runEachHooksForSuites (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/workerMain.js:576:9)
  // at /Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/workerMain.js:317:9
  // at /Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/testInfo.js:297:11
  // at TimeoutManager.withRunnable (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/timeoutManager.js:41:27)
  // at TestInfoImpl._runAsStage (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/testInfo.js:295:7)
  // at /Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/workerMain.js:306:7
  // at /Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/testInfo.js:297:11
  // at TimeoutManager.withRunnable (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/timeoutManager.js:41:27)
  // at TestInfoImpl._runAsStage (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/testInfo.js:295:7)
  // at WorkerMain._runTest (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/workerMain.js:278:5)
  // at WorkerMain.runTestGroup (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/workerMain.js:202:11)
  // at process.<anonymous> (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/common/process.js:94:22)
  //   at extendObjectWithWrappedMethods (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/sinon/lib/sinon/util/core/wrap-method.js:173:34)
  //   at wrapMethod (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/sinon/lib/sinon/util/core/wrap-method.js:161:5)
  //   at Function.stub (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/sinon/lib/sinon/stub.js:130:44)
  //   at Sandbox.stub (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/sinon/lib/sinon/sandbox.js:454:39)
  //   at /Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/test/e2e/static-directory.test.js:561:13
  //   at /Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/fixtureRunner.js:254:13
  //   at /Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/testInfo.js:297:17
  //   at TimeoutManager.withRunnable (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/timeoutManager.js:53:34)
  //   at TestInfoImpl._runAsStage (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/testInfo.js:295:34)
  //   at FixtureRunner.resolveParametersAndRunFunction (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/fixtureRunner.js:250:20)
  //   at /Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/workerMain.js:588:11
  //   at /Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/testInfo.js:297:11
  //   at TimeoutManager.withRunnable (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/timeoutManager.js:41:27)
  //   at TestInfoImpl._runAsStage (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/testInfo.js:295:7)
  //   at WorkerMain._runEachHooksForSuites (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/workerMain.js:576:9)
  //   at /Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/workerMain.js:317:9
  //   at /Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/testInfo.js:297:11
  //   at TimeoutManager.withRunnable (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/timeoutManager.js:41:27)
  //   at TestInfoImpl._runAsStage (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/testInfo.js:295:7)
  //   at /Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/workerMain.js:306:7
  //   at /Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/testInfo.js:297:11
  //   at TimeoutManager.withRunnable (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/timeoutManager.js:41:27)
  //   at TestInfoImpl._runAsStage (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/testInfo.js:295:7)
  //   at WorkerMain._runTest (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/workerMain.js:278:5)
  //   at WorkerMain.runTestGroup (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/worker/workerMain.js:202:11)
  //   at process.<anonymous> (/Users/mahdi/tmp/webpack-dev-server/test/fixtures/static-config/node_modules/playwright/lib/common/process.js:94:22)
  test.describe.fixme("disabled", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    test.beforeEach(async () => {
      // This is a somewhat weird test, but it is important that we mock
      // the PWD here, and test if /other.html in our "fake" PWD really is not requested.
      sinon.stub(process, "cwd").callsFake(() => publicDirectory);

      compiler = webpack(config);

      server = new Server(
        {
          static: false,
          port,
        },
        compiler,
      );

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    test.afterEach(async () => {
      await server.stop();
    });

    test(
      "should not handle request to /other.html (404)",
      { tags: "@flaky" },
      async ({ page }) => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(
          `http://127.0.0.1:${port}/index.html`,
          {
            waitUntil: "networkidle0",
          },
        );

        expect(response.status()).toMatchSnapshotWithArray("response status");

        expect(await response.text()).toMatchSnapshotWithArray("response text");

        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshotWithArray("console messages");

        expect(pageErrors).toMatchSnapshotWithArray("page errors");
      },
    );
  });
});
