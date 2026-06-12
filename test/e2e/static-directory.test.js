import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { expect } from "expect";
import fs from "graceful-fs";
import { spyOn } from "jest-mock";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import config from "../fixtures/static-config/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import * as testServer from "../helpers/test-server.js";
import portsMap from "../ports-map.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = portsMap["static-directory-option"];

const staticDirectory = path.resolve(__dirname, "../fixtures/static-config");
const publicDirectory = path.resolve(staticDirectory, "public");
const otherPublicDirectory = path.resolve(staticDirectory, "other");

describe("static.directory option", () => {
  describe("to directory", () => {
    const nestedFile = path.resolve(publicDirectory, "assets/example.txt");

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
          static: {
            directory: publicDirectory,
            watch: true,
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
      fs.truncateSync(nestedFile);
    });

    it("should handle request to index route", async (t) => {
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

      t.assert.snapshot(await response.text());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should handle request to other file", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/other.html`, {
        waitUntil: "networkidle0",
      });

      t.assert.snapshot(response.status());

      t.assert.snapshot(await response.text());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("watches folder recursively", () =>
      new Promise((resolve) => {
        // chokidar emitted a change,
        // meaning it watched the file correctly
        server.staticWatchers[0].on("change", (filepath) => {
          expect(typeof filepath).toBe("string");
          resolve();
        });

        // change a file manually
        setTimeout(() => {
          fs.writeFileSync(nestedFile, "Heyo", "utf8");
        }, 1000);
      }));

    it("watches node_modules", () =>
      new Promise((resolve) => {
        const filePath = path.join(
          publicDirectory,
          "node_modules",
          "index.html",
        );

        fs.writeFileSync(filePath, "foo", "utf8");

        // chokidar emitted a change,
        // meaning it watched the file correctly
        server.staticWatchers[0].on("change", (filepath) => {
          expect(typeof filepath).toBe("string");

          fs.unlinkSync(filePath);

          resolve();
        });

        // change a file manually
        setTimeout(() => {
          fs.writeFileSync(filePath, "bar", "utf8");
        }, 1000);
      }));
  });

  describe("test listing files in folders without index.html using the option static.serveIndex: false", () => {
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

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
    });

    it("should not list the files inside the assets folder (404)", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/assets`, {
        waitUntil: "networkidle0",
      });

      t.assert.snapshot(response.status());

      t.assert.snapshot(await response.text());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should show Heyo. because bar has index.html inside it (200)", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/bar`, {
        waitUntil: "networkidle0",
      });

      t.assert.snapshot(response.status());

      t.assert.snapshot(await response.text());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });
  });

  describe("test listing files in folders without index.html using the option static.serveIndex: true", () => {
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

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
    });

    it("should list the files inside the assets folder (200)", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/assets/`, {
        waitUntil: "networkidle0",
      });

      const text = await response.text();

      t.assert.snapshot(response.status());

      expect(text).toContain("example.txt");
      expect(text).toContain("other.txt");

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should show Heyo. because bar has index.html inside it (200)", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/bar/`, {
        waitUntil: "networkidle0",
      });

      t.assert.snapshot(response.status());

      t.assert.snapshot(await response.text());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });
  });

  describe("test listing files in folders without index.html using the default static.serveIndex option (true)", () => {
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
          static: {
            directory: publicDirectory,
            watch: true,
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
    });

    it("should list the files inside the assets folder (200)", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/assets`, {
        waitUntil: "networkidle0",
      });

      const text = await response.text();

      t.assert.snapshot(response.status());

      expect(text).toContain("example.txt");
      expect(text).toContain("other.txt");

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should show Heyo. because bar has index.html inside it (200)", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/bar`, {
        waitUntil: "networkidle0",
      });

      t.assert.snapshot(response.status());

      t.assert.snapshot(await response.text());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });
  });

  describe("to multiple directories", () => {
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
          static: [publicDirectory, otherPublicDirectory],
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

    it("should handle request first directory", async (t) => {
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

      t.assert.snapshot(await response.text());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should handle request to second directory", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/foo.html`, {
        waitUntil: "networkidle0",
      });

      t.assert.snapshot(response.status());

      t.assert.snapshot(await response.text());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });
  });

  describe("testing single & multiple external paths", () => {
    let server;

    afterEach(
      () =>
        new Promise((resolve) => {
          testServer.close(() => {
            resolve();
          });
        }),
    );

    it("should throw exception (external url)", () =>
      new Promise((resolve) => {
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

            server.stopCallback(resolve);
          },
        );
      }));

    it("should not throw exception (local path with lower case first character)", () =>
      new Promise((resolve, reject) => {
        testServer.start(
          config,
          {
            static: {
              directory:
                publicDirectory.charAt(0).toLowerCase() +
                publicDirectory.slice(1),
              watch: true,
            },
            port,
          },
          (error) => {
            expect(error).toBeUndefined();
            if (error) reject(error);
            else resolve();
          },
        );
      }));

    it("should not throw exception (local path with lower case first character & has '-')", () =>
      new Promise((resolve, reject) => {
        testServer.start(
          config,
          {
            static: {
              directory: "c:\\absolute\\path\\to\\content-base",
              watch: true,
            },
            port,
          },
          (error) => {
            expect(error).toBeUndefined();
            if (error) reject(error);
            else resolve();
          },
        );
      }));

    it("should not throw exception (local path with upper case first character & has '-')", () =>
      new Promise((resolve, reject) => {
        testServer.start(
          config,
          {
            static: {
              directory: "C:\\absolute\\path\\to\\content-base",
              watch: true,
            },
            port,
          },
          (error) => {
            expect(error).toBeUndefined();
            if (error) reject(error);
            else resolve();
          },
        );
      }));

    it("should throw exception (array with absolute url)", () =>
      new Promise((resolve) => {
        server = testServer.start(
          config,
          {
            static: [publicDirectory, "https://example.com/"],
          },
          (error) => {
            expect(error.message).toBe(
              "Using a URL as static.directory is not supported",
            );

            server.stopCallback(resolve);
          },
        );
      }));
  });

  describe("defaults to PWD", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      spyOn(process, "cwd").mockImplementation(() =>
        path.resolve(staticDirectory),
      );
      compiler = webpack(config);

      server = new Server(
        {
          static: undefined,
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

    it("should handle request to /index.html", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/index.html`, {
        waitUntil: "networkidle0",
      });

      t.assert.snapshot(response.status());

      t.assert.snapshot(await response.text());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });
  });

  describe("disabled", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      // This is a somewhat weird test, but it is important that we mock
      // the PWD here, and test if /other.html in our "fake" PWD really is not requested.
      spyOn(process, "cwd").mockImplementation(() => publicDirectory);

      compiler = webpack(config);

      server = new Server(
        {
          static: false,
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

    it("should not handle request to /other.html (404)", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/index.html`, {
        waitUntil: "networkidle0",
      });

      t.assert.snapshot(response.status());

      t.assert.snapshot(await response.text());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });
  });
});
