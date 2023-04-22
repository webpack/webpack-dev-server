"use strict";

const path = require("path");
const util = require("util");
const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const WebSocket = require("ws");
const webpack = require("webpack");
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
    context: "/api/proxy2",
    target: `http://localhost:${port2}`,
    pathRewrite: { "^/api": "" },
  },
  {
    context: "/foo",
    bypass(req) {
      if (/\.html$/.test(req.path)) {
        return "/index.html";
      }

      return null;
    },
  },
  {
    context: "proxyfalse",
    bypass(req) {
      if (/\/proxyfalse$/.test(req.path)) {
        return false;
      }
    },
  },
  {
    context: "/proxy/async",
    bypass(req, res) {
      if (/\/proxy\/async$/.test(req.path)) {
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
      if (/\.(html)$/i.test(req.url)) {
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

const proxyOptionOfArray = [
  { context: "/proxy1", target: `http://localhost:${port1}` },
  function proxy(req, res, next) {
    return {
      context: "/api/proxy2",
      target: `http://localhost:${port2}`,
      pathRewrite: { "^/api": "" },
      bypass: () => {
        if (req && req.query.foo) {
          res.end(`foo+${next.name}+${typeof next}`);

          return false;
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
        compiler
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

        expect(response.status).toEqual(200);
        expect(response.text).toContain("from proxy1");
      });
    });

    describe("pathRewrite", () => {
      it("respects a pathRewrite option", async () => {
        const response = await req.get("/api/proxy2");

        expect(response.status).toEqual(200);
        expect(response.text).toContain("from proxy2");
      });
    });

    describe("bypass", () => {
      it("should log deprecation warning when bypass is used", async () => {
        const utilSpy = jest.spyOn(util, "deprecate");

        expect(utilSpy.mock.calls[0][1]).toEqual(
          "Using the 'bypass' option is deprecated. Please use the 'router' and 'context' options. Read more at https://github.com/chimurai/http-proxy-middleware/tree/v2.0.6#http-proxy-middleware-options"
        );
        expect(utilSpy.mock.calls[0][2]).toEqual(
          "DEP_WEBPACK_DEV_SERVER_PROXY_BYPASS_ARGUMENT"
        );

        utilSpy.mockRestore();
      });
      it("can rewrite a request path", async () => {
        const response = await req.get("/foo/bar.html");

        expect(response.status).toEqual(200);
        expect(response.text).toContain("Hello");
      });

      it("can rewrite a request path regardless of the target defined a bypass option", async () => {
        const response = await req.get("/baz/hoge.html");

        expect(response.status).toEqual(200);
        expect(response.text).toContain("Hello");
      });

      it("should pass through a proxy when a bypass function returns null", async () => {
        const response = await req.get("/foo.js");

        expect(response.status).toEqual(200);
        expect(response.text).toContain("Hey");
      });

      it("should not pass through a proxy when a bypass function returns false", async () => {
        const response = await req.get("/proxyfalse");

        expect(response.status).toEqual(404);
      });

      it("should wait if bypass returns promise", async () => {
        const response = await req.get("/proxy/async");

        expect(response.status).toEqual(200);
        expect(response.text).toContain("proxy async response");
      });

      it("should work with the 'target' option", async () => {
        const response = await req.get("/bypass-with-target/foo.js");

        expect(response.status).toEqual(404);
      });

      it("should work with the 'target' option #2", async () => {
        const response = await req.get("/bypass-with-target/index.html");

        expect(response.status).toEqual(200);
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
        compiler
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

      expect(response.status).toEqual(200);
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
        compiler
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

      expect(response.status).toEqual(200);
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
        compiler
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

      expect(response.status).toEqual(200);
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
        compiler
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

      expect(response.status).toEqual(200);
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
        compiler
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

      expect(response.status).toEqual(200);
      expect(response.text).toContain("from proxy1");
    });

    it("respects a proxy option of function", async () => {
      const response = await req.get("/api/proxy2");

      expect(response.status).toEqual(200);
      expect(response.text).toContain("from proxy2");
    });

    it("should allow req, res, and next", async () => {
      const response = await req.get("/api/proxy2?foo=true");

      expect(response.statusCode).toEqual(200);
      expect(response.text).toEqual("foo+next+function");
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
        compiler
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

      expect(response.status).toEqual(200);
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
        compiler
      );

      await server.start();

      const proxy = express();

      proxy.get("*", (proxyReq, res) => {
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

      expect(response.status).toEqual(200);
      expect(response.text).toContain("from proxy");
    });

    it("respects proxy2 option", async () => {
      const response = await req.get("/proxy2");

      expect(response.status).toEqual(200);
      expect(response.text).toContain("from proxy");
    });
  });

  describe("should handles external websocket upgrade", () => {
    let ws;
    let server;
    let webSocketServer;
    let responseMessage;

    const webSocketServerTypes = ["sockjs", "ws"];

    webSocketServerTypes.forEach((webSocketServerType) => {
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
            compiler
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

        it("Should receive response", () => {
          expect(responseMessage).toEqual("foo");
        });

        afterAll(async () => {
          webSocketServer.close();

          for (const client of webSocketServer.clients) {
            client.terminate();
          }

          await server.stop();
        });
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
        compiler
      );

      await server.start();

      const proxy = express();

      // Parse application/x-www-form-urlencoded
      proxy.use(bodyParser.urlencoded({ extended: false }));

      // Parse application/json
      proxy.use(bodyParser.json());

      // This forces Express to try to decode URLs, which is needed for the test
      // associated with the middleware below.
      proxy.all("*", (_req, res, next) => {
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
        const id = proxyReq.body.id;

        res.status(200).send(`POST method from proxy (id: ${id})`);
      });

      proxy.post("/post-application-json", (proxyReq, res) => {
        const id = proxyReq.body.id;

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

      expect(response.status).toEqual(500);
      expect(response.text).toContain("error from proxy");
    });

    it("GET method", async () => {
      const response = await req.get("/get");

      expect(response.status).toEqual(200);
      expect(response.text).toContain("GET method from proxy");
    });

    it("HEAD method", async () => {
      const response = await req.head("/head");

      expect(response.status).toEqual(200);
    });

    it("POST method (application/x-www-form-urlencoded)", async () => {
      const response = await req
        .post("/post-x-www-form-urlencoded")
        .send("id=1");

      expect(response.status).toEqual(200);
      expect(response.text).toContain("POST method from proxy (id: 1)");
    });

    it("POST method (application/json)", async () => {
      const response = await req
        .post("/post-application-json")
        .send({ id: "1" })
        .set("Accept", "application/json");

      expect(response.status).toEqual(200);
      expect(response.headers["content-type"]).toEqual(
        "application/json; charset=utf-8"
      );
      expect(response.text).toContain("POST method from proxy (id: 1)");
    });

    it("DELETE method", async () => {
      const response = await req.delete("/delete");

      expect(response.status).toEqual(200);
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
        compiler
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

      expect(response.status).toEqual(200);
      expect(response.text).toContain("from proxy1");
    });
  });

  describe("should work and respect `logProvider` and `logLevel` options", () => {
    let server;
    let req;
    let customLogProvider;

    beforeAll(async () => {
      customLogProvider = {
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      const compiler = webpack([config, config]);

      server = new Server(
        {
          proxy: [
            {
              context: "/my-path",
              target: "http://unknown:1234",
              logProvider: () => customLogProvider,
              logLevel: "error",
            },
          ],
          port: port3,
        },
        compiler
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
        await req.get("/my-path");

        expect(customLogProvider.error).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("should work and respect the `logLevel` option with `silent` value", () => {
    let server;
    let req;
    let customLogProvider;

    beforeAll(async () => {
      customLogProvider = {
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      const compiler = webpack([config, config]);

      server = new Server(
        {
          proxy: [
            {
              context: "my-path",
              target: "http://unknown:1234",
              logProvider: () => customLogProvider,
              logLevel: "silent",
            },
          ],
          port: port3,
        },
        compiler
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
        await req.get("/my-path");

        expect(customLogProvider.error).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe("should work and respect the `infrastructureLogging.level` option", () => {
    let server;
    let req;
    let customLogProvider;

    beforeAll(async () => {
      customLogProvider = {
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      const compiler = webpack({
        ...config,
        infrastructureLogging: { level: "error" },
      });

      server = new Server(
        {
          proxy: [
            {
              context: "/my-path",
              target: "http://unknown:1234",
              logProvider: () => customLogProvider,
            },
          ],
          port: port3,
        },
        compiler
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
        await req.get("/my-path");

        expect(customLogProvider.error).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("should work and respect the `infrastructureLogging.level` option with `none` value", () => {
    let server;
    let req;
    let customLogProvider;

    beforeAll(async () => {
      customLogProvider = {
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

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
              logProvider: () => customLogProvider,
            },
          ],
          port: port3,
        },
        compiler
      );

      await server.start();

      req = request(server.app);
    });

    afterAll(async () => {
      await server.stop();
    });

    describe("target", () => {
      it("respects a proxy option when a request path is matched", async () => {
        await req.get("/my-path");

        expect(customLogProvider.error).toHaveBeenCalledTimes(0);
      });
    });
  });
});
