import { appendFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Finalize the CommonJS build produced by `babel lib --out-dir dist`.
//
// The CJS build is emitted flat into `dist/` (same depth from the package root
// as `lib/`) so the relative `cjsRequire.resolve("../client/...")` calls in
// `Server.js` resolve to `<root>/client` from both `lib/` and `dist/`.
//
// 1. Drop a `package.json` with `"type": "commonjs"` so Node treats the `.js`
//    files in `dist/` as CommonJS regardless of the package's root
//    `"type": "module"`.
// 2. Babel emits the loader as `exports.default`. Append the `module.exports`
//    unwrap so the public Server and BaseServer entrypoints return their
//    classes directly, while `.default` keeps pointing at them for interop.

const CJS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "dist",
);

await writeFile(
  path.join(CJS_DIR, "package.json"),
  `${JSON.stringify({ type: "commonjs" }, null, 2)}\n`,
);

for (const entry of ["Server.js", "servers/BaseServer.js"]) {
  await appendFile(
    path.join(CJS_DIR, entry),
    "module.exports = exports.default;\nmodule.exports.default = exports.default;\n",
  );
}
