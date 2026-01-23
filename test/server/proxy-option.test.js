"use strict";

const http = require("node:http");
const path = require("node:path");
const util = require("node:util");
const express = require("express");
const request = require("supertest");
const webpack = require("webpack");
const WebSocket = require("ws");
const Server = require("../../lib/Server");
const config = require("../fixtures/proxy-config/webpack.config");
const [port1, port2, port3, port4, port5] =
  require("../ports-map")["proxy-option"];

const WebSocketServer = WebSocket.Server;
const staticDirectory = path.resolve(__dirname, "../fixtures/proxy-config");

const proxyOptionPathsAsProperties = [
  {
    context: "/proxy1",
    target: `http://localhost:${port1}`,
  },
  {
    context: "/api/proxy2",
    target: `http://localhost:${port2}`,
    pathRewrite: { "^/api": "" },
  },
  {
    context: "/foo",
    bypass(req) {
      if (/\.html$/.test(req.path || req.url)) {
        return "/index.html";
      }

      return null;
    },
  },
  {
    context: "proxyfalse",
    bypass(req) {
      if (/\/proxyfalse$/.test(req.path || req.url)) {
        return false;
      }
    },
  },
  {
    context: "/proxy/async",
    bypass(req, res) {
      if (/\/proxy\/async$/.test(req.path || req.url)) {
        return new Promise((resolve) => {
          setTimeout(() => {
            res.end("proxy async response");
            resolve(true);
          }, 10);
        });
      }
    },
  },
  {
    context: "/bypass-with-target",
    target: `http://localhost:${port1}`,
    changeOrigin: true,
    secure: false,
    bypass(req) {
      if (/\.(html)$/i.test(req.path || req.url)) {
        return req.url;
      }
    },
  },
];

const proxyOption = [
  {
    context: () => true,
    target: `http://localhost:${port1}`,
  },
];

let maxServerListeners = 0;
const proxyOptionOfArray = [
  { context: "/proxy1", target: `http://localhost:${port1}` },
  function proxy(req, res, next) {
    if (req) {
      const socket = req.socket || req.connection;
      const server = socket ? socket.server : null;
      if (server) {
        maxServerListeners = Math.max(
          maxServerListeners,
          server.listeners("close").length,
        );
      }
    }
    return {
      context: "/api/proxy2",
      target: `http://localhost:${port2}`,
      pathRewrite: { "^/api": "" },
      bypass: () => {
        if (req) {
          const resolveUrl = new URL(req.url, `http://${req.headers.host}`);
          const params = new URLSearchParams(resolveUrl.search);
          const foo = params.get("foo");

          if (foo) {
            res.end(`foo+${next.name}+${typeof next}`);

            return false;
          }
        }
      },
    };
  },
];

const proxyOptionOfArrayWithoutTarget = [
  {
    router: () => `http://localhost:${port1}`,
  },
];

const proxyWithPath = [
  {
    context: "/proxy1",
    path: `http://localhost:${port1}`,
    target: `http://localhost:${port1}`,
  },
];

const proxyWithString = [
  {
    context: "/proxy1",
    target: `http://localhost:${port1}`,
  },
];

const proxyWithRouterAsObject = [
  {
    router: () => `http://localhost:${port1}`,
  },
];

