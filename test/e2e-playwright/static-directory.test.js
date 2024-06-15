"use strict";

const path = require("path");
const fs = require("graceful-fs");
const webpack = require("webpack");
const { test } = require("@playwright/test");
const { describe } = require("@playwright/test");
const { expect } = require("@playwright/test");
const { beforeEach, afterEach } = require("@playwright/test");
const jestMock = require("jest-mock");
const Server = require("../../lib/Server");
const testServer = require("../helpers/test-server");
const config = require("../fixtures/static-config/webpack.config");
const port = require("../ports-map")["static-directory-option"];

const staticDirectory = path.resolve(__dirname, "../fixtures/static-config");
const publicDirectory = path.resolve(staticDirectory, "public");
const otherPublicDirectory = path.resolve(staticDirectory, "other");

describe("static.directory option", () => {
  describe("to directory", () => {
    const nestedFile = path.resolve(publicDirectory, "assets/example.txt");

    let compiler;
    let server;
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

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
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

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(await response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
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

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });

    test("Watches folder recursively", (done) => {
      // chokidar emitted a change,
      // meaning it watched the file correctly
      server.staticWatchers[0].on("change", (event) => {
        console.log(event)
        done();
      });

      // change a file manually
      setTimeout(() => {
        fs.writeFileSync(nestedFile, "Heyo", "utf8");
      }, 1000);
    });

    test("Watches node_modules", (done) => {
      const filePath = path.join(publicDirectory, "node_modules", "index.html");

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
    });
  });

  describe("test listing files in folders without index.html using the option static.serveIndex: false", () => {
    let compiler;
    let server;
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

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await server.stop();
    });

    test("should not list the files inside the assets folder (404)", async ({ page }) => {
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

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(await response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });

    test("should show Heyo. because bar has index.html inside it (200)", async ({ page }) => {
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

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(await response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("test listing files in folders without index.html using the option static.serveIndex: true", () => {
    let compiler;
    let server;
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

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await server.stop();
    });

    test("should list the files inside the assets folder (200)", async ({ page }) => {
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

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(text).toContain("example.txt");
      expect(text).toContain("other.txt");

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });

    test("should show Heyo. because bar has index.html inside it (200)", async ({ page }) => {
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

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(await response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("test listing files in folders without index.html using the default static.serveIndex option (true)", () => {
    let compiler;
    let server;
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

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await server.stop();
    });

    test("should list the files inside the assets folder (200)", async ({ page }) => {
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

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(text).toContain("example.txt");
      expect(text).toContain("other.txt");

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });

    test("should show Heyo. because bar has index.html inside it (200)", async ({ page }) => {
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

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(await response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("to multiple directories", () => {
    let compiler;
    let server;
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

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
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

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(await response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
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

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(await response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("testing single & multiple external paths", () => {
    let server;

    afterEach((done) => {
      testServer.close(() => {
        done();
      });
    });

    test("Should throw exception (external url)", (done) => {
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

    test("Should not throw exception (local path with lower case first character)", (done) => {
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

    test("Should not throw exception (local path with lower case first character & has '-')", (done) => {
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

    test("Should not throw exception (local path with upper case first character & has '-')", (done) => {
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

    test("Should throw exception (array with absolute url)", (done) => {
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

  describe("defaults to PWD", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      jestMock
        .spyOn(process, "cwd")
        .mockImplementation(() => path.resolve(staticDirectory));
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

    afterEach(async () => {
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

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(await response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("disabled", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      // This is a somewhat weird test, but it is important that we mock
      // the PWD here, and test if /other.html in our "fake" PWD really is not requested.
      jestMock.spyOn(process, "cwd").mockImplementation(() => publicDirectory);

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

    afterEach(async () => {
      await server.stop();
    });

    test("should not handle request to /other.html (404)", async ({ page }) => {
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

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(await response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });
});
