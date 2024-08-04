"use strict";

const https = require("https");
const path = require("path");
const fs = require("graceful-fs");
const request = require("supertest");
const spdy = require("spdy");
const webpack = require("webpack");
const sinon = require("sinon");
const { test } = require("../helpers/playwright-test");
const { expect } = require("../helpers/playwright-custom-expects");
const Server = require("../../lib/Server");
const config = require("../fixtures/static-config/webpack.config");
const customHTTP = require("../helpers/custom-http");
const normalizeOptions = require("../helpers/normalize-options");
const port = require("../ports-map")["server-option"];

const httpsCertificateDirectory = path.resolve(
  __dirname,
  "../fixtures/https-certificate",
);

const staticDirectory = path.resolve(
  __dirname,
  "../fixtures/static-config/public",
);

test.describe("server option", () => {
  test.describe("as string", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    test.describe("http", () => {
      test.beforeEach(async () => {
        compiler = webpack(config);

        server = new Server(
          {
            static: {
              directory: staticDirectory,
              watch: false,
            },
            server: "http",
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

      test("should handle GET request to index route (/)", async ({ page }) => {
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

        const HTTPVersion = await page.evaluate(
          () => performance.getEntries()[0].nextHopProtocol,
        );

        expect(HTTPVersion).not.toEqual("h2");

        expect(response.status()).toBe(200);

        await expect(page).toHaveScreenshot();

        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshotWithArray("console messages");

        expect(pageErrors).toMatchSnapshotWithArray("page errors");
      });
    });

    test.describe("custom-http", () => {
      test.beforeEach(async () => {
        compiler = webpack(config);

        server = new Server(
          {
            static: {
              directory: staticDirectory,
              watch: false,
            },
            server: path.resolve(__dirname, "../helpers/custom-http.js"),
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

      test("should handle GET request to index route (/)", async ({ page }) => {
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

        const HTTPVersion = await page.evaluate(
          () => performance.getEntries()[0].nextHopProtocol,
        );

        expect(HTTPVersion).not.toEqual("h2");

        expect(response.status()).toBe(200);

        await expect(page).toHaveScreenshot();

        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshotWithArray("console messages");

        expect(pageErrors).toMatchSnapshotWithArray("page errors");
      });
    });

    test.describe("https", () => {
      test.beforeEach(async () => {
        compiler = webpack(config);

        server = new Server(
          {
            static: {
              directory: staticDirectory,
              watch: false,
            },
            server: "https",
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

      test("should handle GET request to index route (/)", async ({ page }) => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`https://127.0.0.1:${port}/`, {
          waitUntil: "networkidle0",
        });

        const HTTPVersion = await page.evaluate(
          () => performance.getEntries()[0].nextHopProtocol,
        );

        expect(HTTPVersion).not.toEqual("h2");

        expect(response.status()).toBe(200);

        await expect(page).toHaveScreenshot();

        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshotWithArray("console messages");

        expect(pageErrors).toMatchSnapshotWithArray("page errors");
      });
    });

    test.describe("spdy", () => {
      test.beforeEach(async () => {
        compiler = webpack(config);

        server = new Server(
          {
            static: {
              directory: staticDirectory,
              watch: false,
            },
            server: "spdy",
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

      test("should handle GET request to index route (/)", async ({ page }) => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`https://127.0.0.1:${port}/`, {
          waitUntil: "networkidle0",
        });

        const HTTPVersion = await page.evaluate(
          () => performance.getEntries()[0].nextHopProtocol,
        );

        expect(HTTPVersion).toEqual("h2");

        expect(response.status()).toBe(200);

        await expect(page).toHaveScreenshot();

        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshotWithArray("console messages");

        expect(pageErrors).toMatchSnapshotWithArray("page errors");
      });
    });
  });

  test.describe("as object", () => {
    // TODO: This test is skipped because it fails on Windows, should be fixed in the future
    if (process.platform !== "win32") {
      return;
    }
    test.describe("ca, pfx, key and cert are array of buffers", () => {
      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      test.beforeEach(async () => {
        compiler = webpack(config);

        createServerSpy = sinon.spy(https, "createServer");

        server = new Server(
          {
            static: {
              directory: staticDirectory,
              watch: false,
            },
            server: {
              type: "https",
              options: {
                ca: [
                  fs.readFileSync(
                    path.join(httpsCertificateDirectory, "ca.pem"),
                  ),
                ],
                pfx: [
                  fs.readFileSync(
                    path.join(httpsCertificateDirectory, "server.pfx"),
                  ),
                ],
                key: [
                  fs.readFileSync(
                    path.join(httpsCertificateDirectory, "server.key"),
                  ),
                ],
                cert: [
                  fs.readFileSync(
                    path.join(httpsCertificateDirectory, "server.crt"),
                  ),
                ],
                passphrase: "webpack-dev-server",
              },
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
        createServerSpy.restore();

        await server.stop();
      });

      test("should handle GET request to index route (/)", async ({ page }) => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`https://127.0.0.1:${port}/`, {
          waitUntil: "networkidle0",
        });

        expect(
          normalizeOptions(createServerSpy.getCall(0).args[0]),
        ).toMatchSnapshotWithArray("normalized options");
        expect(response.status()).toBe(200);
        await expect(page).toHaveScreenshot();
        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshotWithArray("console messages");
        expect(pageErrors).toMatchSnapshotWithArray("page errors");
      });
    });

    test.describe("ca, pfx, key and cert are strings", () => {
      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      test.beforeEach(async () => {
        compiler = webpack(config);

        createServerSpy = sinon.spy(https, "createServer");

        server = new Server(
          {
            static: {
              directory: staticDirectory,
              watch: false,
            },
            server: {
              type: "https",
              options: {
                ca: fs
                  .readFileSync(path.join(httpsCertificateDirectory, "ca.pem"))
                  .toString(),
                // TODO
                // pfx can't be string because it is binary format
                pfx: fs.readFileSync(
                  path.join(httpsCertificateDirectory, "server.pfx"),
                ),
                key: fs
                  .readFileSync(
                    path.join(httpsCertificateDirectory, "server.key"),
                  )
                  .toString(),
                cert: fs
                  .readFileSync(
                    path.join(httpsCertificateDirectory, "server.crt"),
                  )
                  .toString(),
                passphrase: "webpack-dev-server",
              },
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
        createServerSpy.restore();

        await server.stop();
      });

      test("should handle GET request to index route (/)", async ({ page }) => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`https://127.0.0.1:${port}/`, {
          waitUntil: "networkidle0",
        });

        expect(
          normalizeOptions(createServerSpy.getCall(0).args[0]),
        ).toMatchSnapshotWithArray("normalized options");
        expect(response.status()).toBe(200);
        await expect(page).toHaveScreenshot();
        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshotWithArray("console messages");
        expect(pageErrors).toMatchSnapshotWithArray("page errors");
      });
    });

    test.describe("ca, pfx, key and cert are array of strings", () => {
      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      test.beforeEach(async () => {
        compiler = webpack(config);

        createServerSpy = sinon.spy(https, "createServer");

        server = new Server(
          {
            static: {
              directory: staticDirectory,
              watch: false,
            },
            server: {
              type: "https",
              options: {
                ca: [
                  fs
                    .readFileSync(
                      path.join(httpsCertificateDirectory, "ca.pem"),
                    )
                    .toString(),
                ],
                // pfx can't be string because it is binary format
                pfx: [
                  fs.readFileSync(
                    path.join(httpsCertificateDirectory, "server.pfx"),
                  ),
                ],
                key: [
                  fs
                    .readFileSync(
                      path.join(httpsCertificateDirectory, "server.key"),
                    )
                    .toString(),
                ],
                cert: [
                  fs
                    .readFileSync(
                      path.join(httpsCertificateDirectory, "server.crt"),
                    )
                    .toString(),
                ],
                passphrase: "webpack-dev-server",
              },
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
        createServerSpy.restore();

        await server.stop();
      });

      test("should handle GET request to index route (/)", async ({ page }) => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`https://127.0.0.1:${port}/`, {
          waitUntil: "networkidle0",
        });

        expect(
          normalizeOptions(createServerSpy.getCall(0).args[0]),
        ).toMatchSnapshotWithArray("normalized options");
        expect(response.status()).toBe(200);
        await expect(page).toHaveScreenshot();
        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshotWithArray("console messages");
        expect(pageErrors).toMatchSnapshotWithArray("page errors");
      });
    });

    test.describe("ca, pfx, key and cert are paths to files", () => {
      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      test.beforeEach(async () => {
        compiler = webpack(config);

        createServerSpy = sinon.spy(https, "createServer");

        server = new Server(
          {
            static: {
              directory: staticDirectory,
              watch: false,
            },
            server: {
              type: "https",
              options: {
                ca: path.join(httpsCertificateDirectory, "ca.pem"),
                pfx: path.join(httpsCertificateDirectory, "server.pfx"),
                key: path.join(httpsCertificateDirectory, "server.key"),
                cert: path.join(httpsCertificateDirectory, "server.crt"),
                passphrase: "webpack-dev-server",
              },
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
        createServerSpy.restore();

        await server.stop();
      });

      test("should handle GET request to index route (/)", async ({ page }) => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`https://127.0.0.1:${port}/`, {
          waitUntil: "networkidle0",
        });

        expect(
          normalizeOptions(createServerSpy.getCall(0).args[0]),
        ).toMatchSnapshotWithArray("normalized options");
        expect(response.status()).toBe(200);
        await expect(page).toHaveScreenshot();
        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshotWithArray("console messages");
        expect(pageErrors).toMatchSnapshotWithArray("page errors");
      });
    });

    test.describe("ca, pfx, key and cert are array of paths to files", () => {
      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      test.beforeEach(async () => {
        compiler = webpack(config);

        createServerSpy = sinon.spy(https, "createServer");

        server = new Server(
          {
            static: {
              directory: staticDirectory,
              watch: false,
            },
            server: {
              type: "https",
              options: {
                ca: [path.join(httpsCertificateDirectory, "ca.pem")],
                pfx: [path.join(httpsCertificateDirectory, "server.pfx")],
                key: [path.join(httpsCertificateDirectory, "server.key")],
                cert: [path.join(httpsCertificateDirectory, "server.crt")],
                passphrase: "webpack-dev-server",
              },
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
        createServerSpy.restore();

        await server.stop();
      });

      test("should handle GET request to index route (/)", async ({ page }) => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`https://127.0.0.1:${port}/`, {
          waitUntil: "networkidle0",
        });

        expect(
          normalizeOptions(createServerSpy.getCall(0).args[0]),
        ).toMatchSnapshotWithArray("normalized options");
        expect(response.status()).toBe(200);
        await expect(page).toHaveScreenshot();
        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshotWithArray("console messages");
        expect(pageErrors).toMatchSnapshotWithArray("page errors");
      });
    });

    test.describe("ca, pfx, key and cert are symlinks", () => {
      // Skip test on Windows because symlinks are not supported
      if (process.platform === "win32") {
        return;
      }

      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      test.beforeEach(async () => {
        compiler = webpack(config);

        createServerSpy = sinon.spy(https, "createServer");

        server = new Server(
          {
            static: {
              directory: staticDirectory,
              watch: false,
            },
            server: {
              type: "https",
              options: {
                ca: path.join(httpsCertificateDirectory, "ca-symlink.pem"),
                pfx: path.join(httpsCertificateDirectory, "server-symlink.pfx"),
                key: path.join(httpsCertificateDirectory, "server-symlink.key"),
                cert: path.join(
                  httpsCertificateDirectory,
                  "server-symlink.crt",
                ),
                passphrase: "webpack-dev-server",
              },
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
        createServerSpy.restore();

        await server.stop();
      });

      test("should handle GET request to index route (/)", async ({ page }) => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`https://127.0.0.1:${port}/`, {
          waitUntil: "networkidle0",
        });

        expect(
          normalizeOptions(createServerSpy.getCall(0).args[0]),
        ).toMatchSnapshotWithArray("normalize options");
        expect(response.status()).toEqual(200);
        expect(await response.text()).toContain("Heyo");
        expect(consoleMessages.map((message) => message.text())).toEqual([]);
        expect(pageErrors).toEqual([]);
      });
    });

    test.describe("ca, pfx, key and cert are buffer", () => {
      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      test.beforeEach(async () => {
        compiler = webpack(config);

        createServerSpy = sinon.spy(https, "createServer");

        server = new Server(
          {
            static: {
              directory: staticDirectory,
              watch: false,
            },
            server: {
              type: "https",
              options: {
                ca: fs.readFileSync(
                  path.join(httpsCertificateDirectory, "ca.pem"),
                ),
                pfx: fs.readFileSync(
                  path.join(httpsCertificateDirectory, "server.pfx"),
                ),
                key: fs.readFileSync(
                  path.join(httpsCertificateDirectory, "server.key"),
                ),
                cert: fs.readFileSync(
                  path.join(httpsCertificateDirectory, "server.crt"),
                ),
                passphrase: "webpack-dev-server",
              },
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
        createServerSpy.restore();

        await server.stop();
      });

      test("should handle GET request to index route (/)", async ({ page }) => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`https://127.0.0.1:${port}/`, {
          waitUntil: "networkidle0",
        });

        expect(
          normalizeOptions(createServerSpy.getCall(0).args[0]),
        ).toMatchSnapshotWithArray("normalize options");
        expect(response.status()).toBe(200);
        await expect(page).toHaveScreenshot();
        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshotWithArray("console messages");
        expect(pageErrors).toMatchSnapshotWithArray("page errors");
      });
    });

    test.describe("ca, pfx, key and cert are buffer, key and pfx are objects", () => {
      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      test.beforeEach(async () => {
        compiler = webpack(config);

        createServerSpy = sinon.spy(https, "createServer");

        server = new Server(
          {
            static: {
              directory: staticDirectory,
              watch: false,
            },
            server: {
              type: "https",
              options: {
                ca: fs.readFileSync(
                  path.join(httpsCertificateDirectory, "ca.pem"),
                ),
                pfx: [
                  {
                    buf: fs.readFileSync(
                      path.join(httpsCertificateDirectory, "server.pfx"),
                    ),
                  },
                ],
                key: [
                  {
                    pem: fs.readFileSync(
                      path.join(httpsCertificateDirectory, "server.key"),
                    ),
                  },
                ],
                cert: fs.readFileSync(
                  path.join(httpsCertificateDirectory, "server.crt"),
                ),
                passphrase: "webpack-dev-server",
              },
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
        createServerSpy.restore();
        await server.stop();
      });

      test("should handle GET request to index route (/)", async ({ page }) => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`https://127.0.0.1:${port}/`, {
          waitUntil: "networkidle0",
        });

        expect(
          normalizeOptions(createServerSpy.getCall(0).args[0]),
        ).toMatchSnapshotWithArray("normalize options");
        expect(response.status()).toBe(200);
        await expect(page).toHaveScreenshot();
        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshotWithArray("console messages");
        expect(pageErrors).toMatchSnapshotWithArray("page errors");
      });
    });

    test.describe("ca, pfx, key and cert are strings, key and pfx are objects", () => {
      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      test.beforeEach(async () => {
        compiler = webpack(config);

        createServerSpy = sinon.spy(https, "createServer");

        server = new Server(
          {
            static: {
              directory: staticDirectory,
              watch: false,
            },
            server: {
              type: "https",
              options: {
                ca: fs
                  .readFileSync(path.join(httpsCertificateDirectory, "ca.pem"))
                  .toString(),
                pfx: [
                  {
                    // pfx can't be string because it is binary format
                    buf: fs.readFileSync(
                      path.join(httpsCertificateDirectory, "server.pfx"),
                    ),
                  },
                ],
                key: [
                  {
                    pem: fs
                      .readFileSync(
                        path.join(httpsCertificateDirectory, "server.key"),
                      )
                      .toString(),
                  },
                ],
                cert: fs
                  .readFileSync(
                    path.join(httpsCertificateDirectory, "server.crt"),
                  )
                  .toString(),
                passphrase: "webpack-dev-server",
              },
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
        createServerSpy.restore();
        await server.stop();
      });

      test("should handle GET request to index route (/)", async ({ page }) => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`https://127.0.0.1:${port}/`, {
          waitUntil: "networkidle0",
        });

        expect(
          normalizeOptions(createServerSpy.getCall(0).args[0]),
        ).toMatchSnapshotWithArray("normalize options");
        expect(response.status()).toBe(200);
        await expect(page).toHaveScreenshot();
        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshotWithArray("console messages");
        expect(pageErrors).toMatchSnapshotWithArray("page errors");
      });
    });

    test.describe("allow to pass more options", () => {
      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      test.beforeEach(async () => {
        compiler = webpack(config);

        createServerSpy = sinon.spy(https, "createServer");

        server = new Server(
          {
            static: {
              directory: staticDirectory,
              watch: false,
            },
            server: {
              type: "https",
              options: {
                minVersion: "TLSv1.1",
                ca: fs.readFileSync(
                  path.join(httpsCertificateDirectory, "ca.pem"),
                ),
                pfx: fs.readFileSync(
                  path.join(httpsCertificateDirectory, "server.pfx"),
                ),
                key: fs.readFileSync(
                  path.join(httpsCertificateDirectory, "server.key"),
                ),
                cert: fs.readFileSync(
                  path.join(httpsCertificateDirectory, "server.crt"),
                ),
                passphrase: "webpack-dev-server",
              },
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
        createServerSpy.restore();
        await server.stop();
      });

      test("should handle GET request to index route (/)", async ({ page }) => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`https://127.0.0.1:${port}/`, {
          waitUntil: "networkidle0",
        });

        expect(
          normalizeOptions(createServerSpy.getCall(0).args[0]),
        ).toMatchSnapshotWithArray("normalize options");
        expect(response.status()).toBe(200);
        await expect(page).toHaveScreenshot();
        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshotWithArray("console messages");
        expect(pageErrors).toMatchSnapshotWithArray("page errors");
      });
    });

    // TODO this doesn't exist with Playwright anymore
    // puppeteer having issues accepting SSL here, throwing error net::ERR_BAD_SSL_CLIENT_AUTH_CERT, hence testing with supertest
    test.describe('should support the "requestCert" option', () => {
      let compiler;
      let server;
      let createServerSpy;
      let req;

      test.beforeEach(async () => {
        compiler = webpack(config);

        createServerSpy = sinon.spy(https, "createServer");

        server = new Server(
          {
            static: {
              directory: staticDirectory,
              watch: false,
            },
            server: {
              type: "https",
              options: {
                requestCert: true,
                pfx: fs.readFileSync(
                  path.join(httpsCertificateDirectory, "server.pfx"),
                ),
                key: fs.readFileSync(
                  path.join(httpsCertificateDirectory, "server.key"),
                ),
                cert: fs.readFileSync(
                  path.join(httpsCertificateDirectory, "server.crt"),
                ),
                passphrase: "webpack-dev-server",
              },
            },
            port,
          },
          compiler,
        );

        await server.start();

        req = request(server.app);
      });

      test.afterEach(async () => {
        createServerSpy.restore();
        await server.stop();
      });

      test("should pass options to the 'https.createServer' method", async () => {
        expect(
          normalizeOptions(createServerSpy.getCall(0).args[0]),
        ).toMatchSnapshotWithArray("normalize options");
      });

      test("should handle GET request to index route (/)", async () => {
        const response = await req.get("/");

        expect(response.status).toMatchSnapshotWithArray("status");
        expect(response.text).toMatchSnapshotWithArray("text");
      });
    });

    test.describe("spdy server with options", () => {
      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      test.beforeEach(async () => {
        compiler = webpack(config);

        createServerSpy = sinon.spy(spdy, "createServer");

        server = new Server(
          {
            static: {
              directory: staticDirectory,
              watch: false,
            },
            server: {
              type: "spdy",
              options: {
                requestCert: false,
                ca: [path.join(httpsCertificateDirectory, "ca.pem")],
                pfx: [path.join(httpsCertificateDirectory, "server.pfx")],
                key: [path.join(httpsCertificateDirectory, "server.key")],
                cert: [path.join(httpsCertificateDirectory, "server.crt")],
                passphrase: "webpack-dev-server",
              },
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
        createServerSpy.restore();
        await server.stop();
      });

      test("should handle GET request to index route (/)", async ({ page }) => {
        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("pageerror", (error) => {
            pageErrors.push(error);
          });

        const response = await page.goto(`https://127.0.0.1:${port}/`, {
          waitUntil: "networkidle0",
        });

        const HTTPVersion = await page.evaluate(
          () => performance.getEntries()[0].nextHopProtocol,
        );

        expect(HTTPVersion).toEqual("h2");
        expect(
          normalizeOptions(createServerSpy.getCall(0).args[0]),
        ).toMatchSnapshotWithArray("normalize options");
        expect(response.status()).toBe(200);
        await expect(page).toHaveScreenshot();
        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshotWithArray("console messages");
        expect(pageErrors).toMatchSnapshotWithArray("page errors");
      });
    });

    test.describe("custom server with options", () => {
      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      test.beforeEach(async () => {
        compiler = webpack(config);

        createServerSpy = sinon.spy(customHTTP, "createServer");

        server = new Server(
          {
            static: {
              directory: staticDirectory,
              watch: false,
            },
            server: {
              type: path.join(__dirname, "../helpers/custom-http.js"),
              options: {
                maxHeaderSize: 16384,
              },
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
        createServerSpy.restore();
        await server.stop();
      });

      test("should handle GET request to index route (/)", async ({ page }) => {
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

        const HTTPVersion = await page.evaluate(
          () => performance.getEntries()[0].nextHopProtocol,
        );

        expect(HTTPVersion).toEqual("http/1.1");
        expect(
          normalizeOptions(createServerSpy.getCall(0).args[0]),
        ).toMatchSnapshotWithArray("normalize options");
        expect(response.status()).toBe(200);
        await expect(page).toHaveScreenshot();
        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshotWithArray("console messages");
        expect(pageErrors).toMatchSnapshotWithArray("page errors");
      });
    });
  });
});
