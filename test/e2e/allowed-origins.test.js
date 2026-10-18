import http from "node:http";
import { after, before, describe, it } from "node:test";
import { expect } from "expect";
import request from "supertest";
import webpack from "webpack";
import WebSocket from "ws";
import Server from "../../lib/Server.js";
import config from "../fixtures/client-config/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const [port, pagePort] = portsMap["allowed-origins"];
const serverOrigin = `http://localhost:${port}`;
// `*.localhost` resolves to the loopback address in the browser, and is a
// different origin from `localhost` that only a list can allow.
const listedOrigin = `http://app.localhost:${pagePort}`;
const unlistedOrigin = `http://evil.localhost:${pagePort}`;

/**
 * @param {string | undefined} origin origin
 * @param {{ headers?: Record<string, string>, query?: string }=} options extra headers, and a query for the url
 * @returns {Promise<{ action: string }>} the first message that says whether the client was let in
 */
async function connect(origin, { headers = {}, query = "" } = {}) {
  return new Promise((resolve, reject) => {
    const client = new WebSocket(`ws://localhost:${port}/ws${query}`, {
      origin,
      headers,
    });

    client.on("error", reject);
    client.on("message", (data) => {
      const message = JSON.parse(data);

      if (["error", "sync", "built"].includes(message.action)) {
        client.close();
        resolve(message);
      }
    });
  });
}

async function startServer(options) {
  const server = new Server({ port, ...options }, webpack(config));

  await server.start();
  await new Promise((resolve) => {
    server.middleware.waitUntilValid(resolve);
  });

  return server;
}

describe("allowedOrigins as a list", () => {
  let server;

  before(async () => {
    // `allowedHosts: "all"` would let every origin in under "auto"; with a
    // list, it only stops checking `Host`.
    server = await startServer({
      allowedHosts: "all",
      allowedOrigins: [listedOrigin],
    });
  });

  after(async () => {
    await server.stop();
  });

  it("answers a listed origin with CORS headers", async () => {
    await request(serverOrigin)
      .get("/main.js")
      .set("Origin", listedOrigin)
      .expect("Access-Control-Allow-Origin", listedOrigin)
      .expect("Vary", /Origin/)
      .expect(200);
  });

  it("lets a listed origin send credentials", async () => {
    await request(serverOrigin)
      .get("/main.js")
      .set("Origin", listedOrigin)
      .expect("Access-Control-Allow-Credentials", "true")
      .expect(200);
  });

  it("answers a listed origin's preflight", async () => {
    await request(serverOrigin)
      .options("/main.js")
      .set("Origin", listedOrigin)
      .set("Access-Control-Request-Method", "PUT")
      .set("Access-Control-Request-Headers", "x-custom")
      .set("Access-Control-Request-Private-Network", "true")
      .expect("Access-Control-Allow-Origin", listedOrigin)
      .expect("Access-Control-Allow-Methods", "PUT")
      .expect("Access-Control-Allow-Headers", "x-custom")
      .expect("Access-Control-Allow-Private-Network", "true")
      .expect("Vary", /Access-Control-Request-Method/)
      .expect(204);
  });

  it("refuses the preflight of an origin it does not list", async () => {
    await request(serverOrigin)
      .options("/main.js")
      .set("Origin", unlistedOrigin)
      .set("Access-Control-Request-Method", "PUT")
      .expect(403);
  });

  it("refuses an origin it does not list", async () => {
    await request(serverOrigin)
      .get("/main.js")
      .set("Origin", unlistedOrigin)
      .expect(403);
  });

  it("allows a script load from a listed page by its Referer", async () => {
    await request(serverOrigin)
      .get("/main.js")
      .set("Sec-Fetch-Site", "cross-site")
      .set("Sec-Fetch-Mode", "no-cors")
      .set("Referer", `${listedOrigin}/page.html`)
      .expect("Cross-Origin-Resource-Policy", "cross-origin")
      .expect(200);
  });

  it("refuses a cross-site script load from any other page", async () => {
    for (const referer of [`${unlistedOrigin}/`, undefined]) {
      const req = request(serverOrigin)
        .get("/main.js")
        .set("Sec-Fetch-Site", "cross-site")
        .set("Sec-Fetch-Mode", "no-cors");

      if (referer) {
        req.set("Referer", referer);
      }

      await req.expect(403);
    }
  });

  it("keeps a same-origin resource policy without Fetch Metadata", async () => {
    await request(serverOrigin)
      .get("/main.js")
      .expect("Cross-Origin-Resource-Policy", "same-origin")
      .expect(200);
  });

  it("lets the page's own origin and the listed one connect for HMR", async () => {
    expect((await connect(serverOrigin)).action).toBe("sync");
    expect((await connect(listedOrigin)).action).toBe("sync");
  });

  it("refuses HMR to any other origin", async () => {
    expect(await connect(unlistedOrigin)).toEqual({
      action: "error",
      message: "Invalid Host/Origin header",
    });
  });

  it("opens the state-changing endpoints to the listed origin only", async () => {
    await request(serverOrigin)
      .get("/webpack-dev-server/invalidate")
      .set("Sec-Fetch-Site", "same-site")
      .set("Origin", listedOrigin)
      .expect(200);
    await request(serverOrigin)
      .get("/webpack-dev-server/invalidate")
      .set("Sec-Fetch-Site", "same-site")
      .set("Origin", unlistedOrigin)
      .expect(403);
  });

  it("loads a script into a listed page and keeps it out of another", async () => {
    const pageServer = http.createServer((_req, res) => {
      res.setHeader("Content-Type", "text/html");
      res.end("<!doctype html><title>page</title>");
    });

    await new Promise((resolve) => {
      pageServer.listen(pagePort, "127.0.0.1", resolve);
    });

    const { page, browser } = await runBrowser();
    const loadScript = (url) =>
      page.evaluate(
        (src) =>
          new Promise((resolve) => {
            const script = document.createElement("script");

            // A plain `<script>`, without `crossorigin`: allowed by the
            // page's `Referer`, as a backend's template would load it.
            script.src = src;
            script.onload = () => resolve("loaded");
            script.onerror = () => resolve("blocked");
            document.head.append(script);
          }),
        url,
      );

    try {
      await page.goto(listedOrigin);
      expect(await loadScript(`${serverOrigin}/main.js`)).toBe("loaded");

      await page.goto(unlistedOrigin);
      expect(await loadScript(`${serverOrigin}/main.js`)).toBe("blocked");
    } finally {
      await browser.close();
      await new Promise((resolve) => {
        pageServer.close(resolve);
      });
    }
  });
});

