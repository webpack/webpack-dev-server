import { describe, it } from "node:test";
import { expect } from "expect";
import validateOptions from "../lib/options.check.js";

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
