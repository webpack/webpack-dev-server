import {
  appendFileSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { transformFileAsync } from "@babel/core";
import { expect } from "expect";
import Server from "../lib/Server.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const libDir = path.join(rootDir, "lib");

const require = createRequire(import.meta.url);

/**
 * Collect every file under `dir` recursively.
 * @param {string} dir directory to walk
 * @returns {string[]} absolute file paths
 */
function walk(dir) {
  const files = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else {
      files.push(full);
    }
  }

  return files;
}

/**
 * Reproduce the `build:cjs` pipeline against `lib/` into `outDir`: transpile
 * every `.js` file with Babel's `cjs` env, copy other assets, drop the
 * `package.json` CommonJS marker and append the `module.exports = exports.default`
 * unwrap that `scripts/finalize-cjs-build.mjs` writes. The result can then be
 * `require()`d directly.
 * @param {string} outDir target directory
 */
async function buildCjsBundle(outDir) {
  for (const source of walk(libDir)) {
    const target = path.join(outDir, path.relative(libDir, source));

    mkdirSync(path.dirname(target), { recursive: true });

    if (source.endsWith(".js")) {
      const result = await transformFileAsync(source, { envName: "cjs" });

      writeFileSync(target, result.code);
    } else {
      copyFileSync(source, target);
    }
  }

  writeFileSync(
    path.join(outDir, "package.json"),
    `${JSON.stringify({ type: "commonjs" }, null, 2)}\n`,
  );

  appendFileSync(
    path.join(outDir, "Server.js"),
    "module.exports = exports.default;\nmodule.exports.default = exports.default;\n",
  );
}

describe("cjs", () => {
  let bundleDir;
  let serverPath;
  let serverSource;
  let bundlePackage;
  let cjsServer;

  before(async () => {
    // Build inside `node_modules` so the transpiled bare `require()`s
    // (`schema-utils`, `graceful-fs`, ...) resolve against the project deps.
    bundleDir = mkdtempSync(path.join(rootDir, "node_modules", ".wds-cjs-"));

    await buildCjsBundle(bundleDir);

    serverPath = path.join(bundleDir, "Server.js");
    serverSource = readFileSync(serverPath, "utf8");
    bundlePackage = JSON.parse(
      readFileSync(path.join(bundleDir, "package.json"), "utf8"),
    );
    cjsServer = require(serverPath);
  });

  after(() => {
    if (bundleDir) {
      rmSync(bundleDir, { recursive: true, force: true });
    }
  });

  it("should produce a require()-able CommonJS bundle", () => {
    expect(bundlePackage.type).toBe("commonjs");

    // Babel's strict-mode prologue, the `exports.default` assignment and the
    // unwrap appended by the finalize step.
    expect(serverSource).toMatch(/^"use strict";/);
    expect(serverSource).toMatch(/exports\.default = /);
    expect(serverSource).toMatch(/module\.exports = exports\.default;/);

    // Relative `import("./…")` becomes `require()` and `import.meta` is gone,
    // but bare `import("pkg")` stays native for ESM-only deps. Strip comments
    // first (JSDoc legitimately references `import("pkg")`).
    const executableCode = serverSource
      .replaceAll(/\/\*[\s\S]*?\*\//g, "")
      .replaceAll(/^\s*\/\/.*$/gm, "");

    expect(executableCode).not.toMatch(/import\(\s*["']\.\.?\//); // no relative
    expect(executableCode).toMatch(/import\(\s*["']p-retry["']\)/); // bare stays
    expect(executableCode).not.toMatch(/import\.meta/);
  });

  it("should expose the Server class through `require` (pre-ESM shape)", () => {
    // `require("webpack-dev-server")` returns the class directly, with
    // `.default` pointing back at it for ESM interop.
    expect(typeof cjsServer).toBe("function");
    expect(cjsServer.default).toBe(cjsServer);
    expect(cjsServer.name).toBe(Server.name);
    expect(cjsServer.length).toBe(Server.length);
  });

  it("should match the ESM default export", () => {
    expect(typeof Server).toBe("function");
    expect(cjsServer.name).toBe("Server");
    // Same public statics/prototype surface as the ESM build.
    expect(Object.getOwnPropertyNames(cjsServer.prototype)).toEqual(
      Object.getOwnPropertyNames(Server.prototype),
    );
  });
});
