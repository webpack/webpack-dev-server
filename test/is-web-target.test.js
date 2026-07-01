import { describe, it } from "node:test";
import { expect } from "expect";
import webpack from "webpack";
import Server from "../lib/Server.js";

// The `"universal"` target string only exists since webpack `5.108.0`, but
// `peerDependencies` still allows `^5.101.0`, so that single case is skipped
// when running against an older webpack.
const [major, minor] = webpack.version.split(".").map(Number);
const supportsUniversalTarget = major > 5 || (major === 5 && minor >= 108);

const compile = (target) =>
  webpack({
    target,
    entry: "./lib/Server.js",
    // A combined web + node target has no default chunk format
    output: { path: "/", chunkFormat: "array-push" },
  });

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
    // Combined web + node ("universal") targets, the bundle can run in a
    // browser so the client must be injected
    { target: ["web", "node"], expected: true },
    { target: ["web", "node", "webworker"], expected: true },
    // Non-web targets
    { target: "node", expected: false },
    { target: "async-node", expected: false },
    { target: "electron-main", expected: false },
    { target: ["node", "async-node"], expected: false },
    // `target: false` leaves every platform property `null`, but it must not be
    // treated as a web target
    { target: false, expected: false },
  ];

  for (const { target, expected } of cases) {
    it(`should return ${expected} for ${JSON.stringify(target)} target`, () => {
      expect(Server.isWebTarget(compile(target))).toBe(expected);
    });
  }

  it(
    'should return true for "universal" target',
    {
      skip: supportsUniversalTarget
        ? false
        : `requires webpack >= 5.108.0 (running ${webpack.version})`,
    },
    () => {
      expect(Server.isWebTarget(compile("universal"))).toBe(true);
    },
  );
});
