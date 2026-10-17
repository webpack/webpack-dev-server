import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { setTimeout } from "node:timers/promises";
import { expect } from "expect";
import request from "supertest";
import webpack from "webpack";
import { WebSocketServer } from "ws";
import Server from "../../lib/Server.js";
import portsMap from "../ports-map.js";

const [devServerPort, backendPort] = portsMap["proxy-web-socket-origin"];

// @see https://github.com/webpack/webpack-dev-server/security/advisories/GHSA-cfqc-fj3v-j925
describe("proxied WebSocket upgrade origin validation", () => {
  let server;
  let backend;
  let webSocketServer;
  let backendConnections;
  let tmp;

  async function startServer(proxy) {
    const compiler = webpack({
      mode: "development",
      context: tmp,
      entry: "./entry.js",
      output: { path: path.join(tmp, "dist") },
    });

    server = new Server(
      {
        port: devServerPort,
        host: "localhost",
        allowedHosts: "auto",
        client: false,
        hot: false,
        liveReload: false,
        proxy: [proxy],
      },
      compiler,
    );

    await server.start();
  }

  beforeEach(async () => {
    backendConnections = 0;

    // A stand-in for a service the developer proxies over WebSocket.
    backend = http.createServer((req, res) => {
      res.end("backend response");
    });
    webSocketServer = new WebSocketServer({ server: backend });
    webSocketServer.on("connection", (client) => {
      backendConnections += 1;
      client.send("INTERNAL-SERVICE-SECRET");
    });
    await new Promise((resolve) => {
      backend.listen(backendPort, "127.0.0.1", resolve);
    });

    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wds-proxy-origin-"));
    fs.writeFileSync(path.join(tmp, "entry.js"), "console.log('e2e');\n");

    await startServer({
      context: ["/api"],
      target: `http://127.0.0.1:${backendPort}`,
      ws: true,
    });
  });

  afterEach(async () => {
    await server.stop();
    for (const client of webSocketServer.clients) {
      client.terminate();
    }
    webSocketServer.close();
    backend.closeAllConnections?.();
    await new Promise((resolve) => {
      backend.close(resolve);
    });
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  function upgrade(origin, headers = {}) {
    return new Promise((resolve) => {
      const req = http.request({
        host: "localhost",
        port: devServerPort,
        path: "/api/socket",
        timeout: 8000,
        headers: {
          Connection: "Upgrade",
          Upgrade: "websocket",
          "Sec-WebSocket-Key": "dGhlIHNhbXBsZSBub25jZQ==",
          "Sec-WebSocket-Version": "13",
          Origin: origin,
          ...headers,
        },
      });

      req.on("upgrade", (res, socket) => {
        socket.destroy();
        resolve({ upgraded: true, status: res.statusCode });
      });
      req.on("response", (res) => {
        res.resume();
        resolve({ upgraded: false, status: res.statusCode });
      });
      req.on("timeout", () => {
        req.destroy();
        resolve({ upgraded: false });
      });
      req.on("error", () => {
        resolve({ upgraded: false });
      });
      req.end();
    });
  }

  it("should reject a cross-origin proxied WebSocket upgrade", async () => {
    const result = await upgrade("http://evil.example.com");

    expect(result.upgraded).toBe(false);
    expect(result.status).toBe(403);
    expect(backendConnections).toBe(0);
  });

  it("should allow a same-origin proxied WebSocket upgrade", async () => {
    const result = await upgrade(`http://localhost:${devServerPort}`);

    expect(result.upgraded).toBe(true);
    expect(result.status).toBe(101);
    expect(backendConnections).toBe(1);
  });

  it("should not apply the separate HMR port exception to a proxy", async () => {
    const result = await upgrade(`http://localhost:${devServerPort}`, {
      Host: `localhost:${backendPort}`,
    });

    expect(result.status).toBe(403);
    expect(backendConnections).toBe(0);
  });

  for (const options of [
    { allowedHosts: ["localhost"] },
    { allowedHosts: "all" },
    { client: { webSocketURL: { hostname: "localhost" } } },
  ]) {
    // eslint-disable-next-line no-loop-func
    it(`should reject an IP origin with ${JSON.stringify(options)}, even after an HTTP request`, async () => {
      Object.assign(server.options, options);

      await request(server.server).get("/api/hello").expect(200);

      const result = await upgrade("http://192.168.1.2");

      expect(result.status).toBe(403);
      await setTimeout(100);
      expect(backendConnections).toBe(0);
    });
  }

  it("should allow a configured origin without allowing it as a Host", async () => {
    server.options.allowedOrigins = ["https://app.example.com:3000"];

    const result = await upgrade("https://app.example.com:3000");

    expect(result.status).toBe(101);
    expect(backendConnections).toBe(1);
  });

  it("should reject a configured origin on another port", async () => {
    server.options.allowedOrigins = ["https://app.example.com:3000"];

    const result = await upgrade("https://app.example.com:3001");

    expect(result.status).toBe(403);
    expect(backendConnections).toBe(0);
  });

  it("should not forward a rejected upgrade after an HTTP proxy request", async () => {
    await request(server.server).get("/api/hello").expect(200);

    const result = await upgrade("http://evil.example.com");

    expect(result.upgraded).toBe(false);
    expect(result.status).toBe(403);

    // A separate upgrade listener can still contact the backend after the
    // client receives the rejection, so allow that forwarding to finish.
    await setTimeout(100);

    expect(backendConnections).toBe(0);
  });

  it("should allow a same-origin upgrade after an HTTP proxy request", async () => {
    await request(server.server).get("/api/hello").expect(200);

    const result = await upgrade(`http://localhost:${devServerPort}`);

    expect(result.upgraded).toBe(true);
    expect(result.status).toBe(101);
    expect(backendConnections).toBe(1);
  });

  it("should validate upgrades using the current proxy callback configuration", async () => {
    await server.stop();

    let proxyConfig = {
      context: ["/api"],
      target: `http://127.0.0.1:${backendPort}`,
      ws: false,
      pathRewrite: { "^/api": "/initial" },
    };

    await startServer(() => ({ ...proxyConfig }));
    await request(server.server).get("/api/hello").expect(200);

    proxyConfig = {
      ...proxyConfig,
      ws: true,
      pathRewrite: { "^/api": "/updated" },
    };

    await request(server.server).get("/api/hello").expect(200);

    const rejected = await upgrade("http://evil.example.com");

    expect(rejected.status).toBe(403);

    await setTimeout(100);

    expect(backendConnections).toBe(0);

    let backendPath;

    backend.once("upgrade", (req) => {
      backendPath = req.url;
    });

    const allowed = await upgrade(`http://localhost:${devServerPort}`);

    expect(allowed.status).toBe(101);
    expect(backendConnections).toBe(1);
    expect(backendPath).toBe("/updated/socket");
  });
});
