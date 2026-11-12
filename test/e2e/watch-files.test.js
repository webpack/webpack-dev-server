import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { expect } from "expect";
import fs from "graceful-fs";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import config from "../fixtures/watch-files-config/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = portsMap["watch-files-option"];

const watchDir = path.resolve(
  __dirname,
  "../fixtures/watch-files-config/public",
);

// `page.waitForNavigation()` only sees a navigation that begins after it is
// called. Waiting for the watcher first and asking for the navigation inside
// that handler therefore loses the race whenever the server gets its reload in
// first, and the test then hangs for the whole timeout instead of failing. Both
// waits below are armed before the write that triggers them.
const onceChange = (watcher) =>
  new Promise((resolve) => {
    watcher.once("change", resolve);
  });

// Resolves once the watcher has finished its initial scan.
const onceReady = (watcher) =>
  new Promise((resolve) => {
    if (watcher._readyEmitted) {
      resolve();
    } else {
      watcher.once("ready", resolve);
    }
  });

// Resolves with the paths of the next `count` changes the watcher reports.
const collectChanges = (watcher, count) =>
  new Promise((resolve) => {
    const changedPaths = [];

    const onChange = (changedPath) => {
      changedPaths.push(changedPath);

      if (changedPaths.length === count) {
        watcher.off("change", onChange);
        resolve(changedPaths);
      }
    };

    watcher.on("change", onChange);
  });

