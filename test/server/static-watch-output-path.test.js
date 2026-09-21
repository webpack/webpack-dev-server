import fsPromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { expect } from "expect";
import fs from "graceful-fs";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import portsMap from "../ports-map.js";

const port = portsMap["static-watch-output-path"];

// The ignored file is rewritten this many times, this far apart, so that the
// window spans several seconds. A single write could land while chokidar is
// still discovering the nested directory and be lost; a stream of them cannot
// all be.
const REWRITES = 12;
const REWRITE_INTERVAL_MS = 250;

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// Rewrites `file` until the watcher reports it, which establishes that the
// watcher is live. It does not establish that every nested path has been
// discovered, so it is only the starting gun — the assertions below do not
// rest on it alone.
const waitUntilWatching = async (reloads, file, timeout = 20000) => {
  const started = Date.now();

  while (!reloads.includes(file)) {
    if (Date.now() - started > timeout) {
      throw new Error(`the static watcher never reported ${file}`);
    }

    await fsPromises.writeFile(file, `warm-up ${Date.now()}`);
    await sleep(REWRITE_INTERVAL_MS);
  }
};

const waitForReload = (reloads, file, timeout = 10000) =>
  new Promise((resolve, reject) => {
    const started = Date.now();
    const check = () => {
      if (reloads.includes(file)) {
        resolve();
        return;
      }

      if (Date.now() - started > timeout) {
        reject(new Error(`timed out waiting for a reload of ${file}`));
        return;
      }

      setTimeout(check, 50);
    };

    check();
  });

describe("static watching and output.path", () => {
  let tempDirectory;
  let outputPath;
  let insideOutput;
  let outsideOutput;
  let compiler;
  let server;
  let reloads;

  before(async () => {
    tempDirectory = await fsPromises.mkdtemp(
      path.join(os.tmpdir(), "wds-static-output-"),
    );
    outputPath = path.join(tempDirectory, "build");
    insideOutput = path.join(outputPath, "emitted.txt");
    outsideOutput = path.join(tempDirectory, "asset.txt");

    await fsPromises.mkdir(outputPath, { recursive: true });
    // both files must already exist: chokidar reports a new file as `add`,
    // and only a rewrite of a known file as the `change` that reloads
    await fsPromises.writeFile(insideOutput, "emitted");
    await fsPromises.writeFile(outsideOutput, "asset");
    await fsPromises.writeFile(
      path.join(tempDirectory, "entry.js"),
      "module.exports = 1;",
    );

    compiler = webpack({
      mode: "development",
      context: tempDirectory,
      entry: "./entry.js",
      output: { path: outputPath },
      infrastructureLogging: { level: "none" },
      stats: "none",
    });

    server = new Server(
      {
        static: { directory: tempDirectory, watch: true },
        port,
      },
      compiler,
    );

    reloads = [];

    const sendMessage = server.sendMessage.bind(server);

    server.sendMessage = (clients, type, data) => {
      if (type === "static-changed") {
        reloads.push(String(data));
      }

      return sendMessage(clients, type, data);
    };

    await server.start();

    // chokidar drops events raised before its initial scan finishes, so a write
    // sent too early is simply lost. `ready` cannot be awaited from here — the
    // watcher is created inside `start()` and may already have emitted it — so
    // the control file is rewritten until the watcher answers.
    await waitUntilWatching(reloads, outsideOutput);
    reloads.length = 0;
  });

  after(async () => {
    await server.stop();
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  });

  it("should not watch the output directory at all", () => {
    // the strongest form of the assertion, and the only one that does not
    // depend on event timing: chokidar lists what it decided to watch, so a
    // predicate that failed to exclude the output directory shows up here even
    // if no write ever raced with the scan
    const watched = server.staticWatchers.flatMap((watcher) =>
      Object.keys(watcher.getWatched()),
    );

    expect(watched).toContain(tempDirectory);
    expect(watched).not.toContain(outputPath);
  });

  it("should not reload when a file inside output.path is rewritten", async () => {
    // the compilation already reaches the client through the middleware, so a
    // reload here only fires because the build wrote its own output. Rewriting
    // throughout the window rather than once means a single write lost to the
    // initial scan cannot hide a broken predicate.
    for (let index = 0; index < REWRITES; index++) {
      await fsPromises.writeFile(insideOutput, `emitted ${index}`);
      await sleep(REWRITE_INTERVAL_MS);
    }

    expect(reloads).toHaveLength(0);
  });

  it("should still reload for the rest of the static directory", async () => {
    await fsPromises.writeFile(outsideOutput, "asset again");
    await waitForReload(reloads, outsideOutput);

    expect(reloads).toStrictEqual([outsideOutput]);
  });
});
