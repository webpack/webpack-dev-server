import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { test } from "node:test";
import { chromium } from "playwright";
import { fixture } from "./helpers.js";
import { startExample } from "../start.js";

test(
  "Chromium discovers HTTP/3, keeps WSS HMR, and falls back to HTTP/2",
  { timeout: 60000 },
  async (t) => {
    const files = await fixture();
    let app;
    let browser;
    t.after(async () => {
      await browser?.close();
      await app?.close();
      await files.cleanup();
    });
    app = await startExample({ ...files.tls, config: files.config });
    // Pin only this ephemeral test certificate. Do not change the OS trust store,
    // set ignoreHTTPSErrors, or disable certificate checking for unrelated hosts.
    browser = await chromium.launch({
      args: [
        "--enable-quic",
        "--host-resolver-rules=MAP localhost 127.0.0.1",
        // Chromium derives its QUIC unknown-root allowlist from this flag. Force
        // only the alternative port: the page's primary origin still uses Alt-Svc
        // discovery and can fall back to its ordinary HTTP/2 TCP listener.
        `--origin-to-force-quic-on=localhost:${app.companion.port}`,
        `--ignore-certificate-errors-spki-list=${files.spki}`,
      ],
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const sockets = [];
    page.on("websocket", (socket) => sockets.push(socket.url()));
    const responses = [];
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    cdp.on("Network.responseReceived", ({ response }) =>
      responses.push({
        url: response.url,
        protocol: response.protocol,
        status: response.status,
        altSvc: response.headers["alt-svc"],
        remoteAddress: response.remoteIPAddress,
      }),
    );
    await page.goto(app.url);
    await page.waitForFunction(
      () =>
        document.querySelector("#message").textContent ===
        "HTTP/3 development example",
    );
    for (
      let attempt = 0;
      attempt < 30 && !responses.some((r) => r.protocol === "h3");
      attempt++
    ) {
      await page.evaluate(
        (i) =>
          fetch(`/index.html?discover=${i}`, { cache: "no-store" }).then((r) =>
            r.text(),
          ),
        attempt,
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.ok(
      responses.some((r) => r.protocol === "h3"),
      JSON.stringify(responses),
    );
    await page.goto(`${app.url}/index.html?http3=1`);
    await page.waitForFunction(
      () =>
        document.querySelector("#message").textContent ===
        "HTTP/3 development example",
    );
    assert.ok(
      responses.some((r) => r.url.includes("http3=1") && r.protocol === "h3"),
    );
    assert.ok(
      responses.some((r) => r.url.includes("/main.js") && r.protocol === "h3"),
    );
    await page.evaluate(() => {
      window.http3TestMarker = "same-document";
    });
    const started = performance.now();
    await writeFile(
      path.join(files.app, "message.js"),
      'export default "Updated over HMR";\n',
    );
    await page.waitForFunction(
      () =>
        document.querySelector("#message").textContent === "Updated over HMR",
    );
    const hmrMs = performance.now() - started;
    assert.equal(
      await page.evaluate(() => window.http3TestMarker),
      "same-document",
    );
    assert.ok(
      sockets.some((url) => url.startsWith(`wss://127.0.0.1:${app.port}/`)),
      JSON.stringify(sockets),
    );
    assert.ok(
      responses.some(
        (r) => r.url.includes("hot-update") && r.protocol === "h3",
      ),
    );

    await app.companion.close();
    await page.goto(`${app.url}/index.html?fallback=1`);
    await page.waitForFunction(
      () =>
        document.querySelector("#message").textContent === "Updated over HMR",
    );
    assert.ok(
      responses.some(
        (r) => r.url.includes("fallback=1") && r.protocol === "h2",
      ),
    );
    assert.deepEqual(errors, []);
    const receipt = {
      passed: true,
      node: process.versions.node,
      browser: browser.version(),
      certificateMode:
        "ephemeral leaf SPKI pinned; QUIC alternative origin enabled; OS trust unchanged",
      hmrMs,
      sockets,
      responses,
    };
    if (process.env.HTTP3_BROWSER_RECEIPT)
      await writeFile(
        process.env.HTTP3_BROWSER_RECEIPT,
        JSON.stringify(receipt, null, 2) + "\n",
      );
    console.log(
      JSON.stringify({
        passed: true,
        browser: receipt.browser,
        hmrMs,
        h3Responses: responses.filter((r) => r.protocol === "h3").length,
        fallback: "h2",
      }),
    );
  },
);
