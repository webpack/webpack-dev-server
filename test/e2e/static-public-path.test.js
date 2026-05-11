import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, it } from "node:test";
import { expect } from "expect";
import { spyOn } from "jest-mock";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import config from "../fixtures/static-config/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = portsMap["static-public-path-option"];

const staticDirectory = path.resolve(__dirname, "../fixtures/static-config");
const publicDirectory = path.resolve(staticDirectory, "public");
const otherPublicDirectory = path.resolve(staticDirectory, "other");
const staticPublicPath = "/serve-content-at-this-url";
const otherStaticPublicPath = "/serve-other-content-at-this-url";

describe("static.publicPath option", () => {
  describe("to directory", () => {
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
            publicPath: staticPublicPath,
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

    it("should handle request to index", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://localhost:${port}${staticPublicPath}/`,
        {
          waitUntil: "networkidle0",
        },
      );

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

      const response = await page.goto(
        `http://localhost:${port}${staticPublicPath}/other.html`,
        {
          waitUntil: "networkidle0",
        },
      );

      t.assert.snapshot(response.status());

      t.assert.snapshot(await response.text());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });
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
            publicPath: staticPublicPath,
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

    it("shouldn't list the files inside the assets folder (404)", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://localhost:${port}${staticPublicPath}/assets`,
        {
          waitUntil: "networkidle0",
        },
      );

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

      const response = await page.goto(
        `http://localhost:${port}${staticPublicPath}/bar`,
        {
          waitUntil: "networkidle0",
        },
      );

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
            publicPath: staticPublicPath,
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

      const response = await page.goto(
        `http://localhost:${port}${staticPublicPath}/assets`,
        {
          waitUntil: "networkidle0",
        },
      );

      t.assert.snapshot(response.status());

      expect(await response.text()).toContain("other.txt");

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

      const response = await page.goto(
        `http://localhost:${port}${staticPublicPath}/bar`,
        {
          waitUntil: "networkidle0",
        },
      );

      t.assert.snapshot(response.status());

      t.assert.snapshot(await response.text());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });
  });

  describe("test listing files in folders without index.html using the option static.serveIndex default (true)", () => {
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
            publicPath: staticPublicPath,
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

      const response = await page.goto(
        `http://localhost:${port}${staticPublicPath}/assets`,
        {
          waitUntil: "networkidle0",
        },
      );

      t.assert.snapshot(response.status());

      expect(await response.text()).toContain("other.txt");

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

      const response = await page.goto(
        `http://localhost:${port}${staticPublicPath}/bar`,
        {
          waitUntil: "networkidle0",
        },
      );

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

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
    });

    it("should handle request to first directory", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://localhost:${port}${staticPublicPath}/`,
        {
          waitUntil: "networkidle0",
        },
      );

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

      const response = await page.goto(
        `http://localhost:${port}${staticPublicPath}/foo.html`,
        {
          waitUntil: "networkidle0",
        },
      );

      t.assert.snapshot(response.status());

      t.assert.snapshot(await response.text());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });
  });

  describe("defaults to CWD", () => {
    let cwdSpy;
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      cwdSpy = spyOn(process, "cwd").mockImplementation(() => staticDirectory);

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

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      cwdSpy.mockRestore();

      await browser.close();
      await server.stop();
    });

    it("should handle request to page", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://localhost:${port}${staticPublicPath}/index.html`,
        {
          waitUntil: "networkidle0",
        },
      );

      t.assert.snapshot(response.status());

      t.assert.snapshot(await response.text());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });
  });

  describe("Content type", () => {
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
            publicPath: staticPublicPath,
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

    it("should handle request to example.txt", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://localhost:${port}${staticPublicPath}/assets/example.txt`,
        {
          waitUntil: "networkidle0",
        },
      );

      t.assert.snapshot(response.status());

      t.assert.snapshot(response.headers()["content-type"]);

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });
  });

  describe("should ignore methods other than GET and HEAD", () => {
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
            publicPath: staticPublicPath,
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

    it("should handle GET request", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://localhost:${port}${staticPublicPath}/`,
        {
          waitUntil: "networkidle0",
        },
      );

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should handle HEAD request", async (t) => {
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
        `http://localhost:${port}${staticPublicPath}/`,
        {
          waitUntil: "networkidle0",
        },
      );

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should not handle POST request", async (t) => {
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
        `http://localhost:${port}${staticPublicPath}/`,
        {
          waitUntil: "networkidle0",
        },
      );

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should not handle PUT request", async (t) => {
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
        `http://localhost:${port}${staticPublicPath}/`,
        {
          waitUntil: "networkidle0",
        },
      );

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should not handle DELETE request", async (t) => {
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
        `http://localhost:${port}${staticPublicPath}/`,
        {
          waitUntil: "networkidle0",
        },
      );

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should not handle PATCH request", async (t) => {
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
        `http://localhost:${port}${staticPublicPath}/`,
        {
          waitUntil: "networkidle0",
        },
      );

      t.assert.snapshot(response.status());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });
  });

  describe("multiple static.publicPath entries", () => {
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

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
    });

    it("should handle request to the index of first path", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://localhost:${port}${staticPublicPath}/`,
        {
          waitUntil: "networkidle0",
        },
      );

      t.assert.snapshot(response.status());

      t.assert.snapshot(await response.text());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should handle request to the other file of first path", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://localhost:${port}${staticPublicPath}/other.html`,
        {
          waitUntil: "networkidle0",
        },
      );

      t.assert.snapshot(response.status());

      t.assert.snapshot(await response.text());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should handle request to the /foo route of second path", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://localhost:${port}${otherStaticPublicPath}/foo.html`,
        {
          waitUntil: "networkidle0",
        },
      );

      t.assert.snapshot(response.status());

      t.assert.snapshot(await response.text());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });
  });

  describe("multiple static.publicPath entries with publicPath array", () => {
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

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
    });

    it("should handle request to the index of first path", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://localhost:${port}${staticPublicPath}/`,
        {
          waitUntil: "networkidle0",
        },
      );

      t.assert.snapshot(response.status());

      t.assert.snapshot(await response.text());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should handle request to the other file of first path", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://localhost:${port}${staticPublicPath}/other.html`,
        {
          waitUntil: "networkidle0",
        },
      );

      t.assert.snapshot(response.status());

      t.assert.snapshot(await response.text());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should handle request to the /foo route of first path", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://localhost:${port}${staticPublicPath}/foo.html`,
        {
          waitUntil: "networkidle0",
        },
      );

      t.assert.snapshot(response.status());

      t.assert.snapshot(await response.text());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });

    it("should handle request to the /foo route of second path", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(
        `http://localhost:${port}${otherStaticPublicPath}/foo.html`,
        {
          waitUntil: "networkidle0",
        },
      );

      t.assert.snapshot(response.status());

      t.assert.snapshot(await response.text());

      t.assert.snapshot(consoleMessages.map((message) => message.text()));

      t.assert.snapshot(pageErrors);
    });
  });
});
