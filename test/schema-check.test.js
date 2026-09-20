import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { expect } from "expect";
import webpack from "webpack";
import Server from "../lib/Server.js";
import validateOptions from "../lib/options.check.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// `validate-options.test.js` drives the whole option corpus through
// `new Server()`, which catches a validator that wrongly *accepts* invalid
// options. It cannot see one that wrongly *rejects* valid options: `Server`
// falls back to `schema-utils`, which accepts them, so every test still
// passes while the startup cost this validator exists to avoid comes back.
// These assertions are what notices that.
describe("precompiled options validator", () => {
  const valid = [
    ["empty options", {}],
    ["port as a number", { port: 8080 }],
    ["port as a string", { port: "8080" }],
    ['port as "auto"', { port: "auto" }],
    ["host", { host: "localhost" }],
    ["hot", { hot: true }],
    ['hot as "only"', { hot: "only" }],
    ["static as a string", { static: "/tmp" }],
    ["static as an array", { static: [{ directory: "/tmp" }, "/other"] }],
    ["overlay as an object", { client: { overlay: { errors: true } } }],
    ["a function option", { setupMiddlewares: (middlewares) => middlewares }],
    [
      "a Buffer option",
      { server: { type: "https", options: { key: Buffer.from("k") } } },
    ],
    ["headers as an array", { headers: [{ key: "a", value: "b" }] }],
    ["proxy", { proxy: [{ context: ["/api"], target: "http://example.com" }] }],
    [
      "watchFiles",
      { watchFiles: { paths: "src/**", options: { usePolling: true } } },
    ],
    ["allowedHosts as an array", { allowedHosts: ["example.com"] }],
  ];

  for (const [name, options] of valid) {
    it(`should accept ${name} without falling back`, () => {
      expect(validateOptions(options)).toBe(true);
    });
  }

  const invalid = [
    ["an unknown top-level property", { unknownOption: true }],
    ["an unknown nested property", { client: { unknownOption: true } }],
    ["a wrongly typed option", { port: {} }],
    ["a value outside an enum", { client: { logging: "whoops!" } }],
    ["an empty string where one is required", { host: "" }],
    ["an empty string in an array", { allowedHosts: [""] }],
    ["a non-function where a function is required", { setupMiddlewares: "x" }],
    ["null", { port: null }],
  ];

  for (const [name, options] of invalid) {
    it(`should reject ${name}`, () => {
      expect(validateOptions(options)).toBe(false);
    });
  }
});

// `Server` validates through the compiler that owns the dev server, and
// `compiler.validate` honours that compiler's own `validate` option. Asking any
// other child of a `MultiCompiler` would read a policy that was never about
// these options, and a child opting out would silently take dev server
// validation with it.
describe("options validation routing", () => {
  const config = (extra) => ({
    mode: "development",
    context: __dirname,
    entry: "./fixtures/simple-config/foo.js",
    infrastructureLogging: { level: "none" },
    stats: "none",
    ...extra,
  });

  // Each compiler holds a file-system cache and its purge timer, and this suite
  // runs alongside the slow browser ones, so they are closed rather than left
  // to the end of the process.
  const multiCompiler = (t, ...configs) => {
    const compiler = webpack(configs.map((extra) => config(extra)));

    t.after(
      () =>
        new Promise((resolve) => {
          compiler.close(resolve);
        }),
    );

    return compiler;
  };

  it("should validate against the child owning the dev server, not the first", (t) => {
    const compiler = multiCompiler(
      t,
      { name: "a", validate: false },
      { name: "b", devServer: { port: 9001 } },
    );

    expect(() => new Server({ unknownOption: true }, compiler)).toThrow(
      /Dev Server/,
    );
  });

  it("should fall back to the child targeting the web", (t) => {
    const compiler = multiCompiler(
      t,
      { name: "a", target: "node", validate: false },
      { name: "b", target: "web" },
    );

    expect(() => new Server({ unknownOption: true }, compiler)).toThrow(
      /Dev Server/,
    );
  });

  it("should fall back to the first child when none matches", (t) => {
    // Neither names `devServer` nor targets the web, so there is nothing to
    // prefer and the first child stands in.
    const compiler = multiCompiler(
      t,
      { name: "a", target: "node" },
      { name: "b", target: "node" },
    );

    expect(new Server({}, compiler).getCompilerOptions().name).toBe("a");
  });

  it("should validate on apply() when constructed as a plugin", (t) => {
    // Used as a plugin the server is constructed without a compiler, so there
    // is nothing to validate against until `apply()` brings one.
    const compiler = multiCompiler(t, { name: "a" });
    const server = new Server({ unknownOption: true });

    expect(() => server.apply(compiler)).toThrow(/Dev Server/);
  });

  it("should honour the owning compiler's validate option on apply()", (t) => {
    const compiler = multiCompiler(t, { name: "a", validate: false });
    const server = new Server({ unknownOption: true });

    expect(() => server.apply(compiler)).not.toThrow();
  });

  it("should pick the same child for the compiler options it reads", (t) => {
    const compiler = multiCompiler(
      t,
      { name: "a", validate: false },
      { name: "b", devServer: { port: 9001 } },
    );

    expect(new Server({}, compiler).getCompilerOptions().name).toBe("b");
  });
});
