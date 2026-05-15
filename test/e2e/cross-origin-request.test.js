"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const { startServer } = require("../helpers/test-server");
const [port1, port2] = require("../ports-map")["cross-origin-request"];

describe("cross-origin requests", () => {
  const devServerPort = port1;
  const htmlServerPort = port2;
  const htmlServerHost = "127.0.0.1";

  it("should return 403 for cross-origin no-cors non-module script tag requests", async () => {
    const compiler = webpack(config);
    const devServerOptions = {
      port: devServerPort,
      allowedHosts: "auto",
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    // Start a separate server for serving the HTML file
    const http = require("node:http");

    const htmlServer = http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <html>
          <head>
            <script src="http://localhost:${devServerPort}/main.js"></script>
          </head>
          <body></body>
        </html>
      `);
    });
    htmlServer.listen(htmlServerPort, htmlServerHost);

    const { page, browser } = await runBrowser();

    try {
      const pageErrors = [];

      page.on("pageerror", (error) => {
        pageErrors.push(error);
      });

      const scriptTagRequest = page.waitForResponse(
        `http://localhost:${devServerPort}/main.js`,
      );

      await page.goto(`http://${htmlServerHost}:${htmlServerPort}`);

      const response = await scriptTagRequest;

      expect(response.status()).toBe(403);
    } finally {
      await browser.close();
      await server.stop();
      htmlServer.close();
    }
  });

  it("should return 200 for cross-origin cors non-module script tag requests", async () => {
    const compiler = webpack(config);
    const devServerOptions = {
      port: devServerPort,
      allowedHosts: "auto",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    // Start a separate server for serving the HTML file
    const http = require("node:http");

    const htmlServer = http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <html>
          <head>
            <script src="http://localhost:${devServerPort}/main.js" crossorigin></script>
          </head>
          <body></body>
        </html>
      `);
    });
    htmlServer.listen(htmlServerPort, htmlServerHost);

    const { page, browser } = await runBrowser();

    try {
      const pageErrors = [];

      page.on("pageerror", (error) => {
        pageErrors.push(error);
      });

      const scriptTagRequest = page.waitForResponse(
        `http://localhost:${devServerPort}/main.js`,
      );

      await page.goto(`http://${htmlServerHost}:${htmlServerPort}`);

      const response = await scriptTagRequest;

      expect(response.status()).toBe(200);
    } finally {
      await browser.close();
      await server.stop();
      htmlServer.close();
    }
  });

  it("should return 200 for cross-origin no-cors non-module script tag requests with the 'allowedHost' option and 'all' value", async () => {
    const compiler = webpack(config);
    const devServerOptions = {
      port: devServerPort,
      allowedHosts: "all",
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    // Start a separate server for serving the HTML file
    const http = require("node:http");

    const htmlServer = http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <html>
          <head>
            <script src="http://localhost:${devServerPort}/main.js"></script>
          </head>
          <body></body>
        </html>
      `);
    });
    htmlServer.listen(htmlServerPort, htmlServerHost);

    const { page, browser } = await runBrowser();

    try {
      const pageErrors = [];

      page.on("pageerror", (error) => {
        pageErrors.push(error);
      });

      const scriptTagRequest = page.waitForResponse(
        `http://localhost:${devServerPort}/main.js`,
      );

      await page.goto(`http://${htmlServerHost}:${htmlServerPort}`);

      const response = await scriptTagRequest;

      expect(response.status()).toBe(200);
    } finally {
      await browser.close();
      await server.stop();
      htmlServer.close();
    }
  });

  it("should return 200 for cross-origin no-cors non-module script tag requests with the `allowedHost` option and the `localhost` value", async () => {
    const compiler = webpack(config);
    const devServerOptions = {
      port: devServerPort,
      allowedHosts: ["localhost"],
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    // Start a separate server for serving the HTML file
    const http = require("node:http");

    const htmlServer = http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <html>
          <head>
            <script src="http://localhost:${devServerPort}/main.js"></script>
          </head>
          <body></body>
        </html>
      `);
    });
    htmlServer.listen(htmlServerPort, htmlServerHost);

    const { page, browser } = await runBrowser();

    try {
      const pageErrors = [];

      page.on("pageerror", (error) => {
        pageErrors.push(error);
      });

      const scriptTagRequest = page.waitForResponse(
        `http://localhost:${devServerPort}/main.js`,
      );

      await page.goto(`http://${htmlServerHost}:${htmlServerPort}`);

      const response = await scriptTagRequest;

      expect(response.status()).toBe(200);
    } finally {
      await browser.close();
      await server.stop();
      htmlServer.close();
    }
  });

  it("should allow localhost for no-cors cross-site requests", async () => {
    const { page, server } = await startServer({
      allowedHosts: "auto",
      port: 0,
    });
    const { port } = server.options;
    await page.goto("about:blank");
    await page.evaluate((port) => {
      const iframe = document.createElement("iframe");
      const html = `
      <script src="http://localhost:${port}/main.js"></script>
    `;
      const blob = new Blob([html], { type: "text/html" });
      iframe.src = URL.createObjectURL(blob);
      document.body.append(iframe);
    }, port);
    await page.waitForTimeout(2000);
    const res = await page.goto(`http://localhost:${port}/main.js`);
    expect(res.status()).toBe(200);
  });
});