describe("watchFiles option", () => {
  describe("should work with string and path to file", () => {
    const file = path.join(watchDir, "assets/example.txt");
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
          watchFiles: file,
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
      fs.truncateSync(file);
    });

    it("should reload when file content is changed", async (t) => {
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

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);

      const navigation = page.waitForNavigation({ waitUntil: "networkidle0" });
      const change = onceChange(server.staticWatchers[0]);

      // change file content
      fs.writeFileSync(file, "Kurosaki Ichigo", "utf8");

      // page reload
      const [changedPath] = await Promise.all([change, navigation]);

      expect(changedPath).toBe(file);
    });
  });

  describe("should work with string and path to directory", () => {
    const file = path.join(watchDir, "assets/example.txt");
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
          watchFiles: watchDir,
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
      fs.truncateSync(file);
    });

    it("should reload when file content is changed", async (t) => {
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

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);

      const navigation = page.waitForNavigation({ waitUntil: "networkidle0" });
      const change = onceChange(server.staticWatchers[0]);

      // change file content
      fs.writeFileSync(file, "Kurosaki Ichigo", "utf8");

      // page reload
      const [changedPath] = await Promise.all([change, navigation]);

      expect(changedPath).toBe(file);
    });
  });

  describe("should work with string and glob", () => {
    const file = path.join(watchDir, "assets/example.txt");
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
          watchFiles: `${watchDir}/**/*`,
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
      fs.truncateSync(file);
    });

    it("should reload when file content is changed", async (t) => {
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

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);

      const navigation = page.waitForNavigation({ waitUntil: "networkidle0" });
      const change = onceChange(server.staticWatchers[0]);

      // change file content
      fs.writeFileSync(file, "Kurosaki Ichigo", "utf8");

      // page reload
      const [changedPath] = await Promise.all([change, navigation]);

      expect(changedPath).toBe(file);
    });
  });

  describe("should work with array of globs", () => {
    const file = path.join(watchDir, "assets/example.txt");
    const other = path.join(watchDir, "assets/other.txt");
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
          watchFiles: [`${watchDir}/**/*.txt`, `${watchDir}/**/*.js`],
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
      fs.truncateSync(file);
      fs.truncateSync(other);
    });

    it("should reload when file content is changed", async (t) => {
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

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);

      const navigation = page.waitForNavigation({ waitUntil: "networkidle0" });
      const change = onceChange(server.staticWatchers[0]);

      // change file content
      fs.writeFileSync(file, "Kurosaki Ichigo", "utf8");

      // page reload
      const [changedPath] = await Promise.all([change, navigation]);

      expect(changedPath).toBe(file);
    });
  });

  describe("should work with directory and ignored option to filter files", () => {
    const file = path.join(watchDir, "assets/example.txt");
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
          watchFiles: {
            paths: watchDir,
            options: {
              ignored: (filePath, stats) =>
                stats?.isFile() && !filePath.endsWith(".txt"),
            },
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
      fs.truncateSync(file);
    });

    it("should reload when file content is changed", async (t) => {
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

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);

      const navigation = page.waitForNavigation({ waitUntil: "networkidle0" });
      const change = onceChange(server.staticWatchers[0]);

      // change file content
      fs.writeFileSync(file, "Kurosaki Ichigo", "utf8");

      // page reload
      const [changedPath] = await Promise.all([change, navigation]);

      expect(changedPath).toBe(file);
    });

    it("should not reload when a non-matching file is changed", async (t) => {
      const ignoredFile = path.join(watchDir, "assets/example.js");

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

      t.assert.snapshot(response.status());

      // change ignored file content
      fs.writeFileSync(ignoredFile, "// changed", "utf8");

      // wait a bit to ensure no reload happens
      await new Promise((resolve) => {
        let changed = false;

        server.staticWatchers[0].on("change", () => {
          changed = true;
        });

        setTimeout(() => {
          expect(changed).toBe(false);
          resolve();
        }, 2000);
      });

      // restore file
      fs.writeFileSync(ignoredFile, "// test file\n", "utf8");
    });
  });

  describe("should work with ignored option using glob string", () => {
    const file = path.join(watchDir, "assets/example.txt");
    const ignoredFile = path.join(watchDir, "assets/example.js");
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
          watchFiles: {
            paths: watchDir,
            options: {
              ignored: `${watchDir}/**/*.js`,
            },
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
      fs.truncateSync(file);
    });

    it("should reload when file content is changed", async (t) => {
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

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);

      const navigation = page.waitForNavigation({ waitUntil: "networkidle0" });
      const change = onceChange(server.staticWatchers[0]);

      // change file content
      fs.writeFileSync(file, "Kurosaki Ichigo", "utf8");

      // page reload
      const [changedPath] = await Promise.all([change, navigation]);

      expect(changedPath).toBe(file);
    });

    it("should not reload when an ignored glob file is changed", async (t) => {
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

      t.assert.snapshot(response.status());

      // change ignored file content
      fs.writeFileSync(ignoredFile, "// changed", "utf8");

      // wait a bit to ensure no reload happens
      await new Promise((resolve) => {
        let changed = false;

        server.staticWatchers[0].on("change", () => {
          changed = true;
        });

        setTimeout(() => {
          expect(changed).toBe(false);
          resolve();
        }, 2000);
      });

      // restore file
      fs.writeFileSync(ignoredFile, "// test file\n", "utf8");
    });
  });

  describe("should work with ignored option using glob array", () => {
    const file = path.join(watchDir, "assets/example.txt");
    const ignoredFile = path.join(watchDir, "assets/example.js");
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
          watchFiles: {
            paths: watchDir,
            options: {
              ignored: [`${watchDir}/**/*.js`],
            },
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
      fs.truncateSync(file);
    });

    it("should reload when file content is changed", async (t) => {
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

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);

      const navigation = page.waitForNavigation({ waitUntil: "networkidle0" });
      const change = onceChange(server.staticWatchers[0]);

      // change file content
      fs.writeFileSync(file, "Kurosaki Ichigo", "utf8");

      // page reload
      const [changedPath] = await Promise.all([change, navigation]);

      expect(changedPath).toBe(file);
    });

    it("should not reload when an ignored glob file is changed", async (t) => {
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

      t.assert.snapshot(response.status());

      // change ignored file content
      fs.writeFileSync(ignoredFile, "// changed", "utf8");

      // wait a bit to ensure no reload happens
      await new Promise((resolve) => {
        let changed = false;

        server.staticWatchers[0].on("change", () => {
          changed = true;
        });

        setTimeout(() => {
          expect(changed).toBe(false);
          resolve();
        }, 2000);
      });

      // restore file
      fs.writeFileSync(ignoredFile, "// test file\n", "utf8");
    });
  });

  describe("should not crash if file doesn't exist", () => {
    const nonExistFile = path.join(watchDir, "assets/non-exist.txt");
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      try {
        fs.unlinkSync(nonExistFile);
      } catch {
        // ignore
      }

      compiler = webpack(config);

      server = new Server(
        {
          watchFiles: nonExistFile,
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

    it("should reload when file content is changed", async (t) => {
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

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);

      const navigation = page.waitForNavigation({ waitUntil: "networkidle0" });
      const change = onceChange(server.staticWatchers[0]);

      // create file content
      setTimeout(() => {
        fs.writeFileSync(nonExistFile, "Kurosaki Ichigo", "utf8");
        // change file content
        setTimeout(() => {
          fs.writeFileSync(nonExistFile, "Kurosaki Ichigo", "utf8");
        }, 1000);
      }, 1000);

      // page reload
      const [changedPath] = await Promise.all([change, navigation]);

      expect(changedPath).toBe(nonExistFile);
    });
  });

  describe("should work with object with single path", () => {
    const file = path.join(watchDir, "assets/example.txt");
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
          watchFiles: { paths: file },
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
      fs.truncateSync(file);
    });

    it("should reload when file content is changed", async (t) => {
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

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);

      const navigation = page.waitForNavigation({ waitUntil: "networkidle0" });
      const change = onceChange(server.staticWatchers[0]);

      // change file content
      fs.writeFileSync(file, "Kurosaki Ichigo", "utf8");

      // page reload
      const [changedPath] = await Promise.all([change, navigation]);

      expect(changedPath).toBe(file);
    });
  });

  describe("should work with object with multiple paths", () => {
    const file = path.join(watchDir, "assets/example.txt");
    const other = path.join(watchDir, "assets/other.txt");
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
          watchFiles: { paths: [file, other] },
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
      fs.truncateSync(file);
      fs.truncateSync(other);
    });

    it("should reload when file content is changed", async (t) => {
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

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);

      const navigation = page.waitForNavigation({ waitUntil: "networkidle0" });
      // Two writes back to back can be served by a single reload, so the page
      // is only required to navigate once. What is under test is that the
      // watcher reports both paths.
      const changes = collectChanges(server.staticWatchers[0], 2);

      // change file content
      fs.writeFileSync(file, "foo", "utf8");
      fs.writeFileSync(other, "bar", "utf8");

      // page reload
      const [changedPaths] = await Promise.all([changes, navigation]);

      expect(changedPaths.toSorted()).toEqual([file, other].toSorted());
    });
  });

  describe("should work with array config", () => {
    const file = path.join(watchDir, "assets/example.txt");
    const other = path.join(watchDir, "assets/other.txt");
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
          watchFiles: [{ paths: [file] }, other],
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
      fs.truncateSync(file);
      fs.truncateSync(other);
    });

    it("should reload when file content is changed", async (t) => {
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

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);

      const navigation = page.waitForNavigation({ waitUntil: "networkidle0" });
      // As above, one reload can serve both writes; each watcher reporting its
      // own path is what this config is being tested for.
      const changeOne = onceChange(server.staticWatchers[0]);
      const changeTwo = onceChange(server.staticWatchers[1]);

      // change file content
      fs.writeFileSync(file, "foo", "utf8");
      fs.writeFileSync(other, "bar", "utf8");

      // page reload
      const [changedOne, changedTwo] = await Promise.all([
        changeOne,
        changeTwo,
        navigation,
      ]);

      expect(changedOne).toBe(file);
      expect(changedTwo).toBe(other);
    });
  });

  describe("should work with options", () => {
    const file = path.join(watchDir, "assets/example.txt");

    const optionCases = [
      {
        interval: undefined,
      },
      {
        usePolling: undefined,
      },
      {
        persistent: undefined,
      },
      {
        followSymlinks: undefined,
      },
      {
        atomic: undefined,
      },
      {
        alwaysStat: undefined,
      },
      {
        depth: undefined,
      },
      {
        ignorePermissionErrors: undefined,
      },
      {
        poll: true,
      },
      {
        poll: 200,
      },
      {
        usePolling: true,
      },
      {
        usePolling: true,
        poll: 200,
      },
      {
        usePolling: false,
      },
      {
        usePolling: false,
        poll: 200,
      },
      {
        usePolling: false,
        poll: true,
      },
      {
        interval: 400,
        poll: 200,
      },
      {
        usePolling: true,
        interval: 200,
        poll: 400,
      },
      {
        usePolling: false,
        interval: 200,
        poll: 400,
      },
    ];

    for (const optionCase of optionCases) {
      describe(JSON.stringify(optionCase), () => {
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
              watchFiles: {
                paths: file,
                options: optionCase,
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
          await server.stop();
          await browser.close();
          fs.truncateSync(file);
        });

        it("should reload when file content is changed", async (t) => {
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

          // should pass correct options to chokidar config
          t.assert.snapshot(server.staticWatchers[0].options);

          t.assert.snapshot(response.status());

          t.assert.snapshot(consoleMessages.map((message) => message.text()));

          t.assert.snapshot(pageErrors);

          const navigation = page.waitForNavigation({
            waitUntil: "networkidle0",
          });
          const change = onceChange(server.staticWatchers[0]);

          // change file content
          fs.writeFileSync(file, "Kurosaki Ichigo", "utf8");

          // page reload
          const [changedPath] = await Promise.all([change, navigation]);

          expect(changedPath).toBe(file);
        });
      });
    }
  });

  describe("should watch files created after startup that match a glob", () => {
    const newFile = path.join(watchDir, "assets/created-later.txt");
    let compiler;
    let server;
    let page;
    let browser;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          watchFiles: `${watchDir}/**/*.txt`,
          port,
        },
        compiler,
      );

      await server.start();

      ({ page, browser } = await runBrowser());
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
      fs.rmSync(newFile, { force: true });
    });

    it("should reload when a newly created matching file is changed", async () => {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      await onceReady(server.staticWatchers[0]);

      fs.writeFileSync(newFile, "", "utf8");

      // Give the watcher time to pick the new file up.
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });

      const navigation = page.waitForNavigation({ waitUntil: "networkidle0" });
      const change = onceChange(server.staticWatchers[0]);

      fs.writeFileSync(newFile, "Kurosaki Ichigo", "utf8");

      const changedPath = await Promise.race([
        Promise.all([change, navigation]).then(([item]) => item),
        new Promise((resolve) => {
          setTimeout(() => resolve("timeout"), 5000);
        }),
      ]);

      expect(changedPath).toBe(newFile);
    });
  });

  describe("should match ignored globs against files created after startup", () => {
    const newIgnoredFile = path.join(watchDir, "assets/created-later.js");
    const ignored = `${watchDir}/**/*.js`;
    let watchOptions;
    let compiler;
    let server;

    beforeEach(async () => {
      compiler = webpack(config);
      watchOptions = { ignored };

      server = new Server(
        {
          watchFiles: {
            paths: watchDir,
            options: watchOptions,
          },
          port,
        },
        compiler,
      );

      await server.start();
    });

    afterEach(async () => {
      await server.stop();
      fs.rmSync(newIgnoredFile, { force: true });
    });

    it("should not mutate the passed options", async () => {
      const options = { ignored };

      await server.watchFiles(watchDir, options);

      expect(options).toEqual({ ignored });
      expect(server.options.watchFiles[0].options.ignored).toBe(ignored);
    });

    it("should not report changes of a newly created ignored file", async () => {
      await onceReady(server.staticWatchers[0]);

      fs.writeFileSync(newIgnoredFile, "", "utf8");

      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });

      let changed = false;

      server.staticWatchers[0].on("change", () => {
        changed = true;
      });

      fs.writeFileSync(newIgnoredFile, "// changed", "utf8");

      await new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });

      expect(changed).toBe(false);
    });
  });
});
