import { describe, it } from "node:test";
import { expect } from "expect";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import config from "../fixtures/simple-config/webpack.config.js";

async function createServer(options) {
  const server = new Server(options, webpack(config));

  await server.normalizeOptions();

  return server;
}

const host = { host: "localhost:8080" };

describe("allowedOrigins", () => {
  // TODO in the next major release remove, with "auto", and expect `[]`
  // (the page's own origin only) as the default.
  describe('"auto", the default', () => {
    // Exactly the rules `allowedHosts` has always implied, so leaving the
    // option out changes nothing.
    it("allows the page's own hostname, on any port and loopback alias", async () => {
      const server = await createServer({});

      expect(server.options.allowedOrigins).toBe("auto");

      for (const origin of [
        "http://localhost:8080",
        "http://localhost:3000",
        "http://127.0.0.1:8080",
        "http://[::1]:8080",
        "file:///tmp/index.html",
        "chrome-extension://abcdef",
      ]) {
        expect(server.isOriginAllowed({ ...host, origin })).toBe(true);
      }

      for (const origin of ["http://evil.example.com", "null", undefined]) {
        expect(server.isOriginAllowed({ ...host, origin })).toBe(false);
      }
    });

    it('still lets every origin through with `allowedHosts: "all"`', async () => {
      const server = await createServer({ allowedHosts: "all" });

      expect(
        server.isOriginAllowed({ ...host, origin: "https://evil.example.com" }),
      ).toBe(true);
    });

    it("still allows the origins `allowedHosts` lists", async () => {
      const server = await createServer({ allowedHosts: [".example.com"] });

      expect(
        server.isOriginAllowed({
          host: "dev.example.com:8080",
          origin: "https://app.example.com",
        }),
      ).toBe(true);
    });

    it('takes "auto" given explicitly, alone or from the CLI, the same way', async () => {
      for (const allowedOrigins of ["auto", ["auto"]]) {
        const server = await createServer({
          allowedHosts: "all",
          allowedOrigins,
        });

        expect(server.options.allowedOrigins).toBe("auto");
        expect(
          server.isOriginAllowed({ ...host, origin: "https://evil.example" }),
        ).toBe(true);
      }
    });
  });

  describe("a list", () => {
    it("allows the page's own origin and the listed ones, whatever `allowedHosts` says", async () => {
      const server = await createServer({
        allowedHosts: "all",
        allowedOrigins: ["https://app.example.com:3000"],
      });

      for (const origin of [
        "https://app.example.com:3000",
        "http://localhost:8080",
        "http://localhost:3000",
        "http://127.0.0.1:8080",
        "file:///tmp/index.html",
        "chrome-extension://abcdef",
      ]) {
        expect(server.isOriginAllowed({ ...host, origin })).toBe(true);
      }

      for (const origin of [
        "http://app.example.com:3000",
        "https://app.example.com:3001",
        "https://app.example.com.evil.test:3000",
        "https://sub.app.example.com:3000",
        "https://evil.example.com",
        "null",
        "",
        undefined,
      ]) {
        expect(server.isOriginAllowed({ ...host, origin })).toBe(false);
      }
    });

    it("no longer allows the origins `allowedHosts` lists", async () => {
      const server = await createServer({
        allowedHosts: [".example.com"],
        allowedOrigins: [],
      });

      expect(server.options.allowedOrigins).toEqual([]);
      expect(
        server.isOriginAllowed({
          host: "dev.example.com:8080",
          origin: "https://app.example.com",
        }),
      ).toBe(false);
      expect(
        server.isOriginAllowed({
          host: "dev.example.com:8080",
          origin: "https://dev.example.com",
        }),
      ).toBe(true);
    });

    it("serializes each entry and drops an 'auto' among them", async () => {
      const server = await createServer({
        allowedOrigins: ["auto", "https://EXAMPLE.com:443/", "http://[::1]:80"],
      });

      expect(server.options.allowedOrigins).toEqual([
        "https://example.com",
        "http://[::1]",
      ]);
    });

    it("refuses an entry that is not an origin", async () => {
      await expect(
        createServer({ allowedOrigins: ["https://example.com/path"] }),
      ).rejects.toThrow("Invalid options object");
      await expect(
        createServer({ allowedOrigins: ["https://example.com:99999"] }),
      ).rejects.toThrow("Invalid URL");
    });

    it("allows nothing it cannot compare with a Host", async () => {
      const server = await createServer({ allowedOrigins: [] });

      expect(server.isOriginAllowed({ origin: "http://localhost:8080" })).toBe(
        false,
      );
    });

    it("does not trust forwarded headers", async () => {
      const server = await createServer({ allowedOrigins: [] });

      expect(
        server.isOriginAllowed({
          ...host,
          origin: "https://evil.example.com",
          "x-forwarded-host": "evil.example.com",
        }),
      ).toBe(false);
    });
  });

  describe('"all"', () => {
    it("allows every origin and keeps the `Host` check", async () => {
      const server = await createServer({ allowedOrigins: "all" });

      expect(
        server.isOriginAllowed({ ...host, origin: "https://example.com" }),
      ).toBe(true);
      expect(server.isValidHost({ host: "evil.example.com" }, "host")).toBe(
        false,
      );
    });

    it("wins over a list it appears in", async () => {
      const server = await createServer({
        allowedOrigins: ["https://example.com", "all"],
      });

      expect(server.options.allowedOrigins).toBe("all");
    });
  });
});