// @see https://github.com/webpack/webpack-dev-server/security/advisories/GHSA-79cf-xcqc-c78w
describe("cross-origin resource policy header", () => {
  const devServerPort = port1;

  let server;

  afterEach(async () => {
    if (server) {
      await server.stop();
      // Allow the port to be fully released before the next test
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
      server = null;
    }
  });

  function request(url, headers = {}) {
    const http = require("node:http");

    return new Promise((resolve, reject) => {
      const req = http.get(url, { headers }, (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({ status: res.statusCode, headers: res.headers, body });
        });
      });
      req.on("error", reject);
    });
  }

  it("should set Cross-Origin-Resource-Policy: same-origin by default", async () => {
    const compiler = webpack(config);
    server = new Server(
      { port: devServerPort, allowedHosts: "auto" },
      compiler,
    );

    await server.start();

    const res = await request(`http://localhost:${devServerPort}/main.js`);

    expect(res.headers["cross-origin-resource-policy"]).toBe("same-origin");
  });

  it("should NOT set CORP header when allowedHosts is 'all'", async () => {
    const compiler = webpack(config);
    server = new Server({ port: devServerPort, allowedHosts: "all" }, compiler);

    await server.start();

    const res = await request(`http://localhost:${devServerPort}/main.js`);

    expect(res.headers["cross-origin-resource-policy"]).toBeUndefined();
  });

  it("should NOT set CORP header when user configures wildcard CORS", async () => {
    const compiler = webpack(config);
    server = new Server(
      {
        port: devServerPort,
        allowedHosts: "auto",
        headers: { "Access-Control-Allow-Origin": "*" },
      },
      compiler,
    );

    await server.start();

    const res = await request(`http://localhost:${devServerPort}/main.js`);

    expect(res.headers["cross-origin-resource-policy"]).toBeUndefined();
  });

  it("should set CORP header when user configures a specific-origin Access-Control-Allow-Origin (no-cors embedding is not governed by CORS)", async () => {
    const compiler = webpack(config);
    server = new Server(
      {
        port: devServerPort,
        allowedHosts: "auto",
        headers: {
          "Access-Control-Allow-Origin": "http://foo.example.com",
        },
      },
      compiler,
    );

    await server.start();

    const res = await request(`http://localhost:${devServerPort}/main.js`);

    expect(res.headers["cross-origin-resource-policy"]).toBe("same-origin");
  });

  it("should set CORP header when user configures Access-Control-Allow-Origin via headers array with a specific origin", async () => {
    const compiler = webpack(config);
    server = new Server(
      {
        port: devServerPort,
        allowedHosts: "auto",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "http://foo.example.com",
          },
        ],
      },
      compiler,
    );

    await server.start();

    const res = await request(`http://localhost:${devServerPort}/main.js`);

    expect(res.headers["cross-origin-resource-policy"]).toBe("same-origin");
  });

  it("should NOT set CORP header when user configures wildcard Access-Control-Allow-Origin via headers array", async () => {
    const compiler = webpack(config);
    server = new Server(
      {
        port: devServerPort,
        allowedHosts: "auto",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
      compiler,
    );

    await server.start();

    const res = await request(`http://localhost:${devServerPort}/main.js`);

    expect(res.headers["cross-origin-resource-policy"]).toBeUndefined();
  });

  it("should NOT set CORP header when host is in allowedHosts", async () => {
    const compiler = webpack(config);
    server = new Server(
      { port: devServerPort, allowedHosts: ["localhost"] },
      compiler,
    );

    await server.start();

    const res = await request(`http://localhost:${devServerPort}/main.js`);

    expect(res.status).toBe(200);
    expect(res.headers["cross-origin-resource-policy"]).toBeUndefined();
  });
});
