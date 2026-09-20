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

// Long enough that a watcher which does report the write has reported it: the
// control below rewrites a file beside the output directory and is seen well
// inside this window, so an empty list after it means the write was ignored
// rather than merely slow.
const SETTLE_MS = 3000;

const settle = () =>
  new Promise((resolve) => {
    setTimeout(resolve, SETTLE_MS);
  });

// chokidar suppresses events until its initial scan finishes, so a write sent
// before that is simply lost — the watcher has to be known-ready before the
// absence of a reload means anything.
const waitForWatchers = (watchers, timeout = 10000) =>
  new Promise((resolve, reject) => {
    const started = Date.now();
    const check = () => {
      if (
        watchers.length > 0 &&
        watchers.every(
          (watcher) => Object.keys(watcher.getWatched()).length > 0,
        )
      ) {
        resolve();
        return;
      }

      if (Date.now() - started > timeout) {
        reject(new Error("timed out waiting for the static watchers"));
        return;
      }

      setTimeout(check, 50);
    };

    check();
  });

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
    await waitForWatchers(server.staticWatchers);
  });

  after(async () => {
    await server.stop();
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  });

  it("should not reload when a file inside output.path is rewritten", async () => {
    // the compilation already reaches the client through the middleware, so a
    // reload here only fires because the build wrote its own output
    await fsPromises.writeFile(insideOutput, "emitted again");
    await settle();

    expect(reloads).toHaveLength(0);
  });

  it("should still reload for the rest of the static directory", async () => {
    await fsPromises.writeFile(outsideOutput, "asset again");
    await waitForReload(reloads, outsideOutput);

    expect(reloads).toStrictEqual([outsideOutput]);
  });
});
