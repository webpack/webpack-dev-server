import fsPromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { expect } from "expect";
import fs from "graceful-fs";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import portsMap from "../ports-map.js";

const [port, rootOutputPort, relativeDirectoryPort] =
  portsMap["static-watch-output-path"];

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

// The watched set fills in as chokidar scans and is empty right after `start()`,
// so it is polled until it has something and then given a moment to finish.
// Paths are resolved because a relative `static.directory` is reported as given.
const watchedDirectories = async (server, timeout = 20000) => {
  const collect = () =>
    server.staticWatchers
      .flatMap((watcher) => Object.keys(watcher.getWatched()))
      .map((watchedPath) => path.resolve(watchedPath));
  const started = Date.now();

  while (collect().length === 0) {
    if (Date.now() - started > timeout) {
      throw new Error("the static watcher never reported a watched directory");
    }

    await sleep(REWRITE_INTERVAL_MS);
  }

  await sleep(2000);

  return collect();
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

  it("should keep watching when output.path contains the static directory", async () => {
    // `output.path` defaults to `/` under an in-memory filesystem and is
    // routinely left there, and every static directory is inside it. Treating
    // that as output would stop watching everything.
    const { root } = path.parse(tempDirectory);
    const rootOutputCompiler = webpack({
      mode: "development",
      context: tempDirectory,
      entry: "./entry.js",
      output: { path: root },
      infrastructureLogging: { level: "none" },
      stats: "none",
    });
    const rootOutputServer = new Server(
      {
        static: { directory: tempDirectory, watch: true },
        port: rootOutputPort,
      },
      rootOutputCompiler,
    );

    /** @type {string[]} */
    const rootOutputReloads = [];
    const sendMessage = rootOutputServer.sendMessage.bind(rootOutputServer);

    rootOutputServer.sendMessage = (clients, type, data) => {
      if (type === "static-changed") {
        rootOutputReloads.push(String(data));
      }

      return sendMessage(clients, type, data);
    };

    await rootOutputServer.start();

    try {
      await waitUntilWatching(rootOutputReloads, outsideOutput);

      expect(rootOutputReloads).toContain(outsideOutput);
    } finally {
      await rootOutputServer.stop();
      // the first server watches the same directory, so it saw those writes too
      reloads.length = 0;
    }
  });

  it("should exclude the output path when the static directory is relative", async () => {
    // `static.directory` is taken as given, so it can be relative while
    // `outputPath` and the watcher's own paths are absolute. Comparing them
    // unresolved makes the exclusion quietly match nothing.
    const relativeDirectory = path.relative(process.cwd(), tempDirectory);
    const relativeCompiler = webpack({
      mode: "development",
      context: tempDirectory,
      entry: "./entry.js",
      output: { path: outputPath },
      infrastructureLogging: { level: "none" },
      stats: "none",
    });
    const relativeServer = new Server(
      {
        static: { directory: relativeDirectory, watch: true },
        port: relativeDirectoryPort,
      },
      relativeCompiler,
    );

    await relativeServer.start();

    try {
      const watched = await watchedDirectories(relativeServer);

      expect(watched).toContain(tempDirectory);
      expect(watched).not.toContain(outputPath);
    } finally {
      await relativeServer.stop();
    }
  });

  it("should still reload for the rest of the static directory", async () => {
    await fsPromises.writeFile(outsideOutput, "asset again");
    await waitForReload(reloads, outsideOutput);

    expect(reloads).toStrictEqual([outsideOutput]);
  });
});
