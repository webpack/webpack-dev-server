import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { expect } from "expect";
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import Server from "../../lib/Server.js";
import compile from "../helpers/compile.js";
import portsMap from "../ports-map.js";

const [standalonePort, pluginPort] = portsMap["write-to-disk-clean"];

// `output.clean` cleans what `devMiddleware.writeToDisk` writes to disk once
// the middleware gives webpack a file system writing to and cleaning both the
// served one and the disk, instead of the served one itself.
// TODO in the next major, once the webpack-dev-middleware version required
// does so, remove this check and the test for the other case.
const supportsDiskClean = (() => {
  const compiler = webpack({ entry: "./index.js", infrastructureLogging: {} });
  const { context } = webpackDevMiddleware(
    compiler,
    { writeToDisk: () => true },
    true,
  );

  return compiler.outputFileSystem !== context.outputFileSystem;
})();

const bundle = expect.stringMatching(/^main\.[0-9a-f]+\.js$/);

describe("devMiddleware.writeToDisk with output.clean", () => {
  /** @type {string} */
  let directory;
  /** @type {string} */
  let dist;

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "wds-clean-"));
    dist = path.join(directory, "dist");
    fs.writeFileSync(path.join(directory, "index.js"), "console.log(1);");
    fs.mkdirSync(path.join(directory, "public", "images"), { recursive: true });
    fs.writeFileSync(path.join(directory, "public", "robots.txt"), "v1");
    fs.writeFileSync(
      path.join(directory, "public", "images", "logo.svg"),
      "<svg/>",
    );
    fs.mkdirSync(dist);
    // Left from an earlier session, as webpack would find it.
    fs.writeFileSync(path.join(dist, "stale.js"), "old");
  });

  afterEach(() => {
    fs.rmSync(directory, { recursive: true, force: true });
  });

  /**
   * @returns {import("webpack").Compiler} a compiler copying `public` beside the bundle
   */
  function createCompiler() {
    return webpack({
      mode: "development",
      devtool: false,
      context: directory,
      entry: "./index.js",
      output: {
        path: dist,
        filename: "main.[contenthash].js",
        clean: true,
        copy: [{ from: "public" }],
      },
      infrastructureLogging: { level: "error" },
      stats: "none",
    });
  }

  /**
   * @returns {string[]} the files in `dist`, relative to it
   */
  function listDist() {
    return fs
      .readdirSync(dist, { recursive: true, encoding: "utf8" })
      .filter((file) => fs.statSync(path.join(dist, file)).isFile())
      .map((file) => file.replaceAll("\\", "/"))
      .toSorted();
  }

  /**
   * Change a source and wait for the build the watcher starts for it.
   * @param {import("webpack").Compiler} compiler compiler
   * @param {() => void} change the change
   * @returns {Promise<void>} once rebuilt
   */
  async function rebuild(compiler, change) {
    let changedAt = Infinity;
    // The build that started after the change: the watcher may run one more
    // for the files the test wrote before it started.
    const done = new Promise((resolve) => {
      compiler.hooks.done.tap("test", (stats) => {
        if (stats.startTime >= changedAt) {
          resolve();
        }
      });
    });

    // Past the watcher's start, so the change is seen as one.
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
    change();
    changedAt = Date.now();

    await done;
  }

  /**
   * Change the entry, so the bundle gets a new hash.
   */
  function changeEntry() {
    fs.writeFileSync(path.join(directory, "index.js"), "console.log(2);");
  }

  /**
   * Remove a copied file from `public`.
   */
  function removeCopiedFile() {
    fs.rmSync(path.join(directory, "public", "robots.txt"));
  }

  const options = {
    hot: false,
    liveReload: false,
    static: false,
    // The copied image is served from memory, never written to disk.
    devMiddleware: { writeToDisk: (filePath) => !filePath.endsWith(".svg") },
  };

  const modes = [
    {
      name: "as a server of its own",
      port: standalonePort,
      /**
       * @param {import("webpack").Compiler} compiler compiler
       * @returns {Promise<() => Promise<void>>} a way to stop it
       */
      async start(compiler) {
        const server = new Server(
          { ...options, port: standalonePort },
          compiler,
        );

        await server.start();
        await new Promise((resolve) => {
          server.middleware.waitUntilValid(() => resolve());
        });

        return () => server.stop();
      },
    },
    {
      name: "as a plugin",
      port: pluginPort,
      /**
       * @param {import("webpack").Compiler} compiler compiler
       * @returns {Promise<() => Promise<void>>} a way to stop it
       */
      async start(compiler) {
        const server = new Server({ ...options, port: pluginPort });

        server.apply(compiler);

        await compile(compiler, pluginPort);

        // Closing the compiler stops its watching and, through `shutdown`, the server.
        return () =>
          new Promise((resolve) => {
            compiler.close(() => resolve());
          });
      },
    },
  ];

  for (const mode of modes) {
    describe(mode.name, () => {
      it(
        "writes to disk what the function takes and cleans the disk across rebuilds",
        { skip: !supportsDiskClean },
        async () => {
          const compiler = createCompiler();
          const stop = await mode.start(compiler);

          try {
            // The stale file cleaned, the image left off disk.
            expect(listDist()).toEqual([bundle, "robots.txt"]);

            const response = await fetch(
              `http://127.0.0.1:${mode.port}/images/logo.svg`,
            );

            expect(response.status).toBe(200);
            expect(await response.text()).toBe("<svg/>");

            const [firstBundle] = listDist();

            await rebuild(compiler, changeEntry);

            // One bundle, the earlier one cleaned.
            expect(listDist()).toEqual([bundle, "robots.txt"]);
            expect(listDist()[0]).not.toBe(firstBundle);

            await rebuild(compiler, removeCopiedFile);

            // A file no longer copied is cleaned from disk.
            expect(listDist()).toEqual([bundle]);
          } finally {
            await stop();
          }
        },
      );

      it(
        "writes to disk what the function takes without cleaning the disk with an earlier webpack-dev-middleware",
        { skip: supportsDiskClean },
        async () => {
          const compiler = createCompiler();
          const stop = await mode.start(compiler);

          try {
            expect(listDist()).toEqual([bundle, "robots.txt", "stale.js"]);
          } finally {
            await stop();
          }
        },
      );
    });
  }
});
