"use strict";

const https = require("https");
const path = require("path");
const fs = require("graceful-fs");
const request = require("supertest");
const spdy = require("spdy");
const webpack = require("webpack");
const { describe, test, beforeEach, afterEach } = require("@playwright/test");
const sinon = require("sinon");
const { expect } = require("../helpers/playwright-custom-expects");
const Server = require("../../lib/Server");
const config = require("../fixtures/static-config/webpack.config");
const { skipTestOnWindows } = require("../helpers/conditional-test");
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

describe("server option", () => {
  describe("as string", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    describe("http", () => {
      beforeEach(async () => {
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

      afterEach(async () => {
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

        expect(response.status()).toMatchSnapshotWithArray();

        expect(await response.text()).toMatchSnapshotWithArray();

        expect(consoleMessages.map((message) => message.text())).toMatchSnapshotWithArray();

        expect(pageErrors).toMatchSnapshotWithArray();
      });
    });

    describe("custom-http", () => {
      beforeEach(async () => {
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

      afterEach(async () => {
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

        expect(response.status()).toMatchSnapshotWithArray();

        expect(await response.text()).toMatchSnapshotWithArray();

        expect(
          consoleMessages.map((message) => message.text())).toMatchSnapshotWithArray();

        expect(pageErrors).toMatchSnapshotWithArray();
      });
    });

    describe("https", () => {
      beforeEach(async () => {
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

      afterEach(async () => {
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

        expect(response.status()).toMatchSnapshotWithArray();

        expect(await response.text()).toMatchSnapshotWithArray();

        expect(consoleMessages.map((message) => message.text())).toMatchSnapshotWithArray();

        expect(pageErrors).toMatchSnapshotWithArray();
      });
    });

    describe("spdy", () => {
      beforeEach(async () => {
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

      afterEach(async () => {
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

        expect(response.status()).toMatchSnapshotWithArray();

        expect(await response.text()).toMatchSnapshotWithArray();

        expect(
          consoleMessages.map((message) => message.text())).toMatchSnapshotWithArray();

        expect(pageErrors).toMatchSnapshotWithArray();
      });
    });
  });

  describe("as object", () => {
    describe("ca, pfx, key and cert are array of buffers", () => {
      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      beforeEach(async () => {
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

      afterEach(async () => {
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

        expect(normalizeOptions(createServerSpy.getCall(0).args[0])).toMatchSnapshotWithArray();
        expect(response.status()).toMatchSnapshotWithArray();
        expect(await response.text()).toMatchSnapshotWithArray();
        expect(consoleMessages.map((message) => message.text())).toMatchSnapshotWithArray();
        expect(pageErrors).toMatchSnapshotWithArray();
      });
    });

    describe("ca, pfx, key and cert are strings", () => {
      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      beforeEach(async () => {
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

      afterEach(async () => {
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

        expect(normalizeOptions(createServerSpy.getCall(0).args[0])).toMatchSnapshotWithArray();
        expect(response.status()).toMatchSnapshotWithArray();
        expect(await response.text()).toMatchSnapshotWithArray();
        expect(consoleMessages.map((message) => message.text())).toMatchSnapshotWithArray();
        expect(pageErrors).toMatchSnapshotWithArray();
      });
    });

    describe("ca, pfx, key and cert are array of strings", () => {
      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      beforeEach(async () => {
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

      afterEach(async () => {
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

        expect(normalizeOptions(createServerSpy.getCall(0).args[0])).toMatchSnapshotWithArray();
        expect(response.status()).toMatchSnapshotWithArray();
        expect(await response.text()).toMatchSnapshotWithArray();
        expect(consoleMessages.map((message) => message.text())).toMatchSnapshotWithArray();
        expect(pageErrors).toMatchSnapshotWithArray();
      });
    });

    describe("ca, pfx, key and cert are paths to files", () => {
      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      beforeEach(async () => {
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

      afterEach(async () => {
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

        expect(normalizeOptions(createServerSpy.getCall(0).args[0])).toMatchSnapshotWithArray();
        expect(response.status()).toMatchSnapshotWithArray();
        expect(await response.text()).toMatchSnapshotWithArray();
        expect(consoleMessages.map((message) => message.text())).toMatchSnapshotWithArray();
        expect(pageErrors).toMatchSnapshotWithArray();
      });
    });

    describe("ca, pfx, key and cert are array of paths to files", () => {
      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      beforeEach(async () => {
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

      afterEach(async () => {
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

        expect(normalizeOptions(createServerSpy.getCall(0).args[0])).toMatchSnapshotWithArray();
        expect(response.status()).toMatchSnapshotWithArray();
        expect(await response.text()).toMatchSnapshotWithArray();
        expect(consoleMessages.map((message) => message.text())).toMatchSnapshotWithArray();
        expect(pageErrors).toMatchSnapshotWithArray();
      });
    });

    describe("ca, pfx, key and cert are symlinks", () => {
      if (skipTestOnWindows("Symlinks are not supported on Windows")) {
        return;
      }

      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      beforeEach(async () => {
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

      afterEach(async () => {
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

        expect(normalizeOptions(createServerSpy.getCall(0).args[0])).toMatchSnapshotWithArray();
        expect(response.status()).toEqual(200);
        expect(await response.text()).toContain("Heyo");
        expect(consoleMessages.map((message) => message.text())).toEqual([]);
        expect(pageErrors).toEqual([]);
      });
    });

    describe("ca, pfx, key and cert are buffer", () => {
      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      beforeEach(async () => {
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

      afterEach(async () => {
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

        expect(normalizeOptions(createServerSpy.getCall(0).args[0])).toMatchSnapshotWithArray();
        expect(response.status()).toMatchSnapshotWithArray();
        expect(await response.text()).toMatchSnapshotWithArray();
        expect(consoleMessages.map((message) => message.text())).toMatchSnapshotWithArray();
        expect(pageErrors).toMatchSnapshotWithArray();
      });
    });

    describe("ca, pfx, key and cert are buffer, key and pfx are objects", () => {
      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      beforeEach(async () => {
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

      afterEach(async () => {
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

        expect(normalizeOptions(createServerSpy.getCall(0).args[0])).toMatchSnapshotWithArray();
        expect(response.status()).toMatchSnapshotWithArray();
        expect(await response.text()).toMatchSnapshotWithArray();
        expect(consoleMessages.map((message) => message.text())).toMatchSnapshotWithArray();
        expect(pageErrors).toMatchSnapshotWithArray();
      });
    });

    describe("ca, pfx, key and cert are strings, key and pfx are objects", () => {
      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      beforeEach(async () => {
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

      afterEach(async () => {
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
          normalizeOptions(createServerSpy.getCall(0).args[0])).toMatchSnapshotWithArray();
        expect(response.status()).toMatchSnapshotWithArray();
        expect(await response.text()).toMatchSnapshotWithArray();
        expect(
          consoleMessages.map((message) => message.text())).toMatchSnapshotWithArray();
        expect(pageErrors).toMatchSnapshotWithArray();
      });
    });

    describe("allow to pass more options", () => {
      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      beforeEach(async () => {
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

      afterEach(async () => {
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
          normalizeOptions(createServerSpy.getCall(0).args[0])).toMatchSnapshotWithArray();
        expect(response.status()).toMatchSnapshotWithArray();
        expect(await response.text()).toMatchSnapshotWithArray();
        expect(
          consoleMessages.map((message) => message.text())).toMatchSnapshotWithArray();
        expect(pageErrors).toMatchSnapshotWithArray();
      });
    });

    // TODO this doesn't exist with Playwright anymore
    // puppeteer having issues accepting SSL here, throwing error net::ERR_BAD_SSL_CLIENT_AUTH_CERT, hence testing with supertest
    describe('should support the "requestCert" option', () => {
      let compiler;
      let server;
      let createServerSpy;
      let req;

      beforeEach(async () => {
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

      afterEach(async () => {
        createServerSpy.restore();
        await server.stop();
      });

      test("should pass options to the 'https.createServer' method", async () => {
        expect(normalizeOptions(createServerSpy.getCall(0).args[0])).toMatchSnapshotWithArray();
      });

      test("should handle GET request to index route (/)", async () => {
        const response = await req.get("/");

        expect(response.status).toMatchSnapshotWithArray();
        expect(response.text).toMatchSnapshotWithArray();
      });
    });

    describe("spdy server with options", () => {
      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      beforeEach(async () => {
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

      afterEach(async () => {
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
          normalizeOptions(createServerSpy.getCall(0).args[0])).toMatchSnapshotWithArray();
        expect(response.status()).toMatchSnapshotWithArray();
        expect(await response.text()).toMatchSnapshotWithArray();
        expect(
          consoleMessages.map((message) => message.text())).toMatchSnapshotWithArray();
        expect(pageErrors).toMatchSnapshotWithArray();
      });
    });

    describe("custom server with options", () => {
      let compiler;
      let server;
      let createServerSpy;
      let pageErrors;
      let consoleMessages;

      beforeEach(async () => {
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

      afterEach(async () => {
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
          normalizeOptions(createServerSpy.getCall(0).args[0])).toMatchSnapshotWithArray();
        expect(response.status()).toMatchSnapshotWithArray();
        expect(await response.text()).toMatchSnapshotWithArray();
        expect(
          consoleMessages.map((message) => message.text())).toMatchSnapshotWithArray();
        expect(pageErrors).toMatchSnapshotWithArray();
      });
    });
  });
});
