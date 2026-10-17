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
const trustedOrigin = `http://127.0.0.1:${pagePort}`;

async function connect(origin, headers = {}) {
  return new Promise((resolve, reject) => {
    const client = new WebSocket(`ws://localhost:${port}/ws`, {
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

// Host and WebSocket URL configuration must preserve HTTP and HMR origin checks,
// including when a cross-origin page is served from an IP address.
for (const [name, options] of [
  ["explicit localhost", { allowedHosts: ["localhost"] }],
  ["all hosts", { allowedHosts: "all" }],
  ["wildcard hosts", { allowedHosts: [".example.com"] }],
  [
    "custom WebSocket URL",
    { client: { webSocketURL: `ws://localhost:${port}/ws` } },
  ],
]) {
  describe(`origin protection with ${name}`, () => {
    let server;

    before(async () => {
      server = new Server({ port, ...options }, webpack(config));
      await server.start();
      await new Promise((resolve) => {
        server.middleware.waitUntilValid(resolve);
      });
    });

    after(async () => {
      await server.stop();
    });

    for (const site of ["cross-site", "same-site"]) {
      for (const destination of ["script", "image"]) {
        it(`should block ${site} no-cors ${destination} requests`, async () => {
          await request(serverOrigin)
            .get("/main.js")
            .set("Sec-Fetch-Site", site)
            .set("Sec-Fetch-Mode", "no-cors")
            .set("Sec-Fetch-Dest", destination)
            .expect(403);
        });
      }
    }

    it("should retain CORP when Fetch Metadata is absent", async () => {
      await request(serverOrigin)
        .get("/main.js")
        .expect("Cross-Origin-Resource-Policy", "same-origin")
        .expect(200);
    });

    it("should reject cross-origin HTTP and HMR requests from an IP address", async () => {
      await request(serverOrigin)
        .get("/main.js")
        .set("Origin", "http://192.168.1.2")
        .expect(403);

      expect(await connect("http://192.168.1.2")).toEqual({
        action: "error",
        message: "Invalid Host/Origin header",
      });
    });

    it("should keep same-origin HTTP and HMR working", async () => {
      await request(serverOrigin)
        .get("/main.js")
        .set("Origin", serverOrigin)
        .expect(200);

      expect((await connect(serverOrigin)).action).toBe("sync");
    });

    it("should keep state-changing endpoints protected", async () => {
      await request(serverOrigin)
        .get("/webpack-dev-server/invalidate")
        .set("Origin", "http://192.168.1.2")
        .expect(403);
    });

    if (name === "explicit localhost" || name === "custom WebSocket URL") {
      it("should block an untrusted page in a real browser", async () => {
        const pageServer = http.createServer((_req, res) => {
          res.setHeader("Content-Type", "text/html");
          res.end(`<script src="${serverOrigin}/main.js"></script>`);
        });
        await new Promise((resolve) => {
          pageServer.listen(pagePort, "127.0.0.1", resolve);
        });
        const { page, browser } = await runBrowser();

        try {
          const scriptResponse = page.waitForResponse(
            `${serverOrigin}/main.js`,
          );
          await page.goto(trustedOrigin);
          expect((await scriptResponse).status()).toBe(403);

          const action = await page.evaluate(
            (url) =>
              new Promise((resolve, reject) => {
                const client = new WebSocket(url);
                client.onerror = reject;
                client.onmessage = (event) => {
                  const message = JSON.parse(event.data);
                  client.close();
                  resolve(message.action);
                };
              }),
            `ws://localhost:${port}/ws`,
          );

          expect(action).toBe("error");
        } finally {
          await browser.close();
          await new Promise((resolve) => {
            pageServer.close(resolve);
          });
        }
      });
    }
  });
}

describe("explicit allowedOrigins", () => {
  let server;

  before(async () => {
    server = new Server(
      { port, allowedOrigins: [trustedOrigin] },
      webpack(config),
    );
    await server.start();
    await new Promise((resolve) => {
      server.middleware.waitUntilValid(resolve);
    });
  });

  after(async () => {
    await server.stop();
  });

  it("should authorize HTTP and HMR and emit CORS headers", async () => {
    await request(serverOrigin)
      .get("/main.js")
      .set("Origin", trustedOrigin)
      .expect("Access-Control-Allow-Origin", trustedOrigin)
      .expect("Vary", /Origin/)
      .expect(200);

    expect((await connect(trustedOrigin)).action).toBe("sync");
  });

  it("should reject an unlisted origin and an invalid Host", async () => {
    await request(serverOrigin)
      .get("/main.js")
      .set("Origin", "http://192.168.1.2")
      .expect(403);
    await request(serverOrigin)
      .get("/main.js")
      .set("Host", "evil.example.com")
      .set("Origin", trustedOrigin)
      .expect(403);
    expect(
      (await connect(trustedOrigin, { host: "evil.example.com" })).action,
    ).toBe("error");
  });

  it("should not authorize a no-cors request without an Origin", async () => {
    await request(serverOrigin)
      .get("/main.js")
      .set("Sec-Fetch-Site", "cross-site")
      .set("Sec-Fetch-Mode", "no-cors")
      .set("Referer", `${trustedOrigin}/`)
      .expect(403);
  });

  it("should allow the configured page to load a CORS script and connect HMR", async () => {
    const pageServer = http.createServer((_req, res) => {
      res.setHeader("Content-Type", "text/html");
      res.end(`<script src="${serverOrigin}/main.js" crossorigin></script>`);
    });
    await new Promise((resolve) => {
      pageServer.listen(pagePort, "127.0.0.1", resolve);
    });
    const { page, browser } = await runBrowser();

    try {
      const scriptResponse = page.waitForResponse(`${serverOrigin}/main.js`);
      await page.goto(trustedOrigin);
      expect((await scriptResponse).status()).toBe(200);

      const action = await page.evaluate(
        (url) =>
          new Promise((resolve, reject) => {
            const client = new WebSocket(url);
            client.onerror = reject;
            client.onmessage = (event) => {
              const message = JSON.parse(event.data);
              if (["error", "sync", "built"].includes(message.action)) {
                client.close();
                resolve(message.action);
              }
            };
          }),
        `ws://localhost:${port}/ws`,
      );

      expect(action).toBe("sync");
    } finally {
      await browser.close();
      await new Promise((resolve) => {
        pageServer.close(resolve);
      });
    }
  });
});
