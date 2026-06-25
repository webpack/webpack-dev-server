import { describe, it } from "node:test";
import { expect } from "expect";
import webpack from "webpack";
import Server from "../lib/Server.js";

// `compiler.platform.universal` and the `"universal"` target only exist since
// webpack `5.108.0`, but `peerDependencies` still allows `^5.101.0`, so the
// universal cases are skipped when running against an older webpack.
const [major, minor] = webpack.version.split(".").map(Number);
const supportsUniversalTarget = major > 5 || (major === 5 && minor >= 108);

describe("Server.isWebTarget", () => {
  const cases = [
    // Web targets
    { target: "web", expected: true },
    { target: "webworker", expected: true },
    { target: "browserslist:defaults", expected: true },
    { target: "electron-preload", expected: true },
    { target: "electron-renderer", expected: true },
    { target: "nwjs", expected: true },
    { target: "node-webkit", expected: true },
    // Non-web targets
    { target: "node", expected: false },
    { target: "async-node", expected: false },
    { target: "electron-main", expected: false },
  ];

  for (const { target, expected } of cases) {
    it(`should return ${expected} for ${JSON.stringify(target)} target`, () => {
      const compiler = webpack({
        target,
        entry: "./lib/Server.js",
        output: { path: "/" },
      });

      expect(Server.isWebTarget(compiler)).toBe(expected);
    });
  }

  // `universal` is `true` for these targets, they should be treated as web
  // targets so the client is injected.
  const universalCases = [
    { target: "universal" },
    { target: ["web", "node"] },
    // Order does not matter, a combined web + node target is universal
    { target: ["node", "web"] },
  ];

  for (const { target } of universalCases) {
    it(
      `should return true for ${JSON.stringify(target)} target`,
      {
        skip: supportsUniversalTarget
          ? false
          : `requires webpack >= 5.108.0 (running ${webpack.version})`,
      },
      () => {
        const compiler = webpack({
          target,
          entry: "./lib/Server.js",
          output: { path: "/" },
        });

        expect(Server.isWebTarget(compiler)).toBe(true);
      },
    );
  }
});
