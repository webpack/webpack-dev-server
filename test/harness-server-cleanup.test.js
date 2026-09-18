import { describe, it } from "node:test";
import { expect } from "expect";
import webpack from "webpack";
import Server from "../lib/Server.js";
import config from "./fixtures/simple-config/webpack.config.js";
import portsMap from "./ports-map.js";

const port = portsMap["harness-server-cleanup"];

// Covers the sweep in `scripts/node-test-setup.mjs`. Each pair is a test that
// leaves a server holding the port followed by one that has to bind it again:
// without the sweep the second of each pair fails with `EADDRINUSE`.
describe("harness server cleanup", () => {
  async function startServer() {
    const server = new Server({ port }, webpack(config));

    await server.start();

    return server;
  }

  async function expectPortIsFree() {
    const server = await startServer();

    expect(server.server.address().port).toBe(port);

    await server.stop();
  }

  it("leaves a server running", async () => {
    await startServer();
  });

  it("can bind the port after a server was left running", expectPortIsFree);

  it("stops a server without awaiting the shutdown", async () => {
    const server = await startServer();

    server.stop();
  });

  it("can bind the port after a stop that was not awaited", expectPortIsFree);

  it("stops a server whose shutdown rejects", async () => {
    const server = await startServer();

    // Rejects before `stop()` reaches the listener, so the port is still held
    // when the rejection propagates — the case a plain retry cannot see.
    server.staticWatchers = [
      { close: () => Promise.reject(new Error("close failed")) },
    ];

    await expect(server.stop()).rejects.toThrow("close failed");
  });

  it("can bind the port after a rejected stop", expectPortIsFree);
});
