import { EventEmitter } from "node:events";
import { createRequire } from "node:module";
import { describe, it } from "node:test";
import { expect } from "expect";
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import hotOptions, {
  applyMode,
  bridge,
  clientOverlay,
  clientPath,
  problemFilter,
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
    it("keeps this server's element id, opens files through its own route, and names its Trusted Types policy", () => {
      expect(clientOverlay(true)).toEqual({
        id: "webpack-dev-server-client-overlay",
        openEditorEndpoint: "/webpack-dev-server/open-editor",
        trustedTypesPolicyName: "webpack-dev-server#overlay",
      });
    });

    it("keeps a Trusted Types policy name of the user's own", () => {
      expect(
        clientOverlay({ trustedTypesPolicyName: "mine#overlay" })
          .trustedTypesPolicyName,
      ).toBe("mine#overlay");
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
        trustedTypesPolicyName: "webpack-dev-server#overlay",
        id: "webpack-dev-server-client-overlay",
      });
    });

    it("does not let a given id replace the one pages query", () => {
      expect(clientOverlay({ id: "other" })).toMatchObject({
        id: "webpack-dev-server-client-overlay",
      });
    });
  });

  // This server documents its filters as reading a problem object; the
  // middleware's overlay calls them with the problem's text.
  describe("an overlay filter for build problems", () => {
    /**
     * Rebuild a filter from what is sent to the browser, as the runtime does.
     * @param {(message: string) => boolean} filter the filter the middleware is handed
     * @returns {(message: string) => boolean} the filter the page runs
     */
    function inThePage(filter) {
      // eslint-disable-next-line no-new-func
      return new Function(
        "message",
        `var callback = ${filter.toString()}\nreturn callback(message)`,
      );
    }

    it("hands a filter written for this server an object with the message", () => {
      const filter = inThePage(
        problemFilter((error) => !error.message.includes("ignored")),
      );

      expect(filter("Module not found: ignored")).toBe(false);
      expect(filter("Module not found: shown")).toBe(true);
    });

    it("lets that object stand in for the text as well", () => {
      const filter = inThePage(
        problemFilter((error) => String(error).includes("shown")),
      );

      expect(filter("shown")).toBe(true);
    });

    it("wraps a method written in an object literal", () => {
      const overlay = {
        errors(error) {
          return error.message !== "drop";
        },
      };
      const filter = inThePage(problemFilter(overlay.errors));

      expect(filter("drop")).toBe(false);
      expect(filter("keep")).toBe(true);
    });

    it("works in node the same way", () => {
      expect(problemFilter((error) => error.message === "x")("x")).toBe(true);
    });

    it("leaves a boolean alone", () => {
      expect(problemFilter(false)).toBe(false);
    });

    it("leaves runtimeErrors alone, which were always handed an Error", () => {
      const runtimeErrors = (error) => error.message !== "x";

      expect(clientOverlay({ runtimeErrors }).runtimeErrors).toBe(
        runtimeErrors,
      );
    });

    it("wraps both problem filters given in client.overlay", () => {
      const errors = (error) => error.message !== "a";
      const warnings = (warning) => warning.message !== "b";
      const overlay = clientOverlay({ errors, warnings });

      expect(overlay.errors).not.toBe(errors);
      expect(overlay.warnings).not.toBe(warnings);
      expect(inThePage(overlay.errors)("a")).toBe(false);
      expect(inThePage(overlay.warnings)("b")).toBe(false);
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

    it("keeps the endpoint and the plugin, but no runtime, when there is no client", () => {
      const result = hotOptions({
        devServerOptions: serverOptions({ client: false }),
        isTlsServer: false,
      });

      expect(result.client).toBe(false);
      expect(result.inject).toBeUndefined();
    });

    it("adds nothing at all with no client and no hot", () => {
      const result = hotOptions({
        devServerOptions: serverOptions({ client: false, hot: false }),
        isTlsServer: false,
      });

      expect(result.inject).toBe(false);
    });

    it("shows no progress unless asked to", () => {
      expect(
        hotOptions({ devServerOptions: serverOptions(), isTlsServer: false })
          .client.progress,
      ).toBe(false);
      expect(
        hotOptions({
          devServerOptions: serverOptions({
            client: { overlay: true, progress: "linear" },
          }),
          isTlsServer: false,
        }).client.progress,
      ).toBe("linear");
    });

    it("pings a WebSocket client every second, as this server's socket did", () => {
      expect(
        hotOptions({ devServerOptions: serverOptions(), isTlsServer: false })
          .heartbeat,
      ).toBe(1000);
    });

    it("hands the rest of webSocketServer.options to the ws server", () => {
      const verifyClient = () => true;
      const result = hotOptions({
        devServerOptions: serverOptions({
          webSocketServer: {
            type: "ws",
            options: {
              path: "/custom",
              host: "127.0.0.1",
              port: 8081,
              perMessageDeflate: true,
              verifyClient,
            },
          },
        }),
        isTlsServer: false,
      });

      expect(result.path).toBe("/custom");
      expect(result.ws).toEqual({
        host: "127.0.0.1",
        port: 8081,
        perMessageDeflate: true,
        verifyClient,
      });
    });

    it("hands no ws options over the event stream", () => {
      const result = hotOptions({
        devServerOptions: serverOptions({
          webSocketServer: {
            type: "sse",
            options: { perMessageDeflate: true },
          },
        }),
        isTlsServer: false,
      });

      expect(result.ws).toBeUndefined();
    });

    it("hands a client transport of someone else's to the runtime", () => {
      const { client } = hotOptions({
        devServerOptions: serverOptions(),
        isTlsServer: false,
        clientTransport: "/abs/path/CustomClient.js",
      });

      expect(client.transport).toBe("/abs/path/CustomClient.js");
    });

    it("labels the console and names the page-url parameters after this package", () => {
      const { client } = hotOptions({
        devServerOptions: serverOptions({
          client: { overlay: true, logging: "warn" },
        }),
        isTlsServer: false,
      });

      expect(client.pageParamPrefix).toBe("webpack-dev-server");
      expect(client.logging).toEqual({
        name: "webpack-dev-server",
        level: "warn",
      });
    });

    it("connects the page where this server's own query would have", () => {
      const { client } = hotOptions({
        devServerOptions: serverOptions(),
        isTlsServer: false,
      });

      expect(client.url).toEqual({
        protocol: "ws:",
        hostname: "0.0.0.0",
        port: 8080,
        pathname: "/ws",
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

  // `webSocketServer` naming an implementation of this server's own, wrapped
  // into the transport shape the middleware asks for.
  describe("a BaseServer implementation as a transport", () => {
    /**
     * @returns {{ implementation: EventEmitter, clients: { readyState: number, sent: string[], send: (data: string) => void }[] }} an implementation
     */
    function implementation() {
      // An emitter, as `ws`'s server is.
      // eslint-disable-next-line unicorn/prefer-event-target
      return { implementation: new EventEmitter(), clients: [] };
    }

    /**
     * @param {number} readyState the client's state
     * @returns {{ readyState: number, sent: string[], send: (data: string) => void }} a client
     */
    function client(readyState = 1) {
      const sent = [];

      return { readyState, sent, send: (data) => sent.push(data) };
    }

    it("hands each client that joins, and its request, to onConnect", () => {
      const instance = implementation();
      const transport = bridge(instance);
      const joined = [];

      transport.onConnect((who, req) => joined.push([who, req]));
      instance.implementation.emit("connection", "a", { url: "/ws" });

      expect(joined).toEqual([["a", { url: "/ws" }]]);
    });

    it("publishes to every open client, and only those", () => {
      const instance = implementation();
      const open = client();
      const closing = client(2);

      instance.clients.push(open, closing);
      bridge(instance).publish({ action: "built" });

      expect(open.sent).toEqual([JSON.stringify({ action: "built" })]);
      expect(closing.sent).toEqual([]);
    });

    it("says whether anyone is listening", () => {
      const instance = implementation();
      const transport = bridge(instance);

      expect(transport.hasClients()).toBe(false);

      instance.clients.push(client());

      expect(transport.hasClients()).toBe(true);
    });
  });

  // What this file builds is handed to the middleware, which validates it
  // against its own schema. Built here from every shape a configuration can
  // give it, so a name renamed on either side fails in this test rather than
  // in a project's dev server.
  describe("is accepted by webpack-dev-middleware", () => {
    const require = createRequire(import.meta.url);
    const shapes = [
      ["the defaults", {}],
      ["no client", { client: false }],
      ["hot only", { hot: "only" }],
      ["live reload only", { hot: false }],
      ["neither", { hot: false, liveReload: false }],
      ["Server-Sent Events", { webSocketServer: { type: "sse", options: {} } }],
      [
        "a socket url as a string",
        { client: { webSocketURL: "wss://dev.example.com:8443/ws" } },
      ],
      [
        "a socket url in parts",
        { client: { webSocketURL: { hostname: "dev.example.com", port: 0 } } },
      ],
      [
        "every client option",
        {
          client: {
            logging: "verbose",
            overlay: {
              errors: (error) => !error.message.includes("ignored"),
              warnings: false,
              runtimeErrors: true,
            },
            progress: true,
            reconnect: 3,
          },
        },
      ],
      [
        "a port of its own",
        { webSocketServer: { type: "ws", options: { port: 0 } } },
      ],
    ];

    for (const [title, overrides] of shapes) {
      it(`for ${title}`, async () => {
        const hot = hotOptions({
          devServerOptions: serverOptions(overrides),
          isTlsServer: false,
          clientTransport:
            title === "the defaults"
              ? undefined
              : require.resolve("../client/clients/WebSocketClient.js"),
        });
        const compiler = webpack({
          mode: "development",
          entry: require.resolve("./fixtures/client-config/foo.js"),
          infrastructureLogging: { level: "none" },
          stats: "none",
        });
        let instance;

        try {
          // Throws on an option the schema does not take.
          instance = webpackDevMiddleware(compiler, { hot });

          await new Promise((resolve) => {
            instance.waitUntilValid(resolve);
          });

          expect(
            instance.context.stats.toJson({ all: false, errors: true }).errors,
          ).toEqual([]);
        } finally {
          await new Promise((resolve) => {
            if (instance) {
              instance.close(resolve);
            } else {
              compiler.close(resolve);
            }
          });
        }
      });
    }
  });
});
