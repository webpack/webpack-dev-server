import { describe, it } from "node:test";
import { expect } from "expect";
import Server from "../../lib/Server.js";

describe("origin authorization", () => {
  for (const options of [
    {},
    { allowedHosts: "auto" },
    { allowedHosts: "all" },
    { allowedHosts: ["localhost", "192.168.1.2", ".example.com"] },
    { client: { webSocketURL: { hostname: "localhost" } } },
  ]) {
    it(`should enforce origin checks with ${JSON.stringify(options)}`, () => {
      const server = new Server(options);
      const headers = { host: "localhost:8080" };

      expect(
        server.isOriginAllowed({ ...headers, origin: "http://localhost:8080" }),
      ).toBe(true);

      for (const origin of [
        "http://192.168.1.2",
        "http://evil.example.com",
        "http://localhost:8081",
        "https://localhost:8080",
        "http://127.0.0.1:8080",
        "http://[::1]:8080",
        "null",
        "file:///tmp/index.html",
        "chrome-extension://example",
        "http://localhost:8080/path",
        "http://localhost:8080?query",
        "http://localhost:8080#fragment",
        "http://user@localhost:8080",
        "http://localhost:8080 http://evil.example.com",
        "http://localhost:8080\\evil",
        "http://localhost:8080/",
        "",
        undefined,
      ]) {
        expect(server.isOriginAllowed({ ...headers, origin })).toBe(false);
      }
    });
  }

  it("should allow an explicit origin without adding it to allowedHosts", () => {
    const server = new Server({
      allowedHosts: ["dev.example.com"],
      allowedOrigins: ["https://app.example.com:3000"],
    });

    expect(
      server.isOriginAllowed({
        host: "dev.example.com:8080",
        origin: "https://app.example.com:3000",
      }),
    ).toBe(true);
    expect(server.isValidHost({ host: "app.example.com:3000" }, "host")).toBe(
      false,
    );

    for (const origin of [
      "http://app.example.com:3000",
      "https://app.example.com:3001",
      "https://app.example.com.evil.test:3000",
      "https://sub.app.example.com:3000",
    ]) {
      expect(
        server.isOriginAllowed({ host: "dev.example.com:8080", origin }),
      ).toBe(false);
    }
  });

  it("should compare HTTPS and HTTP/2 origins and normalize default ports", () => {
    for (const type of ["https", "http2"]) {
      const server = new Server({ server: { type } });
      server.isTlsServer = true;

      expect(
        server.isOriginAllowed({
          host: "localhost:443",
          origin: "https://localhost",
        }),
      ).toBe(true);
      expect(
        server.isOriginAllowed({
          host: "localhost:443",
          origin: "http://localhost:443",
        }),
      ).toBe(false);
      expect(
        server.isOriginAllowed({
          ":authority": "[::1]:443",
          origin: "https://[::1]",
        }),
      ).toBe(true);
    }

    expect(
      new Server({}).isOriginAllowed({
        host: "localhost:80",
        origin: "http://localhost",
      }),
    ).toBe(true);
  });

  it("should not trust forwarded headers", () => {
    const server = new Server({});

    expect(
      server.isOriginAllowed({
        host: "localhost:8080",
        origin: "https://evil.example.com",
        "x-forwarded-host": "evil.example.com",
        "x-forwarded-proto": "https",
      }),
    ).toBe(false);
  });

  it("should disable only origin checks with allowedOrigins all", () => {
    const server = new Server({ allowedOrigins: "all" });

    expect(
      server.isOriginAllowed({
        host: "localhost",
        origin: "https://example.com",
      }),
    ).toBe(true);
    expect(server.isValidHost({ host: "evil.example.com" }, "host")).toBe(
      false,
    );
    expect(
      server.isSameOrigin({ host: "localhost", origin: "https://example.com" }),
    ).toBe(false);
  });
});