describe('allowedOrigins: "all"', () => {
  let server;

  before(async () => {
    server = await startServer({ allowedOrigins: "all" });
  });

  after(async () => {
    await server.stop();
  });

  it("lets every origin in, with CORS headers", async () => {
    await request(serverOrigin)
      .get("/main.js")
      .set("Origin", unlistedOrigin)
      .expect("Access-Control-Allow-Origin", "*")
      .expect(200);
    expect((await connect(unlistedOrigin)).action).toBe("sync");
  });

  it("answers any preflight, without credentials", async () => {
    const response = await request(serverOrigin)
      .options("/main.js")
      .set("Origin", unlistedOrigin)
      .set("Access-Control-Request-Method", "DELETE")
      .expect("Access-Control-Allow-Origin", "*")
      .expect("Access-Control-Allow-Methods", "DELETE")
      .expect(204);

    // `*` and credentials do not go together.
    expect(
      response.headers["access-control-allow-credentials"],
    ).toBeUndefined();
  });

  it("still checks Host", async () => {
    await request(serverOrigin)
      .get("/main.js")
      .set("Host", "evil.example.com")
      .expect(403);
    expect(
      (await connect(serverOrigin, { headers: { host: "evil.example.com" } }))
        .action,
    ).toBe("error");
  });
});

describe("the hot token", () => {
  let server;

  before(async () => {
    server = await startServer({});
  });

  after(async () => {
    await server.stop();
  });

  // TODO remove the check once the dependency on webpack-dev-middleware
  // requires a version that hands over a token it does not require.
  const supported = () => typeof server.middleware.token === "string";

  it("lets an origin this server does not know connect with it", async (t) => {
    if (!supported()) {
      t.skip("webpack-dev-middleware has no optional token");
      return;
    }

    const query = `?token=${encodeURIComponent(server.middleware.token)}`;

    expect((await connect(unlistedOrigin, { query })).action).toBe("sync");
  });

  it("does not stand in for it without the token, or with a wrong one", async (t) => {
    if (!supported()) {
      t.skip("webpack-dev-middleware has no optional token");
      return;
    }

    expect((await connect(unlistedOrigin)).action).toBe("error");
    expect(
      (await connect(unlistedOrigin, { query: "?token=not-the-token" })).action,
    ).toBe("error");
  });

  it("does not stand in for the Host check", async (t) => {
    if (!supported()) {
      t.skip("webpack-dev-middleware has no optional token");
      return;
    }

    const query = `?token=${encodeURIComponent(server.middleware.token)}`;

    expect(
      (
        await connect(serverOrigin, {
          query,
          headers: { host: "evil.example.com" },
        })
      ).action,
    ).toBe("error");
  });
});
