import { describe, it } from "node:test";
import { expect } from "expect";
import hotOptions, {
  applyMode,
  clientOverlay,
  clientPath,
} from "../lib/hotOptions.js";

/**
 * @param {Record<string, unknown>=} overrides what to change from a default server
 * @returns {Record<string, unknown>} the options of a started server
 */
function serverOptions(overrides = {}) {
  return {
    client: { overlay: true },
    hot: true,
    liveReload: true,
    webSocketServer: { type: "ws", options: {} },
    host: undefined,
    port: 8080,
    ...overrides,
  };
}

describe("hot options", () => {
  describe("what a build does to the page", () => {
    const cases = [
      [true, true, "hmr"],
      [true, false, "hmr"],
      ["only", true, "hmr-only"],
      ["only", false, "hmr-only"],
      [false, true, "reload"],
      [false, false, "nothing"],
      [undefined, undefined, "nothing"],
    ];

    for (const [hot, liveReload, expected] of cases) {
      it(`hot ${JSON.stringify(hot)} with liveReload ${JSON.stringify(liveReload)} is ${expected}`, () => {
        expect(applyMode(hot, liveReload)).toBe(expected);
      });
    }
  });

  describe("the overlay", () => {
    it("keeps this server's element id, and opens files through its own route", () => {
      expect(clientOverlay(true)).toEqual({
        id: "webpack-dev-server-client-overlay",
        openEditorEndpoint: "/webpack-dev-server/open-editor",
      });
    });

    it("leaves what was turned off turned off", () => {
      expect(clientOverlay(false)).toBe(false);
    });

    it("keeps the settings that were given and a route of the user's own", () => {
      expect(
        clientOverlay({ errors: true, openEditorEndpoint: "/mine" }),
      ).toEqual({
        errors: true,
        openEditorEndpoint: "/mine",
        id: "webpack-dev-server-client-overlay",
      });
    });

    it("does not let a given id replace the one pages query", () => {
      expect(clientOverlay({ id: "other" })).toMatchObject({
        id: "webpack-dev-server-client-overlay",
      });
    });
  });

  describe("where the page connects", () => {
    const base = {
      client: {},
      webSocketServerOptions: {},
      host: undefined,
      port: 8080,
      isTlsServer: false,
      path: "/ws",
    };

    it("says only what this server knows, and leaves the rest to the page", () => {
      expect(clientPath(base)).toEqual({
        protocol: "ws:",
        hostname: "0.0.0.0",
        port: 8080,
        pathname: "/ws",
      });
    });

    it("speaks TLS when the server does", () => {
      expect(clientPath({ ...base, isTlsServer: true }).protocol).toBe("wss:");
    });

    it("sends a port the server has not picked as 0, for the page to resolve", () => {
      expect(clientPath({ ...base, port: "auto" }).port).toBe("0");
    });

    // A `webSocketURL` given as a string is parsed, which fills every part in
    // with "" for the ones it did not carry — and an empty one is not a value.
    it("skips the parts of a webSocketURL that were left empty", () => {
      const spec = clientPath({
        ...base,
        client: {
          webSocketURL: { hostname: "example.test", port: "", pathname: "" },
        },
      });

      expect(spec.hostname).toBe("example.test");
      expect(spec.port).toBe(8080);
      expect(spec.pathname).toBe("/ws");
    });
  });

  describe("the middleware's hot option", () => {
    it("is off when there is no socket", () => {
      expect(
        hotOptions({
          devServerOptions: serverOptions({ webSocketServer: false }),
          isTlsServer: false,
        }),
      ).toBe(false);
    });

    it("leaves every policy to this server", () => {
      const result = hotOptions({
        devServerOptions: serverOptions(),
        isTlsServer: false,
      });

      expect(result.cors).toBe(true);
      expect(result.token).toBe(false);
    });

    it("keeps the endpoint but injects nothing when there is no client", () => {
      const result = hotOptions({
        devServerOptions: serverOptions({ client: false }),
        isTlsServer: false,
      });

      expect(result.inject).toBe(false);
      expect(result.client).toBeUndefined();
    });

    it("labels the console and names the page-url parameters after this package", () => {
      const { client } = hotOptions({
        devServerOptions: serverOptions({
          client: { overlay: true, logging: "warn" },
        }),
        isTlsServer: false,
      });

      expect(client.urlPrefix).toBe("webpack-dev-server");
      expect(client.logging).toEqual({
        name: "webpack-dev-server",
        level: "warn",
      });
    });

    it("chooses the event stream when that is the endpoint served", () => {
      const result = hotOptions({
        devServerOptions: serverOptions({
          webSocketServer: { type: "sse", options: {} },
        }),
        isTlsServer: false,
      });

      expect(result.transport).toBe("sse");
      expect(result.client.transport).toBe("sse");
    });

    it("hands endless reconnection over as it was written", () => {
      const { client } = hotOptions({
        devServerOptions: serverOptions({
          client: { overlay: true, reconnect: Infinity },
        }),
        isTlsServer: false,
      });

      expect(client.connect).toEqual({ retries: Infinity });
    });

    it("applies the mode its hot and liveReload options mean", () => {
      const { client } = hotOptions({
        devServerOptions: serverOptions({ hot: false, liveReload: true }),
        isTlsServer: false,
      });

      expect(client.apply).toBe("reload");
    });
  });
});
