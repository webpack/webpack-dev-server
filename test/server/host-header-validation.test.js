import path from "node:path";
import { after, before, beforeEach, describe, it, mock } from "node:test";
import { expect } from "expect";
import { fn } from "jest-mock";
import request from "supertest";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import config from "../fixtures/simple-config/webpack.config.js";
import portsMap from "../ports-map.js";

const port = portsMap["host-header-validation"];
const allowedHostsOptions = ["auto", ["trusted.example"], "all"];
const invalidHosts = [
  "file:invalid",
  "chrome-extension:invalid",
  "moz-extension:invalid",
  "localhost:invalid",
  "localhost:65536",
  "http://localhost",
  "//localhost",
  "user@localhost",
  "localhost/path",
  "localhost\\path",
  "localhost?query",
  "localhost#fragment",
  " localhost",
  "localhost ",
];

describe("Host header validation", () => {
  for (const allowedHosts of allowedHostsOptions) {
    describe(`with allowedHosts ${JSON.stringify(allowedHosts)}`, () => {
      const server = new Server({ allowedHosts });

      for (const headerName of ["host", ":authority"]) {
        for (const value of invalidHosts) {
          it(`should reject ${headerName} ${JSON.stringify(value)}`, () => {
            expect(
              server.isValidHost({ [headerName]: value }, headerName),
            ).toBe(false);
          });
        }

        for (const value of [
          "localhost",
          "localhost:8080",
          "127.0.0.1:8080",
          "[::1]:8080",
        ]) {
          it(`should accept ${headerName} ${value}`, () => {
            expect(
              server.isValidHost({ [headerName]: value }, headerName),
            ).toBe(true);
          });
        }
      }
    });
  }

  it("should check hosts named file or chrome-extension against allowedHosts", () => {
    for (const host of ["file", "chrome-extension"]) {
      expect(
        new Server({ allowedHosts: "auto" }).isValidHost(
          { host: `${host}:80` },
          "host",
        ),
      ).toBe(false);
      expect(
        new Server({ allowedHosts: [host] }).isValidHost(
          { host: `${host}:80` },
          "host",
        ),
      ).toBe(true);
    }
  });

  it("should not treat a Host with an Origin protocol as same-origin", () => {
    const server = new Server({ allowedHosts: "auto" });

    for (const host of [
      "file:invalid",
      "chrome-extension:invalid",
      "file:80",
    ]) {
      expect(server.isSameOrigin({ host, origin: "http://example.com" })).toBe(
        false,
      );
    }
  });
});

describe("Origin header validation", () => {
  for (const allowedHosts of allowedHostsOptions) {
    describe(`with allowedHosts ${JSON.stringify(allowedHosts)}`, () => {
      const server = new Server({ allowedHosts });

      for (const origin of [
        "file:///index.html",
        "chrome-extension://extension-id",
        "moz-extension://extension-id",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://[::1]:8080",
      ]) {
        it(`should still accept Origin ${origin}`, () => {
          expect(server.isValidHost({ origin }, "origin")).toBe(true);
        });
      }

      for (const origin of [
        undefined,
        "null",
        "http://localhost:invalid",
        "http://untrusted.example",
      ]) {
        it(`should accept Origin ${origin} only when allowedHosts is all`, () => {
          expect(server.isValidHost({ origin }, "origin")).toBe(
            allowedHosts === "all",
          );
        });
      }

      it("should honor the configured allowed hostname for Origin", () => {
        expect(
          server.isValidHost(
            { origin: "http://trusted.example:8080" },
            "origin",
          ),
        ).toBe(allowedHosts !== "auto");
      });
    });
  }
});

describe("Open editor URL handling", () => {
  const launchEditor = fn();
  let launchEditorMock;

  before(() => {
    launchEditorMock = mock.module("launch-editor", {
      defaultExport: launchEditor,
    });
  });

  after(() => {
    launchEditorMock.restore();
  });

  beforeEach(() => {
    launchEditor.mockClear();
  });

  for (const allowedHosts of allowedHostsOptions) {
    describe(`with allowedHosts ${JSON.stringify(allowedHosts)}`, () => {
      const server = new Server({ allowedHosts, port }, webpack(config));

      before(async () => {
        await server.start();
      });

      after(async () => {
        await server.stop();
      });

      for (const host of ["file:invalid", "chrome-extension:invalid"]) {
        for (const route of ["/webpack-dev-server/open-editor", "/main.js"]) {
          it(`should reject Host ${host} on ${route} without exposing a stack trace`, async () => {
            const response = await request(server.app)
              .get(route)
              .set("Host", host);

            expect(response.status).toBe(403);
            expect(response.text).toBe("Invalid Host header");
            expect(launchEditor).not.toHaveBeenCalled();
          });
        }
      }

      it("should reject malformed request URLs without exposing a stack trace", async () => {
        const response = await request(server.app)
          .get("/webpack-dev-server/open-editor//[")
          .set("Host", "localhost");

        expect(response.status).toBe(400);
        expect(response.text).toBe("Invalid URL");
        expect(launchEditor).not.toHaveBeenCalled();
      });

      it("should still open the requested file relative to the compiler context", async () => {
        const fileName = "./src/file with spaces.js:3:7";
        const response = await request(server.app)
          .get("/webpack-dev-server/open-editor")
          .query({ fileName })
          .set("Host", "localhost");

        expect(response.status).toBe(200);
        expect(launchEditor).toHaveBeenCalledTimes(1);
        expect(launchEditor).toHaveBeenCalledWith(
          path.resolve(config.context, fileName),
        );
      });
    });
  }
});
