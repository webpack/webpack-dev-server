"use strict";

const path = require("path");
const webpack = require("webpack");
const { test } = require("@playwright/test");
const { describe } = require("@playwright/test");
const { expect } = require("@playwright/test");
const { beforeEach, afterEach } = require("@playwright/test");
const jestMock = require("jest-mock");
const Server = require("../../lib/Server");
const config = require("../fixtures/static-config/webpack.config");
const port = require("../ports-map")["static-public-path-option"];

const staticDirectory = path.resolve(__dirname, "../fixtures/static-config");
const publicDirectory = path.resolve(staticDirectory, "public");
const otherPublicDirectory = path.resolve(staticDirectory, "other");
const staticPublicPath = "/serve-content-at-this-url";
const otherStaticPublicPath = "/serve-other-content-at-this-url";

describe("static.publicPath option", () => {
  describe("to directory", () => {
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
            publicPath: staticPublicPath,
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

    test("should handle request to index", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}${staticPublicPath}/`,
        {
          waitUntil: "networkidle0",
        },
      );

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

      const response = await page.goto(
        `http://127.0.0.1:${port}${staticPublicPath}/other.html`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(await response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
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
            publicPath: staticPublicPath,
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

    test("shouldn't list the files inside the assets folder (404)", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}${staticPublicPath}/assets`,
        {
          waitUntil: "networkidle0",
        },
      );

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

      const response = await page.goto(
        `http://127.0.0.1:${port}${staticPublicPath}/bar`,
        {
          waitUntil: "networkidle0",
        },
      );

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
            publicPath: staticPublicPath,
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

      const response = await page.goto(
        `http://127.0.0.1:${port}${staticPublicPath}/assets`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(await response.text()).toContain("other.txt");

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

      const response = await page.goto(
        `http://127.0.0.1:${port}${staticPublicPath}/bar`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(await response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("test listing files in folders without index.html using the option static.serveIndex default (true)", () => {
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
            publicPath: staticPublicPath,
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

      const response = await page.goto(
        `http://127.0.0.1:${port}${staticPublicPath}/assets`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(await response.text()).toContain("other.txt");

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

      const response = await page.goto(
        `http://127.0.0.1:${port}${staticPublicPath}/bar`,
        {
          waitUntil: "networkidle0",
        },
      );

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
          static: [
            {
              directory: publicDirectory,
              publicPath: staticPublicPath,
            },
            {
              directory: otherPublicDirectory,
              publicPath: staticPublicPath,
            },
          ],
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

    test("should handle request to first directory", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}${staticPublicPath}/`,
        {
          waitUntil: "networkidle0",
        },
      );

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

      const response = await page.goto(
        `http://127.0.0.1:${port}${staticPublicPath}/foo.html`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(await response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("defaults to CWD", () => {
    let cwdSpy;
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      cwdSpy = jestMock
        .spyOn(process, "cwd")
        .mockImplementation(() => staticDirectory);

      compiler = webpack(config);

      server = new Server(
        {
          static: {
            publicPath: staticPublicPath,
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
      cwdSpy.mockRestore();

      await server.stop();
    });

    test("should handle request to page", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}${staticPublicPath}/index.html`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(await response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("Content type", () => {
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
            publicPath: staticPublicPath,
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

    test("should handle request to example.txt", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}${staticPublicPath}/assets/example.txt`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(response.headers()["content-type"])).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("should ignore methods other than GET and HEAD", () => {
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
            publicPath: staticPublicPath,
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

    test("should handle GET request", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}${staticPublicPath}/`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });

    test("should handle HEAD request", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        })
        .on("request", (interceptedRequest) => {
          if (interceptedRequest.isInterceptResolutionHandled()) return;

          interceptedRequest.continue({ method: "HEAD" });
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}${staticPublicPath}/`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });

    test("should not handle POST request", async ({ page }) => {
      await page.setRequestInterception(true);

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        })
        .on("request", (interceptedRequest) => {
          interceptedRequest.continue({ method: "POST" });
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}${staticPublicPath}/`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });

    test("should not handle PUT request", async ({ page }) => {
      await page.setRequestInterception(true);

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        })
        .on("request", (interceptedRequest) => {
          interceptedRequest.continue({ method: "PUT" });
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}${staticPublicPath}/`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });

    test("should not handle DELETE request", async ({ page }) => {
      await page.setRequestInterception(true);

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        })
        .on("request", (interceptedRequest) => {
          interceptedRequest.continue({ method: "DELETE" });
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}${staticPublicPath}/`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });

    test("should not handle PATCH request", async ({ page }) => {
      await page.setRequestInterception(true);

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        })
        .on("request", (interceptedRequest) => {
          interceptedRequest.continue({ method: "PATCH" });
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}${staticPublicPath}/`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("multiple static.publicPath entries", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          static: [
            {
              directory: publicDirectory,
              publicPath: staticPublicPath,
              watch: true,
            },
            {
              directory: otherPublicDirectory,
              publicPath: otherStaticPublicPath,
              watch: true,
            },
          ],
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

    test("should handle request to the index of first path", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}${staticPublicPath}/`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(await response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });

    test("should handle request to the other file of first path", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}${staticPublicPath}/other.html`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(await response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });

    test("should handle request to the /foo route of second path", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}${otherStaticPublicPath}/foo.html`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(await response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("multiple static.publicPath entries with publicPath array", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          static: [
            {
              directory: publicDirectory,
              publicPath: staticPublicPath,
              watch: true,
            },
            {
              directory: otherPublicDirectory,
              publicPath: [staticPublicPath, otherStaticPublicPath],
              watch: true,
            },
          ],
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

    test("should handle request to the index of first path", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}${staticPublicPath}/`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(await response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });

    test("should handle request to the other file of first path", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}${staticPublicPath}/other.html`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(await response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });

    test("should handle request to the /foo route of first path", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}${staticPublicPath}/foo.html`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(await response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });

    test("should handle request to the /foo route of second path", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://127.0.0.1:${port}${otherStaticPublicPath}/foo.html`,
        {
          waitUntil: "networkidle0",
        },
      );

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(await response.text())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });
});
