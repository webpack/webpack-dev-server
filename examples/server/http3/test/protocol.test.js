// cspell:words currentspace
import assert from "node:assert/strict";
import { once } from "node:events";
import { writeFile } from "node:fs/promises";
import http2 from "node:http2";
import net from "node:net";
import dgram from "node:dgram";
import { gzipSync } from "node:zlib";
import { test } from "node:test";
import { performance } from "node:perf_hooks";
import { connectAsync } from "@currentspace/http3";
import { startExample } from "../start.js";
import { fixture, http1, collect } from "./helpers.js";

const receipts = [];
for (const runtimeMode of ["portable", "wasm"]) {
  test(
    `${runtimeMode}: H3 assets, middleware, TLS, fallback and lifecycle`,
    { timeout: 60000 },
    async (t) => {
      const files = await fixture();
      let app;
      let h2;
      let h3;
      t.after(async () => {
        h2?.destroy();
        await h3?.close();
        await app?.close();
        await files.cleanup();
      });
      const compressed = gzipSync(
        Buffer.from("compressed development asset".repeat(100)),
      );
      app = await startExample({
        ...files.tls,
        config: files.config,
        runtimeMode,
        setupMiddlewares: (middlewares) => {
          middlewares.push({
            name: "protocol-fixtures",
            middleware(req, res, next) {
              if (req.url === "/echo") {
                res.setHeader("x-forwarded-host", req.headers.host);
                req.pipe(res);
              } else if (req.url === "/compressed") {
                res.setHeader("content-encoding", "gzip");
                res.setHeader("content-length", String(compressed.length));
                res.setHeader("set-cookie", [
                  "first=1; Secure",
                  "second=2; Secure",
                ]);
                res.end(compressed);
              } else if (req.url === "/redirect") {
                res.writeHead(302, { location: "/index.html" });
                res.end();
              } else next();
            },
          });
          return middlewares;
        },
      });
      const mainPort = app.port;
      const quicPort = app.companion.port;
      h2 = http2.connect(`https://127.0.0.1:${mainPort}`, {
        ca: files.tls.ca,
        servername: "localhost",
      });
      await once(h2, "connect");
      h3 = await connectAsync(`127.0.0.1:${quicPort}`, {
        ca: files.tls.ca,
        servername: "localhost",
        rejectUnauthorized: true,
        runtimeMode,
      });
      const h3get = async (pathname, body, extra = {}) =>
        collect(
          await h3.requestAsync(
            {
              ":method": body ? "POST" : "GET",
              ":scheme": "https",
              ":authority": `localhost:${mainPort}`,
              ":path": pathname,
              ...extra,
            },
            { endStream: false },
          ),
          body,
        );
      const h2get = (pathname) =>
        collect(h2.request({ ":path": pathname }, { endStream: false }));

      const document = await h3get("/index.html");
      assert.equal(String(document.headers[":status"]), "200");
      assert.match(document.body.toString(), /HTTP\/3 development example/);
      assert.equal(document.headers["alt-svc"], `h3=":${quicPort}"; ma=60`);
      const bundle = await h3get("/main.js");
      assert.equal(String(bundle.headers[":status"]), "200");
      assert.match(bundle.body.toString(), /webpack/);
      assert.deepEqual((await h2get("/main.js")).body, bundle.body);
      const fallback = await http1(mainPort, files.tls.ca, "/index.html");
      assert.equal(fallback.status, 200);
      assert.equal(fallback.protocol, "1.1");
      const payload = Buffer.alloc(128 * 1024, 0xa5);
      const echo = await h3get("/echo", payload);
      assert.deepEqual(echo.body, payload);
      assert.equal(echo.headers["x-forwarded-host"], `localhost:${mainPort}`);
      const zipped = await h3get("/compressed");
      assert.deepEqual(zipped.body, compressed);
      assert.equal(zipped.headers["content-encoding"], "gzip");
      assert.equal(Number(zipped.headers["content-length"]), compressed.length);
      assert.deepEqual(zipped.headers["set-cookie"], [
        "first=1; Secure",
        "second=2; Secure",
      ]);
      const head = await h3get("/compressed", undefined, { ":method": "HEAD" });
      assert.equal(head.body.length, 0);
      const redirect = await h3get("/redirect");
      assert.equal(String(redirect.headers[":status"]), "302");
      assert.equal(redirect.headers.location, "/index.html");
      const denied = await h3get("/index.html", undefined, {
        ":authority": "untrusted.invalid",
      });
      assert.equal(String(denied.headers[":status"]), "403");

      const timings = {};
      for (const [protocol, get] of [
        ["h2", h2get],
        ["h3", h3get],
      ]) {
        const samples = [];
        for (let i = 0; i < 25; i++) {
          const started = performance.now();
          assert.equal(
            String((await get("/index.html")).headers[":status"]),
            "200",
          );
          samples.push(performance.now() - started);
        }
        samples.sort((a, b) => a - b);
        timings[protocol] = {
          requests: samples.length,
          medianMs: samples[12],
          p95Ms: samples[23],
        };
      }
      await h3.close();
      h2.destroy();
      await app.companion.close();
      const afterStop = await http1(mainPort, files.tls.ca);
      assert.equal(afterStop.status, 200);
      assert.equal(afterStop.headers["alt-svc"], "clear");
      const started = performance.now();
      await app.close();
      await app.close();
      for (const port of [mainPort, quicPort]) {
        const probe = net.createServer();
        probe.listen(port, "127.0.0.1");
        await once(probe, "listening");
        probe.close();
        await once(probe, "close");
      }
      const udp = dgram.createSocket("udp4");
      udp.bind(quicPort, "127.0.0.1");
      await once(udp, "listening");
      udp.close();
      await once(udp, "close");
      receipts.push({
        runtimeMode,
        node: process.versions.node,
        passed: true,
        timings,
        shutdownAndPortReuseMs: performance.now() - started,
      });
      console.log(JSON.stringify(receipts.at(-1)));
    },
  );
}