describe("proxy option", () => {
  let proxyServer1;
  let proxyServer2;

  function getStderrOutput(stderrSpy) {
    return stderrSpy.mock.calls
      .map((call) => call[0])
      .filter((output) => !output.includes("DeprecationWarning"))
      .join("")
      .replaceAll(/127\.0\.0\.1:\d+/g, "127.0.0.1:<port>")
      .replaceAll(/\[ENOTFOUND\]|\[EAI_AGAIN\]/g, "[<DNS_ERROR>]");
  }

  function getConsoleErrorOutput(consoleSpy) {
    return consoleSpy.mock.calls
      .map((call) => call[0])
      .join("\n")
      .replaceAll(/127\.0\.0\.1:\d+/g, "127.0.0.1:<port>")
      .replaceAll(/\[ENOTFOUND\]|\[EAI_AGAIN\]/g, "[<DNS_ERROR>]");
  }

  async function listenProxyServers() {
    const proxyApp1 = express();
    const proxyApp2 = express();

    proxyApp1.get("/proxy1", (req, res) => {
      res.send("from proxy1");
    });
    proxyApp1.get("/api", (req, res) => {
      res.send("api response from proxy1");
    });
    proxyApp2.get("/proxy2", (req, res) => {
      res.send("from proxy2");
    });

    await new Promise((resolve) => {
      proxyServer1 = proxyApp1.listen(port1, () => {
        resolve();
      });
    });

    await new Promise((resolve) => {
      proxyServer2 = proxyApp2.listen(port2, () => {
        resolve();
      });
    });
  }

  async function closeProxyServers() {
    await new Promise((resolve) => {
      proxyServer1.close(() => {
        resolve();
      });
    });

    await new Promise((resolve) => {
      proxyServer2.close(() => {
        resolve();
      });
    });
  }

  describe("as an object of paths with properties", () => {
    let server;
    let req;

    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: staticDirectory,
            watch: false,
          },
          proxy: proxyOptionPathsAsProperties,
          port: port3,
        },
        compiler,
      );

      await server.start();

      await listenProxyServers();

      req = request(server.app);
    });

    afterAll(async () => {
      await server.stop();
      await closeProxyServers();
    });

    describe("target", () => {
      it("respects a proxy option when a request path is matched", async () => {
        const response = await req.get("/proxy1");

        expect(response.status).toBe(200);
        expect(response.text).toContain("from proxy1");
      });
    });

    describe("pathRewrite", () => {
      it("respects a pathRewrite option", async () => {
        const response = await req.get("/api/proxy2");

        expect(response.status).toBe(200);
        expect(response.text).toContain("from proxy2");
      });
    });

    describe("bypass", () => {
      it("should log deprecation warning when bypass is used", async () => {
        const utilSpy = jest.spyOn(util, "deprecate");

        const response = await req.get("/foo/bar.html");

        expect(response.status).toBe(200);
        expect(response.text).toContain("Hello");

        const lastCall = utilSpy.mock.calls[utilSpy.mock.calls.length - 1];

        expect(lastCall[1]).toBe(
          "Using the 'bypass' option is deprecated. Please use the 'router' or 'context' options. Read more at https://github.com/chimurai/http-proxy-middleware/tree/v2.0.6#http-proxy-middleware-options",
        );
        expect(lastCall[2]).toBe(
          "DEP_WEBPACK_DEV_SERVER_PROXY_BYPASS_ARGUMENT",
        );

        utilSpy.mockRestore();
      });

      it("can rewrite a request path", async () => {
        const response = await req.get("/foo/bar.html");

        expect(response.status).toBe(200);
        expect(response.text).toContain("Hello");
      });

      it("can rewrite a request path regardless of the target defined a bypass option", async () => {
        const response = await req.get("/baz/hoge.html");

        expect(response.status).toBe(200);
        expect(response.text).toContain("Hello");
      });

      it("should pass through a proxy when a bypass function returns null", async () => {
        const response = await req.get("/foo.js");

        expect(response.status).toBe(200);
        expect(response.text).toContain("Hey");
      });

      it("should not pass through a proxy when a bypass function returns false", async () => {
        const response = await req.get("/proxyfalse");

        expect(response.status).toBe(404);
      });

      it("should wait if bypass returns promise", async () => {
        const response = await req.get("/proxy/async");

        expect(response.status).toBe(200);
        expect(response.text).toContain("proxy async response");
      });

      it("should work with the 'target' option", async () => {
        const response = await req.get("/bypass-with-target/foo.js");

        expect(response.status).toBe(404);
      });

      it("should work with the 'target' option #2", async () => {
        const response = await req.get("/bypass-with-target/index.html");

        expect(response.status).toBe(200);
        expect(response.text).toContain("Hello");
      });
    });
  });

  describe("as an option is an object with the `context` option", () => {
    let server;
    let req;

    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          proxy: proxyOption,
          port: port3,
        },
        compiler,
      );

      await server.start();

      await listenProxyServers();

      req = request(server.app);
    });

    afterAll(async () => {
      await server.stop();
      await closeProxyServers();
    });

    it("respects a proxy option", async () => {
      const response = await req.get("/proxy1");

      expect(response.status).toBe(200);
      expect(response.text).toContain("from proxy1");
    });
  });

  describe("as an option is an object with `context` and `target` as string", () => {
    let server;
    let req;

    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          proxy: proxyWithString,
          port: port3,
        },
        compiler,
      );

      await server.start();

      await listenProxyServers();

      req = request(server.app);
    });

    afterAll(async () => {
      await server.stop();
      await closeProxyServers();
    });

    it("respects a proxy option", async () => {
      const response = await req.get("/proxy1");

      expect(response.status).toBe(200);
      expect(response.text).toContain("from proxy1");
    });
  });

  describe("as an option is an object with the `path` option (`context` alias)", () => {
    let server;
    let req;

    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          proxy: proxyWithPath,
          port: port3,
        },
        compiler,
      );

      await server.start();

      await listenProxyServers();

      req = request(server.app);
    });

    afterAll(async () => {
      await server.stop();
      await closeProxyServers();
    });

    it("respects a proxy option", async () => {
      const response = await req.get("/proxy1");

      expect(response.status).toBe(200);
      expect(response.text).toContain("from proxy1");
    });
  });

  describe("as an option is an object with the `router` option", () => {
    let server;
    let req;

    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          proxy: proxyWithRouterAsObject,
          port: port3,
        },
        compiler,
      );

      await server.start();

      await listenProxyServers();

      req = request(server.app);
    });

    afterAll(async () => {
      await server.stop();
      await closeProxyServers();
    });

    it("respects a proxy option", async () => {
      const response = await req.get("/proxy1");

      expect(response.status).toBe(200);
      expect(response.text).toContain("from proxy1");
    });
  });

  describe("as an array", () => {
    let server;
    let req;

    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          proxy: proxyOptionOfArray,
          port: port3,
        },
        compiler,
      );

      await server.start();

      await listenProxyServers();

      req = request(server.app);
    });

    afterAll(async () => {
      await server.stop();
      await closeProxyServers();
    });

    it("respects a proxy option", async () => {
      const response = await req.get("/proxy1");

      expect(response.status).toBe(200);
      expect(response.text).toContain("from proxy1");
    });

    it("respects a proxy option of function", async () => {
      const response = await req.get("/api/proxy2");

      expect(response.status).toBe(200);
      expect(response.text).toContain("from proxy2");
    });

    it("should allow req, res, and next", async () => {
      const response = await req.get("/api/proxy2?foo=true");

      expect(response.statusCode).toBe(200);
      expect(response.text).toBe("foo+next+function");
    });

    it("should not exist multiple close events registered", async () => {
      expect(maxServerListeners).toBeLessThanOrEqual(1);
    });
  });

  describe("as an array without the `route` option", () => {
    let server;
    let req;

    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          proxy: proxyOptionOfArrayWithoutTarget,
          port: port3,
        },
        compiler,
      );

      await server.start();

      await listenProxyServers();

      req = request(server.app);
    });

    afterAll(async () => {
      await server.stop();
      await closeProxyServers();
    });

    it("respects a proxy option", async () => {
      const response = await req.get("/proxy1");

      expect(response.status).toBe(200);
      expect(response.text).toContain("from proxy1");
    });
  });

  describe("should sharing a proxy option", () => {
    let server;
    let req;
    let listener;

    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          proxy: [
            {
              context: "/proxy1",
              target: `http://localhost:${port1}`,
            },
            {
              context: "/proxy2",
              target: `http://localhost:${port1}`,
            },
          ],
          port: port3,
        },
        compiler,
      );

      await server.start();

      const proxy = express();

      proxy.get("*slug", (proxyReq, res) => {
        res.send("from proxy");
      });

      listener = proxy.listen(port1);

      req = request(server.app);
    });

    afterAll(async () => {
      await server.stop();
      await new Promise((resolve) => {
        listener.close(() => {
          resolve();
        });
      });
    });

    it("respects proxy1 option", async () => {
      const response = await req.get("/proxy1");

      expect(response.status).toBe(200);
      expect(response.text).toContain("from proxy");
    });

    it("respects proxy2 option", async () => {
      const response = await req.get("/proxy2");

      expect(response.status).toBe(200);
      expect(response.text).toContain("from proxy");
    });
  });

  describe("should handles external websocket upgrade", () => {
    let ws;
    let server;
    let webSocketServer;
    let responseMessage;

    const webSocketServerTypes = ["ws"];

    for (const webSocketServerType of webSocketServerTypes) {
      // eslint-disable-next-line no-loop-func
      describe(`with webSocketServerType: ${webSocketServerType}`, () => {
        beforeAll(async () => {
          const compiler = webpack(config);

          server = new Server(
            {
              webSocketServer: webSocketServerType,
              proxy: [
                {
                  context: "/",
                  target: `http://localhost:${port4}`,
                  ws: true,
                },
              ],
              port: port3,
            },
            compiler,
          );

          await server.start();

          webSocketServer = new WebSocketServer({ port: port4 });
          webSocketServer.on("connection", (connection) => {
            connection.on("message", (message) => {
              connection.send(message);
            });
          });
        });

        beforeEach((done) => {
          ws = new WebSocket(`ws://localhost:${port3}/proxy3/socket`);

          ws.on("message", (message) => {
            responseMessage = message.toString();
            done();
          });

          ws.on("open", () => {
            ws.send("foo");
          });
        });

        afterAll(async () => {
          webSocketServer.close();

          for (const client of webSocketServer.clients) {
            client.terminate();
          }

          await server.stop();
        });

        it("should receive response", () => {
          expect(responseMessage).toBe("foo");
        });
      });
    }
  });

  describe("should not silently proxy dev-server HMR websocket to a permissive backend", () => {
    let server;
    let backend;
    let backendWss;
    let backendUpgradeCount;

    const BACKEND_MESSAGE_TYPE = "backend-message";

    beforeAll(async () => {
      backendUpgradeCount = 0;

      backend = http.createServer();
      backendWss = new WebSocketServer({ server: backend });
      backendWss.on("connection", (connection) => {
        backendUpgradeCount += 1;
        connection.send(JSON.stringify({ type: BACKEND_MESSAGE_TYPE }));
      });

      await new Promise((resolve) => {
        backend.listen(port5, resolve);
      });

      const compiler = webpack(config);

      server = new Server(
        {
          hot: true,
          allowedHosts: "all",
          webSocketServer: "ws",
          proxy: [
            {
              context: "/",
              target: `http://localhost:${port5}`,
              ws: true,
            },
          ],
          port: port3,
        },
        compiler,
      );

      await server.start();
    });

    afterAll(async () => {
      for (const client of backendWss.clients) {
        client.terminate();
      }
      backendWss.close();
      // Force-drop any lingering proxy-opened sockets so backend.close() does
      // not hang when the fix is missing and the proxy is mid-upgrade.
      backend.closeAllConnections();
      await server.stop();
      await new Promise((resolve) => {
        backend.close(resolve);
      });
    });

    it("delivers the HMR control messages and never reaches the proxy target", async () => {
      const messages = [];

      const ws = new WebSocket(`ws://localhost:${port3}/ws`);

      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(
            new Error(
              `Timed out waiting for HMR message. Got: ${JSON.stringify(messages)}`,
            ),
          );
        }, 3000);

        ws.on("message", (raw) => {
          const parsed = JSON.parse(raw.toString());
          messages.push(parsed);
          if (parsed.type === "hot") {
            clearTimeout(timer);
            resolve();
          }
        });

        ws.on("error", (err) => {
          clearTimeout(timer);
          reject(err);
        });
      });

      ws.close();

      // Let the proxy finish its async forwarding so the assertion below sees
      // the upgrade attempt deterministically.
      await new Promise((resolve) => {
        setTimeout(resolve, 300);
      });

      expect(messages.some((m) => m.type === "hot")).toBe(true);
      expect(messages.some((m) => m.type === BACKEND_MESSAGE_TYPE)).toBe(false);
      expect(backendUpgradeCount).toBe(0);
    });
  });

  describe("should not log proxy errors for the dev-server HMR upgrade", () => {
    let server;
    let backend;
    let stderrSpy;

    beforeAll(async () => {
      stderrSpy = jest
        .spyOn(process.stderr, "write")
        .mockImplementation(() => true);

      backend = http.createServer();
      backend.on("upgrade", (req, socket) => {
        socket.destroy();
      });
      await new Promise((resolve) => {
        backend.listen(port5, resolve);
      });

      const compiler = webpack(config);

      server = new Server(
        {
          hot: true,
          allowedHosts: "all",
          webSocketServer: "ws",
          proxy: [
            {
              context: "/",
              target: `http://localhost:${port5}`,
              ws: true,
            },
          ],
          port: port3,
        },
        compiler,
      );

      await server.start();
    });

    afterAll(async () => {
      stderrSpy.mockRestore();
      backend.closeAllConnections();
      await server.stop();
      await new Promise((resolve) => {
        backend.close(resolve);
      });
    });

    it("does not surface any [HPM] error when the HMR client connects", async () => {
      const messages = [];

      const ws = new WebSocket(`ws://localhost:${port3}/ws`);

      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(
            new Error(
              `Timed out waiting for HMR message. Got: ${JSON.stringify(messages)}`,
            ),
          );
        }, 3000);

        ws.on("message", (raw) => {
          const parsed = JSON.parse(raw.toString());
          messages.push(parsed);
          if (parsed.type === "hot") {
            clearTimeout(timer);
            resolve();
          }
        });

        ws.on("error", (err) => {
          clearTimeout(timer);
          reject(err);
        });
      });

      ws.close();

      await new Promise((resolve) => {
        setTimeout(resolve, 200);
      });

      const hpmLines = stderrSpy.mock.calls
        .map((c) => c[0])
        .join("")
        .split("\n")
        .filter((line) => line.includes("[HPM]"))
        .map((line) => line.replaceAll(/localhost:\d+/g, "localhost:<port>"))
        .join("\n");

      expect(hpmLines).toBe("");
      expect(messages.some((m) => m.type === "hot")).toBe(true);
    });
  });

  describe("HMR upgrade dispatching to user proxies", () => {
    let server;
    let backend;
    let backendWss;
    let backendUpgradeCount;

    // Start a backend WebSocket server (the user proxy target) and a dev-server
    // proxying everything to it, with the given dev-server options merged in.
    const setup = async (devServerOptions) => {
      backendUpgradeCount = 0;

      backend = http.createServer();
      backendWss = new WebSocketServer({ server: backend });
      backendWss.on("connection", () => {
        backendUpgradeCount += 1;
      });

      await new Promise((resolve) => {
        backend.listen(port5, resolve);
      });

      server = new Server(
        {
          hot: true,
          allowedHosts: "all",
          proxy: [
            {
              context: "/",
              target: `http://localhost:${port5}`,
              ws: true,
            },
          ],
          port: port3,
          ...devServerOptions,
        },
        webpack(config),
      );

      await server.start();
    };

    const teardown = async () => {
      for (const client of backendWss.clients) {
        client.terminate();
      }
      backendWss.close();
      backend.closeAllConnections();
      await server.stop();
      await new Promise((resolve) => {
        backend.close(resolve);
      });
    };

    // Open a WebSocket to `path` and report whether the dev-server completed the
    // handshake (`opened`) and whether the upgrade was forwarded to the backend
    // proxy (`forwarded`).
    const probe = async (path) => {
      const before = backendUpgradeCount;

      const ws = new WebSocket(`ws://localhost:${port3}${path}`);

      // Resolve as soon as the socket reaches a terminal state instead of
      // waiting a fixed delay: `open` means the handshake completed, `error`
      // means it was rejected. The timeout is only a fallback in case neither
      // event ever fires, so it can be generous without slowing the happy path.
      const opened = await new Promise((resolve) => {
        const timer = setTimeout(() => resolve(false), 2000);

        ws.once("open", () => {
          clearTimeout(timer);
          resolve(true);
        });
        ws.once("error", () => {
          clearTimeout(timer);
          resolve(false);
        });
      });

      try {
        ws.close();
      } catch {
        // ignore close errors on already-failed sockets
      }

      return { opened, forwarded: backendUpgradeCount > before };
    };

    // Behavior shared by every WebSocket server implementation: the HMR socket
    // is served locally and never forwarded, while any path the HMR server does
    // not own falls through to the user proxy. SockJS serves its transport under
    // `/<prefix>/<server>/<session>/websocket`, not the bare `/ws`.
    const serverTypes = [
      { type: "ws", hmrPath: "/ws", nonHmrPath: "/not-hmr" },
      {
        type: "sockjs",
        hmrPath: "/ws/000/abcd1234/websocket",
        nonHmrPath: "/not-hmr",
      },
    ];

    for (const { type, hmrPath, nonHmrPath } of serverTypes) {
      describe(`with webSocketServerType: ${type}`, () => {
        beforeAll(() => setup({ webSocketServer: type }));

        afterAll(teardown);

        it("serves the HMR upgrade locally and does not forward it to the proxy", async () => {
          const { opened, forwarded } = await probe(hmrPath);

          expect(opened).toBe(true);
          expect(forwarded).toBe(false);
        });

        it("forwards a non-HMR upgrade to the user proxy", async () => {
          const { forwarded } = await probe(nonHmrPath);

          expect(forwarded).toBe(true);
        });
      });
    }

    // `ws`-specific: the dispatch compares the path exactly the same way
    // `WebSocketServer#shouldHandle` does, so only the configured path (query
    // stripped) is the HMR socket; every other variant is forwarded.
    describe("with the `ws` server, path matching is exact", () => {
      beforeAll(() => setup({ webSocketServer: "ws" }));

      afterAll(teardown);

      it.each([
        ["exact path", "/ws"],
        ["path with query string", "/ws?token=1"],
      ])("treats %s (%s) as the HMR upgrade path", async (_label, path) => {
        const { forwarded } = await probe(path);

        expect(forwarded).toBe(false);
      });

      it.each([
        ["leading double slash", "//ws"],
        ["trailing slash", "/ws/"],
        ["uppercase", "/WS"],
        ["mixed case", "/wS"],
        ["percent-encoded path", "/%77%73"],
      ])("forwards %s (%s) to the user proxy", async (_label, path) => {
        const { forwarded } = await probe(path);

        expect(forwarded).toBe(true);
      });
    });

    // The HMR path is read from the configured `webSocketServer` options, not a
    // hardcoded `/ws`.
    describe("with a custom `ws` path", () => {
      beforeAll(() =>
        setup({
          webSocketServer: { type: "ws", options: { path: "/custom-hmr" } },
        }),
      );

      afterAll(teardown);

      it("treats the configured path (/custom-hmr) as the HMR upgrade path", async () => {
        const { forwarded } = await probe("/custom-hmr");

        expect(forwarded).toBe(false);
      });

      it("forwards the default path (/ws) once it is no longer the HMR path", async () => {
        const { forwarded } = await probe("/ws");

        expect(forwarded).toBe(true);
      });
    });

    // With no HMR server there is no socket to protect, so the filter never
    // engages and even `/ws` is forwarded to the user proxy.
    describe("without a webSocketServer", () => {
      beforeAll(() =>
        setup({ hot: false, liveReload: false, webSocketServer: false }),
      );

      afterAll(teardown);

      it("forwards /ws to the user proxy because there is no HMR socket to protect", async () => {
        const { forwarded } = await probe("/ws");

        expect(forwarded).toBe(true);
      });
    });
  });

  describe("should supports http methods", () => {
    let server;
    let req;
    let listener;

    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          proxy: [
            {
              context: "**",
              target: `http://localhost:${port1}`,
            },
          ],
          port: port3,
        },
        compiler,
      );

      await server.start();

      const proxy = express();

      // Parse application/x-www-form-urlencoded
      proxy.use(express.urlencoded({ extended: false }));

      // Parse application/json
      proxy.use(express.json());

      // This forces Express to try to decode URLs, which is needed for the test
      // associated with the middleware below.
      proxy.all("*slug", (_req, res, next) => {
        next();
      });
      // We must define all 4 params in order for this to be detected as an
      // error handling middleware.
      // eslint-disable-next-line no-unused-vars
      proxy.use((error, proxyReq, res, next) => {
        res.status(500);
        res.send("error from proxy");
      });

      proxy.get("/get", (proxyReq, res) => {
        res.send("GET method from proxy");
      });

      proxy.head("/head", (proxyReq, res) => {
        res.send("HEAD method from proxy");
      });

      proxy.post("/post-x-www-form-urlencoded", (proxyReq, res) => {
        const { id } = proxyReq.body;

        res.status(200).send(`POST method from proxy (id: ${id})`);
      });

      proxy.post("/post-application-json", (proxyReq, res) => {
        const { id } = proxyReq.body;

        res.status(200).send({ answer: `POST method from proxy (id: ${id})` });
      });

      proxy.delete("/delete", (proxyReq, res) => {
        res.send("DELETE method from proxy");
      });

      listener = proxy.listen(port1);
      req = request(server.app);
    });

    afterAll(async () => {
      await server.stop();

      await new Promise((resolve) => {
        listener.close(() => {
          resolve();
        });
      });
    });

    it("errors", async () => {
      const response = await req.get("/%");

      expect(response.status).toBe(500);
      expect(response.text).toContain("error from proxy");
    });

    it("gET method", async () => {
      const response = await req.get("/get");

      expect(response.status).toBe(200);
      expect(response.text).toContain("GET method from proxy");
    });

    it("hEAD method", async () => {
      const response = await req.head("/head");

      expect(response.status).toBe(200);
    });

    it("pOST method (application/x-www-form-urlencoded)", async () => {
      const response = await req
        .post("/post-x-www-form-urlencoded")
        .send("id=1");

      expect(response.status).toBe(200);
      expect(response.text).toContain("POST method from proxy (id: 1)");
    });

    it("pOST method (application/json)", async () => {
      const response = await req
        .post("/post-application-json")
        .send({ id: "1" })
        .set("Accept", "application/json");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toBe(
        "application/json; charset=utf-8",
      );
      expect(response.text).toContain("POST method from proxy (id: 1)");
    });

    it("dELETE method", async () => {
      const response = await req.delete("/delete");

      expect(response.status).toBe(200);
      expect(response.text).toContain("DELETE method from proxy");
    });
  });

  describe("should work in multi compiler mode", () => {
    let server;
    let req;

    beforeAll(async () => {
      const compiler = webpack([config, config]);

      server = new Server(
        {
          proxy: [
            {
              context: () => true,
              target: `http://localhost:${port1}`,
            },
          ],
          port: port3,
        },
        compiler,
      );

      await server.start();

      await listenProxyServers();

      req = request(server.app);
    });

    afterAll(async () => {
      await server.stop();
      await closeProxyServers();
    });

    it("respects a proxy option", async () => {
      const response = await req.get("/proxy1");

      expect(response.status).toBe(200);
      expect(response.text).toContain("from proxy1");
    });
  });

  describe("should work and respect `logger` option", () => {
    let server;
    let req;
    let consoleSpy;

    beforeAll(async () => {
      consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const compiler = webpack([config, config]);

      server = new Server(
        {
          proxy: [
            {
              context: "/my-path",
              target: "http://unknown:1234",
              logger: console,
            },
          ],
          port: port3,
        },
        compiler,
      );

      await server.start();

      await listenProxyServers();

      req = request(server.app);
    });

    afterAll(async () => {
      consoleSpy.mockRestore();
      await server.stop();
      await closeProxyServers();
    });

    describe("target", () => {
      it("respects a proxy option when a request path is matched", async () => {
        await req.get("/my-path");

        expect(getConsoleErrorOutput(consoleSpy)).toMatchSnapshot();
      });
    });
  });

  describe("should work and respect the `infrastructureLogging.level` option", () => {
    let server;
    let req;
    let stderrSpy;

    beforeAll(async () => {
      stderrSpy = jest
        .spyOn(process.stderr, "write")
        .mockImplementation(() => true);

      const compiler = webpack({
        ...config,
        infrastructureLogging: { colors: false, level: "error" },
      });

      server = new Server(
        {
          proxy: [
            {
              context: "/my-path",
              target: "http://unknown:1234",
            },
          ],
          port: port3,
        },
        compiler,
      );

      await server.start();

      await listenProxyServers();

      req = request(server.app);
    });

    afterAll(async () => {
      stderrSpy.mockRestore();
      await server.stop();
      await closeProxyServers();
    });

    describe("target", () => {
      it("respects a proxy option when a request path is matched", async () => {
        await req.get("/my-path");

        expect(getStderrOutput(stderrSpy)).toMatchSnapshot();
      });
    });
  });

  describe("should work and respect the `infrastructureLogging.level` option with `none` value", () => {
    let server;
    let req;
    let stderrSpy;

    beforeAll(async () => {
      stderrSpy = jest
        .spyOn(process.stderr, "write")
        .mockImplementation(() => true);

      const compiler = webpack({
        ...config,
        infrastructureLogging: { level: "none" },
      });

      server = new Server(
        {
          proxy: [
            {
              context: "/my-path",
              target: "http://unknown:1234",
            },
          ],
          port: port3,
        },
        compiler,
      );

      await server.start();

      req = request(server.app);
    });

    afterAll(async () => {
      stderrSpy.mockRestore();
      await server.stop();
    });

    describe("target", () => {
      it("respects a proxy option when a request path is matched", async () => {
        await req.get("/my-path");

        expect(getStderrOutput(stderrSpy)).toMatchSnapshot();
      });
    });
  });
});
