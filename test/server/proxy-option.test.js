"use strict";

const path = require("node:path");
const express = require("express");
const request = require("supertest");
const webpack = require("webpack");
const WebSocket = require("ws");
const Server = require("../../lib/Server");
const config = require("../fixtures/proxy-config/webpack.config");
const [port1, port2, port3, port4] = require("../ports-map")["proxy-option"];

const WebSocketServer = WebSocket.Server;
const staticDirectory = path.resolve(__dirname, "../fixtures/proxy-config");

const proxyOptionPathsAsProperties = [
  {
    context: "/proxy1",
    target: `http://localhost:${port1}`,
  },
  {
    path: "/api/proxy2",
    target: `http://localhost:${port2}`,
    pathRewrite: { "^/api": "" },
  },
  {
    pathFilter: ["/foo/*.html", "/baz/*.html", "/bypass-with-target/*.html"],
    pathRewrite: () => "/index.html",
    router: () => `http://localhost:${port3}`,
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
  function proxy(req) {
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
    proxyApp1.get("/index.html", (req, res) => {
      res.send("Hello");
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

    describe("pathFilter and pathRewrite", () => {
      it("should rewrite matching paths using pathFilter", async () => {
        const response = await req.get("/foo/bar.html");

        expect(response.status).toBe(200);
        expect(response.text).toContain("Hello");
      });

      it("should rewrite paths using pathRewrite function", async () => {
        const response = await req.get("/baz/hoge.html");

        expect(response.status).toBe(200);
        expect(response.text).toContain("Hello");
      });

      it("should proxy requests that don't match pathFilter", async () => {
        const response = await req.get("/foo.js");

        expect(response.status).toBe(200);
        expect(response.text).toContain("Hey");
      });

      it("should serve static files when not matching proxy rules", async () => {
        const response = await req.get("/index.html");

        expect(response.status).toBe(200);
        expect(response.text).toContain("Hello");
      });

      it("should return 404 for unmatched paths", async () => {
        const response = await req.get("/proxyfalse");

        expect(response.status).toBe(404);
      });

      it("should handle pathFilter with router option", async () => {
        const response = await req.get("/bypass-with-target/foo.js");

        expect(response.status).toBe(404);
      });

      it("should rewrite matching pathFilter patterns with router", async () => {
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