test.after(async () => {
  if (process.env.HTTP3_TEST_RECEIPT)
    await writeFile(
      process.env.HTTP3_TEST_RECEIPT,
      JSON.stringify(
        { platform: process.platform, arch: process.arch, receipts },
        null,
        2,
      ) + "\n",
    );
});

test(
  "a UDP bind failure rolls back the TCP server",
  { timeout: 30000 },
  async () => {
    const files = await fixture();
    const occupied = dgram.createSocket("udp4");
    occupied.bind(0, "127.0.0.1");
    await once(occupied, "listening");
    const reserved = net.createServer();
    reserved.listen(0, "127.0.0.1");
    await once(reserved, "listening");
    const port = reserved.address().port;
    reserved.close();
    await once(reserved, "close");
    try {
      await assert.rejects(
        startExample({
          ...files.tls,
          config: files.config,
          port,
          quicPort: occupied.address().port,
        }),
      );
      const probe = net.createServer();
      probe.listen(port, "127.0.0.1");
      await once(probe, "listening");
      probe.close();
      await once(probe, "close");
    } finally {
      occupied.close();
      await once(occupied, "close");
      await files.cleanup();
    }
  },
);

test(
  "the companion rejects an untrusted upstream certificate",
  { timeout: 30000 },
  async () => {
    const files = await fixture();
    const wrongCa = await fixture();
    let app;
    let client;
    try {
      app = await startExample({
        ...files.tls,
        ca: wrongCa.tls.ca,
        config: files.config,
      });
      client = await connectAsync(`127.0.0.1:${app.companion.port}`, {
        ca: files.tls.ca,
        servername: "localhost",
        rejectUnauthorized: true,
        runtimeMode: "portable",
      });
      const response = await collect(
        await client.requestAsync(
          {
            ":method": "GET",
            ":scheme": "https",
            ":authority": `localhost:${app.port}`,
            ":path": "/",
          },
          { endStream: false },
        ),
      );
      assert.equal(String(response.headers[":status"]), "502");
      assert.equal(response.body.toString(), "Development server unavailable");
    } finally {
      await client?.close();
      await app?.close();
      await files.cleanup();
      await wrongCa.cleanup();
    }
  },
);

test(
  "cancelling an H3 stream closes its upstream response",
  { timeout: 30000 },
  async () => {
    const files = await fixture();
    let app;
    let client;
    let upstreamClosed = false;
    try {
      app = await startExample({
        ...files.tls,
        config: files.config,
        setupMiddlewares: (middlewares) => {
          middlewares.unshift({
            name: "stream-fixture",
            middleware(req, res, next) {
              if (req.url !== "/stream") {
                next();
                return;
              }
              res.writeHead(200, { "content-type": "text/event-stream" });
              res.write("data: first\n\n");
              const timer = setInterval(() => res.write("data: next\n\n"), 20);
              res.once("close", () => {
                clearInterval(timer);
                upstreamClosed = true;
              });
            },
          });
          return middlewares;
        },
      });
      client = await connectAsync(`127.0.0.1:${app.companion.port}`, {
        ca: files.tls.ca,
        servername: "localhost",
        rejectUnauthorized: true,
        runtimeMode: "portable",
      });
      const stream = await client.requestAsync(
        {
          ":method": "GET",
          ":scheme": "https",
          ":authority": `localhost:${app.port}`,
          ":path": "/stream",
        },
        { endStream: false },
      );
      const first = once(stream, "data");
      stream.end();
      await first;
      stream.close(0x010c);
      for (let i = 0; i < 100 && !upstreamClosed; i++)
        await new Promise((resolve) => setTimeout(resolve, 20));
      assert.equal(upstreamClosed, true);
    } finally {
      await client?.close();
      await app?.close();
      await files.cleanup();
    }
  },
);
