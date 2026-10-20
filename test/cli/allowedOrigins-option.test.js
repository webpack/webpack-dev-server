import { describe, it } from "node:test";
import { expect } from "expect";
import { testBin } from "../helpers/test-bin.js";
import portsMap from "../ports-map.js";

const port = portsMap["cli-allowed-origins"];

describe('"allowedOrigins" CLI option', () => {
  for (const origins of [
    ["auto"],
    ["all"],
    ["https://example.com"],
    ["http://localhost:3000", "https://example.com"],
  ]) {
    it(`should accept ${origins.join(", ")}`, async () => {
      const { exitCode, stderr } = await testBin([
        "--port",
        port,
        ...origins.flatMap((origin) => ["--allowed-origins", origin]),
      ]);

      expect(exitCode).toBe(0);
      expect(stderr).toContain("Content not from webpack is served");
    });
  }
});
