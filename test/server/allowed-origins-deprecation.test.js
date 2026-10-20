import { describe, it } from "node:test";
import { expect } from "expect";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import config from "../fixtures/simple-config/webpack.config.js";

// TODO in the next major release remove this file, with the deprecations.
//
// `util.deprecate` warns once per process, so every case that must not warn
// runs before the ones that do.
describe("the origins `allowedHosts` and `headers` still grant", () => {
  /** @type {string[]} */
  const warnings = [];

  process.on("warning", (warning) => {
    warnings.push(warning.message);
  });

  async function normalize(options) {
    const server = new Server(options, webpack(config));

    await server.normalizeOptions();
    // Warnings are emitted on the next tick.
    await new Promise((resolve) => {
      setImmediate(resolve);
    });
  }

  it("are not deprecated once `allowedOrigins` is set", async () => {
    await normalize({ allowedHosts: "all", allowedOrigins: "all" });
    await normalize({
      allowedOrigins: ["https://example.com"],
      headers: { "Access-Control-Allow-Origin": "*" },
    });

    expect(warnings).toEqual([]);
  });

  it('are deprecated with `allowedHosts: "all"`', async () => {
    await normalize({ allowedHosts: "all" });

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("'allowedOrigins: \"all\"'");
  });

  it("are deprecated with an `Access-Control-Allow-Origin: *` header", async () => {
    await normalize({ headers: { "Access-Control-Allow-Origin": "*" } });

    expect(warnings).toHaveLength(2);
    expect(warnings[1]).toContain("Cross-Origin-Resource-Policy");
  });
});
