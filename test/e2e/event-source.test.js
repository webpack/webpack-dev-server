import http from "node:http";
import path from "node:path";
import { afterEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { expect } from "expect";
import fs from "graceful-fs";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import reloadConfig from "../fixtures/reload-config/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Two: the host-check case needs a server of its own, since `allowedHosts`
// cannot be changed once one is running.
const [port, rejectPort] = portsMap["event-source"];

const cssFilePath = path.resolve(
  __dirname,
  "../fixtures/reload-config/main.css",
);

/**
 * Read one stream the way a browser's `EventSource` would, and report the
 * frames it carried.
 * @param {number} listeningOn port the server is on
 * @param {Record<string, string>} headers request headers
 * @param {number} want how many frames to wait for
 * @returns {Promise<{ status: number, contentType: string, frames: string[] }>} what arrived
 */
function readStream(listeningOn, headers, want) {
  return new Promise((resolve) => {
    /** @type {string[]} */
    const frames = [];
    let status = 0;
    let contentType = "";

    const finish = () => resolve({ status, contentType, frames });
    const timer = setTimeout(finish, 10000);
    const request = http.get(
      { host: "localhost", port: listeningOn, path: "/ws", headers },
      (res) => {
        status = /** @type {number} */ (res.statusCode);
        contentType = /** @type {string} */ (res.headers["content-type"]);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data: ")) {
              frames.push(line.slice(6));
            }
          }

          if (frames.length >= want) {
            clearTimeout(timer);
            request.destroy();
            finish();
          }
        });
      },
    );

    request.on("error", () => {
      clearTimeout(timer);
      finish();
    });
  });
}

// Server-Sent Events are the second transport this package can speak, and the
// only one served by the middleware rather than by an upgrade. Everything
// above the wire is supposed to be unable to tell the difference, which is
// what these check.
describe("Server-Sent Events transport", () => {
  let browser;
  let server;

  afterEach(async () => {
    if (browser) {
      await browser.close();
      browser = undefined;
    }

    if (server) {
      await server.stop();
      server = undefined;
    }

    if (fs.existsSync(cssFilePath)) {
      fs.unlinkSync(cssFilePath);
    }
  });

  it("connects and refreshes content with a hot update", async () => {
    fs.writeFileSync(cssFilePath, "body { background-color: rgb(0, 0, 255); }");

    const compiler = webpack(reloadConfig);

    server = new Server(
      { port, client: { webSocketTransport: "sse" }, hot: true },
      compiler,
    );

    await server.start();

    // Naming the client's transport is enough: the endpoint that serves it is
    // picked to match, rather than leaving a stream client pointed at a
    // WebSocket server.
    expect(server.options.webSocketServer.type).toBe("sse");

    const launched = await runBrowser();

    ({ browser } = launched);

    const { page } = launched;
    const consoleMessages = [];

    page.on("console", (message) => {
      consoleMessages.push(message.text());
    });

    // Not `networkidle0`: the stream is a request that never ends, so the
    // network is never idle while the client is connected.
    await page.goto(`http://localhost:${port}/`, {
      waitUntil: "domcontentloaded",
    });

    const backgroundBefore = await page.evaluate(
      () => globalThis.getComputedStyle(document.body).backgroundColor,
    );

    expect(backgroundBefore).toBe("rgb(0, 0, 255)");

    fs.writeFileSync(cssFilePath, "body { background-color: rgb(255, 0, 0); }");

    await page.waitForFunction(
      () =>
        globalThis.getComputedStyle(document.body).backgroundColor ===
        "rgb(255, 0, 0)",
      { timeout: 60000 },
    );

    // The page took the rebuild as an update over a stream it opened itself —
    // no upgrade, no second server — and said so in the words it uses for a
    // socket, since nothing above the wire knows which transport it is on.
    expect(
      consoleMessages.filter((message) =>
        message.includes("Hot Module Replacement enabled"),
      ),
    ).toHaveLength(1);
    expect(
      consoleMessages.filter((message) => message.includes("Disconnected")),
    ).toHaveLength(0);
  });

  it("sends this package's handshake down the stream", async () => {
    const compiler = webpack(reloadConfig);

    fs.writeFileSync(cssFilePath, "body { background-color: rgb(0, 0, 255); }");

    server = new Server(
      {
        port,
        client: { webSocketTransport: "sse", progress: true },
        hot: true,
      },
      compiler,
    );

    await server.start();

    const { status, contentType, frames } = await readStream(
      port,
      {
        accept: "text/event-stream",
        host: `localhost:${port}`,
        origin: `http://localhost:${port}`,
      },
      5,
    );

    expect(status).toBe(200);
    expect(contentType).toContain("text/event-stream");

    // The same messages a WebSocket client is greeted with, in the same
    // protocol — only the wire underneath them changed.
    const types = frames.map((frame) => JSON.parse(frame).type);

    expect(types).toContain("hot");
    expect(types).toContain("liveReload");
    expect(types).toContain("progress");
    expect(types).toContain("overlay");
  });

  it("keeps this package's host check on the stream", async () => {
    const compiler = webpack(reloadConfig);

    fs.writeFileSync(cssFilePath, "body { background-color: rgb(0, 0, 255); }");

    server = new Server(
      {
        port: rejectPort,
        client: { webSocketTransport: "sse" },
        allowedHosts: ["example.test"],
      },
      compiler,
    );

    await server.start();

    const { frames } = await readStream(
      rejectPort,
      {
        accept: "text/event-stream",
        host: `localhost:${rejectPort}`,
        origin: "http://not-allowed.test",
      },
      1,
    );

    // The middleware serves the stream, but who may read it is still this
    // package's to say — it is handed the request the client connected with
    // and closes the ones it does not want.
    expect(JSON.parse(frames[0])).toEqual({
      type: "error",
      data: "Invalid Host/Origin header",
    });
    expect(server.webSocketServer.clients).toHaveLength(0);
  });

  it("takes a stream that carries no origin as one of its own", async () => {
    const compiler = webpack(reloadConfig);

    fs.writeFileSync(cssFilePath, "body { background-color: rgb(0, 0, 255); }");

    server = new Server(
      { port, client: { webSocketTransport: "sse" }, hot: true },
      compiler,
    );

    await server.start();

    // What a browser actually sends: `EventSource` puts no `Origin` on a
    // same-origin request, unlike a WebSocket handshake, which carries one
    // either way. Refusing it would refuse every page this server serves.
    const { frames } = await readStream(
      port,
      { accept: "text/event-stream", host: `localhost:${port}` },
      1,
    );

    expect(JSON.parse(frames[0]).type).not.toBe("error");
  });
});
