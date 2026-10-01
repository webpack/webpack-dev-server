import http from "node:http";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { expect } from "expect";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import config from "../fixtures/client-config/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const [port1, port2] = portsMap["cross-origin-request"];

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

// State-changing internal endpoints must reject cross-site requests so a page
// the developer visits cannot trigger them (CSRF).
describe("cross-site request forgery on state-changing endpoints", () => {
  const devServerPort = port1;

  let server;

  beforeEach(async () => {
    const compiler = webpack(config);
    server = new Server(
      { port: devServerPort, allowedHosts: "auto" },
      compiler,
    );

    await server.start();
  });

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

  function request(path, headers = {}) {
    return new Promise((resolve, reject) => {
      const req = http.get(
        `http://localhost:${devServerPort}${path}`,
        { headers },
        (res) => {
          let body = "";
          res.on("data", (chunk) => {
            body += chunk;
          });
          res.on("end", () => {
            resolve({ status: res.statusCode, body });
          });
        },
      );
      req.on("error", reject);
    });
  }

  for (const endpoint of [
    "/webpack-dev-server/invalidate",
    "/webpack-dev-server/open-editor",
  ]) {
    it(`should block cross-site requests to ${endpoint}`, async () => {
      const res = await request(endpoint, {
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
      });

      expect(res.status).toBe(403);
    });

    it(`should allow same-origin requests to ${endpoint}`, async () => {
      const res = await request(endpoint, {
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
      });

      expect(res.status).toBe(200);
    });

    it(`should allow user-initiated navigations to ${endpoint}`, async () => {
      const res = await request(endpoint, { "sec-fetch-site": "none" });

      expect(res.status).toBe(200);
    });
  }

  it("should block requests with a cross-origin Origin and no Sec-Fetch metadata", async () => {
    const res = await request("/webpack-dev-server/invalidate", {
      origin: "http://evil.example",
    });

    expect(res.status).toBe(403);
  });

  // This used to be allowed, on the reasoning that a request with no `Origin`
  // was not sent by another origin's script. It can be: a browser omits Fetch
  // Metadata for a destination that is not potentially trustworthy — plain
  // `http` to anything but `localhost` — and a no-cors request such as
  // `<img src>` carries no `Origin` either, so a cross-site load arrives with
  // neither header. Refusing costs `curl` access to these two endpoints,
  // which was never documented, and closes that.
  it("should block requests carrying neither Sec-Fetch metadata nor Origin", async () => {
    const res = await request("/webpack-dev-server/invalidate");

    expect(res.status).toBe(403);
  });
});

// Passing the caller check says who may ask; it says nothing about which file.
// The reference the overlay sends is webpack's module identifier, out of a
// build error whose text a loader or a dependency wrote, so it is not
// necessarily a file this project built — and the endpoint hands it to an
// editor.
describe("which file /open-editor will open", () => {
  const devServerPort = port1;
  const fixtures = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../fixtures/client-config",
  );

  let server;

  beforeEach(async () => {
    const compiler = webpack(config);

    server = new Server(
      { port: devServerPort, allowedHosts: "auto" },
      compiler,
    );

    await server.start();
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
      server = null;
    }
  });

  /**
   * @param {string} fileName the reference to send
   * @returns {Promise<number>} the status code
   */
  function open(fileName) {
    return new Promise((resolve, reject) => {
      const req = http.get(
        `http://localhost:${devServerPort}/webpack-dev-server/open-editor?fileName=${encodeURIComponent(fileName)}`,
        { headers: { "sec-fetch-site": "same-origin" } },
        (res) => {
          res.resume();
          res.on("end", () => resolve(/** @type {number} */ (res.statusCode)));
        },
      );

      req.on("error", reject);
    });
  }

  it("opens a file the build read", async () => {
    expect(await open(path.join(fixtures, "foo.js"))).toBe(200);
  });

  it("opens one named through its loader chain", async () => {
    expect(await open(`babel-loader!${path.join(fixtures, "foo.js")}`)).toBe(
      200,
    );
  });

  it("refuses a file in the project the build never read", async () => {
    expect(await open(path.join(fixtures, "not-an-entry.js"))).toBe(403);
  });

  it("refuses one outside the project", async () => {
    expect(await open("/etc/passwd")).toBe(403);
  });

  it("refuses a traversal that lands outside", async () => {
    expect(await open(path.join(fixtures, "../../../../etc/passwd"))).toBe(403);
  });
});

// Same as above, but driven by a real browser so the cross-site requests carry
// browser-generated `Sec-Fetch-*` metadata (and the same-origin GET `fetch`
// omits the `Origin` header, exactly like the overlay client).
describe("cross-site request forgery on state-changing endpoints (browser)", () => {
  const devServerPort = port1;
  const htmlServerPort = port2;
  const htmlServerHost = "127.0.0.1";

  const openEditorUrl = `http://localhost:${devServerPort}/webpack-dev-server/open-editor`;
  const invalidateUrl = `http://localhost:${devServerPort}/webpack-dev-server/invalidate`;

  let server;
  let htmlServer;
  let page;
  let browser;

  beforeEach(async () => {
    const compiler = webpack(config);
    server = new Server(
      { port: devServerPort, allowedHosts: "auto" },
      compiler,
    );

    await server.start();

    htmlServer = http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<!doctype html><html><body></body></html>");
    });

    await new Promise((resolve) => {
      htmlServer.listen(htmlServerPort, htmlServerHost, resolve);
    });

    ({ page, browser } = await runBrowser());
  });

  afterEach(async () => {
    await browser.close();
    htmlServer.close();
    await server.stop();
  });

  it("should block a cross-site iframe navigation to /open-editor", async () => {
    await page.goto(`http://${htmlServerHost}:${htmlServerPort}/`);

    const responsePromise = page.waitForResponse(openEditorUrl);
    await page.evaluate((url) => {
      const iframe = document.createElement("iframe");
      iframe.src = url;
      document.body.append(iframe);
    }, openEditorUrl);

    expect((await responsePromise).status()).toBe(403);
  });

  it("should block a cross-site iframe navigation to /invalidate", async () => {
    await page.goto(`http://${htmlServerHost}:${htmlServerPort}/`);

    const responsePromise = page.waitForResponse(invalidateUrl);
    await page.evaluate((url) => {
      const iframe = document.createElement("iframe");
      iframe.src = url;
      document.body.append(iframe);
    }, invalidateUrl);

    expect((await responsePromise).status()).toBe(403);
  });

  it("should allow the same-origin overlay fetch to /open-editor", async () => {
    await page.goto(`http://localhost:${devServerPort}/`);

    const responsePromise = page.waitForResponse(openEditorUrl);
    await page.evaluate(() => {
      fetch("/webpack-dev-server/open-editor").catch(() => {});
    });

    expect((await responsePromise).status()).toBe(200);
  });
});
