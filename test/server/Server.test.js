"use strict";

const { relative, sep } = require("path");
const http = require("http");
const webpack = require("webpack");
const { klona } = require("klona/full");
const sockjs = require("sockjs/lib/transport");
const Server = require("../../lib/Server");
const config = require("../fixtures/simple-config/webpack.config");
const port = require("../ports-map").server;
const isWebpack5 = require("../helpers/isWebpack5");

jest.mock("sockjs/lib/transport");

const baseDevConfig = {
  port,
  host: "localhost",
  static: false,
};

describe("Server", () => {
  describe("sockjs has decorateConnection", () => {
    it("add decorateConnection", () => {
      expect(typeof sockjs.Session.prototype.decorateConnection).toEqual(
        "function"
      );
    });
  });

  describe("DevServerPlugin", () => {
    let entries;

    function getEntries(server) {
      if (isWebpack5) {
        server.middleware.context.compiler.hooks.afterEmit.tap(
          "webpack-dev-server",
          (compilation) => {
            const mainDeps = compilation.entries.get("main").dependencies;
            const globalDeps = compilation.globalEntry.dependencies;

            entries = globalDeps
              .concat(mainDeps)
              .map((dep) => relative(".", dep.request).split(sep));
          }
        );
      } else {
        entries = server.middleware.context.compiler.options.entry.map((p) =>
          relative(".", p).split(sep)
        );
      }
    }

    it("add hot option", (done) => {
      const compiler = webpack(config);
      const server = new Server({ ...baseDevConfig, hot: true }, compiler);

      compiler.hooks.done.tap("webpack-dev-server", () => {
        expect(entries).toMatchSnapshot();

        server.stopCallback(done);
      });

      server.startCallback((error) => {
        if (error) {
          throw error;
        }

        getEntries(server);
      });
    });

    it("add hot-only option", (done) => {
      const compiler = webpack(config);
      const server = new Server({ ...baseDevConfig, hot: "only" }, compiler);

      compiler.hooks.done.tap("webpack-dev-server", () => {
        expect(entries).toMatchSnapshot();

        server.stopCallback(done);
      });

      server.startCallback((error) => {
        if (error) {
          throw error;
        }

        getEntries(server);
      });
    });

    // TODO: remove this after plugin support is published
    it("should create and run server with old parameters order and log deprecation warning", (done) => {
      const compiler = webpack(config);
      const util = require("util");
      const utilSpy = jest.spyOn(util, "deprecate");

      const server = new Server(compiler, baseDevConfig);

      expect(utilSpy.mock.calls[0][1]).toBe(
        "Using 'compiler' as the first argument is deprecated. Please use 'options' as the first argument and 'compiler' as the second argument."
      );

      compiler.hooks.done.tap("webpack-dev-server", () => {
        expect(entries).toMatchSnapshot("oldparam");

        server.stopCallback(done);
      });

      server.startCallback((error) => {
        if (error) {
          throw error;
        }

        getEntries(server);
      });

      utilSpy.mockRestore();
    });
  });

  describe("normalizeOptions", () => {
    const cases = [
      {
        title: "no options",
        multiCompiler: false,
        options: {},
      },
      {
        title: "port string",
        multiCompiler: false,
        options: {
          port: "9000",
        },
      },
      {
        title: "client.webSocketTransport sockjs string",
        multiCompiler: false,
        options: {
          client: {
            webSocketTransport: "sockjs",
          },
        },
      },
      {
        title: "client.webSocketTransport ws string",
        multiCompiler: false,
        options: {
          client: {
            webSocketTransport: "ws",
          },
        },
      },
      {
        title:
          "client.webSocketTransport ws string and webSocketServer ws string",
        multiCompiler: false,
        options: {
          client: {
            webSocketTransport: "ws",
          },
          webSocketServer: "ws",
        },
      },
      {
        title: "webSocketServer custom server path",
        multiCompiler: false,
        options: {
          webSocketServer: "/path/to/custom/server/",
        },
      },
      {
        title: "webSocketServer custom server class",
        multiCompiler: false,
        options: {
          webSocketServer: class CustomServerImplementation {
            constructor() {
              this.implementation = {
                close: (callback) => {
                  callback();
                },
              };
            }
          },
        },
      },
      {
        title: "client.webSocketTransport ws string and webSocketServer object",
        multiCompiler: false,
        options: {
          client: {
            webSocketTransport: "ws",
          },
          webSocketServer: {
            type: "ws",
            options: {
              host: "127.0.0.1",
              // TODO `jest` is freeze here
              // port: 43334,
              pathname: "/ws",
            },
          },
        },
      },
      {
        title:
          "client.webSocketTransport ws string and webSocketServer object with port as string",
        multiCompiler: false,
        options: {
          client: {
            webSocketTransport: "ws",
          },
          webSocketServer: {
            type: "ws",
            options: {
              host: "127.0.0.1",
              // TODO `jest` is freeze here
              // port: "43335",
              pathname: "/ws",
            },
          },
        },
      },
      {
        title: "client custom webSocketTransport path",
        multiCompiler: false,
        options: {
          client: {
            webSocketTransport: "/path/to/custom/client/",
          },
        },
      },
      {
        title: "client host and port",
        multiCompiler: false,
        options: {
          client: {
            webSocketURL: {
              hostname: "my.host",
              port: 9000,
            },
          },
        },
      },
      {
        title: "client host and string port",
        multiCompiler: false,
        options: {
          client: {
            webSocketURL: {
              hostname: "my.host",
              port: "9000",
            },
          },
        },
      },
      {
        title: "client path",
        multiCompiler: false,
        options: {
          client: {
            webSocketURL: {
              pathname: "/custom/path/",
            },
          },
        },
      },
      {
        title: "username and password",
        multiCompiler: false,
        options: {
          client: {
            webSocketURL: {
              username: "zenitsu",
              password: "chuntaro",
            },
          },
        },
      },
      {
        title: "client path without leading/ending slashes",
        multiCompiler: false,
        options: {
          client: {
            webSocketURL: {
              pathname: "custom/path",
            },
          },
        },
      },
      {
        title:
          "single compiler client.logging should default to infrastructureLogging.level",
        multiCompiler: false,
        options: {},
        webpackConfig: {
          infrastructureLogging: isWebpack5
            ? {
                level: "verbose",
                stream: {
                  write: () => {},
                },
              }
            : {
                level: "verbose",
              },
        },
      },
      {
        title:
          "single compiler client.logging should override to infrastructureLogging.level",
        multiCompiler: false,
        options: {
          client: {
            logging: "none",
          },
        },
        webpackConfig: {
          infrastructureLogging: isWebpack5
            ? {
                level: "verbose",
                stream: {
                  write: () => {},
                },
              }
            : {
                level: "verbose",
              },
        },
      },
      {
        title:
          "multi compiler client.logging should respect infrastructureLogging.level",
        multiCompiler: true,
        options: {},
        webpackConfig: [
          {
            target: "node",
          },
          // infrastructureLogging is set on the second compiler
          {
            target: "web",
            infrastructureLogging: {
              level: "warn",
            },
          },
        ],
      },
      {
        title:
          "multi compiler client.logging should respect infrastructureLogging.level",
        multiCompiler: true,
        options: {},
        webpackConfig: [
          {},
          // infrastructureLogging is set on the second compiler
          {
            devServer: {},
            infrastructureLogging: {
              level: "warn",
            },
          },
        ],
      },
      {
        title:
          "multi compiler client.logging should respect infrastructureLogging.level",
        multiCompiler: true,
        options: {},
        webpackConfig: [
          // Fallback
          {
            infrastructureLogging: {
              level: "warn",
            },
          },
          {},
        ],
      },
      {
        title:
          "multi compiler client.logging should override infrastructureLogging.level",
        multiCompiler: true,
        options: {
          client: {
            logging: "none",
          },
        },
        webpackConfig: [
          {
            infrastructureLogging: {
              level: "warn",
            },
          },
          {},
        ],
      },
      {
        title: "liveReload is true",
        multiCompiler: false,
        options: {
          liveReload: true,
        },
      },
      {
        title: "liveReload is false",
        multiCompiler: false,
        options: {
          liveReload: false,
        },
      },
      {
        title: "hot is true",
        multiCompiler: false,
        options: {
          hot: true,
        },
      },
      {
        title: "hot is false",
        multiCompiler: false,
        options: {
          hot: false,
        },
      },
      {
        title: "hot is only",
        multiCompiler: false,
        options: {
          hot: "only",
        },
      },
      {
        title: "dev is set",
        multiCompiler: false,
        options: {
          devMiddleware: {
            serverSideRender: true,
          },
        },
      },
      {
        title: "static is true",
        multiCompiler: false,
        options: {
          static: true,
        },
      },
      {
        title: "static is false",
        multiCompiler: false,
        options: {
          static: false,
        },
      },
      {
        title: "static is string",
        multiCompiler: false,
        options: {
          static: "/static/path",
        },
      },
      {
        title: "static is an array of strings",
        multiCompiler: false,
        options: {
          static: ["/static/path1", "/static/path2"],
        },
      },
      {
        title: "static is an array of static objects",
        multiCompiler: false,
        options: {
          static: [
            {
              directory: "/static/path1",
            },
            {
              publicPath: "/static/public/path",
            },
          ],
        },
      },
      {
        title: "static is an array of strings and static objects",
        multiCompiler: false,
        options: {
          static: [
            "/static/path1",
            {
              publicPath: "/static/public/path/",
            },
          ],
        },
      },
      {
        title: "static is an object",
        multiCompiler: false,
        options: {
          static: {
            directory: "/static/path",
          },
        },
      },
      {
        title: "static directory is an absolute url and throws error",
        multiCompiler: false,
        options: {
          static: {
            directory: "http://localhost:8080",
          },
        },
        throws: "Using a URL as static.directory is not supported",
      },
      {
        title: "static publicPath is a string",
        multiCompiler: false,
        options: {
          static: {
            publicPath: "/static/public/path/",
          },
        },
      },
      {
        title: "static publicPath is an array",
        multiCompiler: false,
        options: {
          static: {
            publicPath: ["/static/public/path1/", "/static/public/path2/"],
          },
        },
      },
      {
        title: "static watch is false",
        multiCompiler: false,
        options: {
          static: {
            watch: false,
          },
        },
      },
      {
        title: "static watch is true",
        multiCompiler: false,
        options: {
          static: {
            watch: true,
          },
        },
      },
      {
        title: "static watch is an object",
        multiCompiler: false,
        options: {
          static: {
            watch: {
              poll: 500,
            },
          },
        },
      },
      {
        title: "static serveIndex is false",
        multiCompiler: false,
        options: {
          static: {
            serveIndex: false,
          },
        },
      },
      {
        title: "static serveIndex is true",
        multiCompiler: false,
        options: {
          static: {
            serveIndex: true,
          },
        },
      },
      {
        title: "static serveIndex is an object",
        multiCompiler: false,
        options: {
          static: {
            serveIndex: {
              icons: false,
            },
          },
        },
      },

      {
        title: "single compiler watchOptions is object",
        multiCompiler: false,
        options: {},
        webpackConfig: {
          watch: true,
          watchOptions: {
            aggregateTimeout: 300,
          },
        },
      },
      {
        title: "single compiler watchOptions is object with watch false",
        multiCompiler: false,
        options: {},
        webpackConfig: {
          watch: false,
          watchOptions: {
            aggregateTimeout: 300,
          },
        },
      },
      {
        title: "single compiler watchOptions is object with static watch true",
        multiCompiler: false,
        options: {
          static: {
            watch: true,
          },
        },
        webpackConfig: {
          watch: true,
          watchOptions: {
            aggregateTimeout: 300,
          },
        },
      },
      {
        title:
          "single compiler watchOptions is object with static watch overriding it",
        multiCompiler: false,
        options: {
          static: {
            watch: {
              poll: 500,
            },
          },
        },
        webpackConfig: {
          watch: true,
          watchOptions: {
            aggregateTimeout: 300,
          },
        },
      },
      {
        title: "multi compiler watchOptions is set",
        multiCompiler: true,
        options: {},
        webpackConfig: [
          {},
          // watchOptions are set on the second compiler
          {
            watch: true,
            watchOptions: {
              aggregateTimeout: 300,
            },
          },
        ],
      },
      {
        title: "allowedHosts is string",
        multiCompiler: false,
        options: {
          allowedHosts: "all",
        },
      },
      {
        title: "allowedHosts is array",
        multiCompiler: false,
        options: {
          allowedHosts: ["all"],
        },
      },
    ];

    cases.forEach((item) => {
      it(item.title, async () => {
        let webpackConfig;

        if (item.multiCompiler) {
          webpackConfig = require("../fixtures/multi-compiler-one-configuration/webpack.config");

          if (Array.isArray(item.webpackConfig)) {
            // eslint-disable-next-line no-shadow
            webpackConfig = item.webpackConfig.map((config, index) => {
              return { ...webpackConfig[index], ...config };
            });
          }
        } else {
          webpackConfig = require("../fixtures/simple-config/webpack.config");

          if (item.webpackConfig) {
            webpackConfig = {
              ...webpackConfig,
              ...item.webpackConfig,
            };
          }
        }

        const compiler = webpack(webpackConfig);
        const server = new Server({ ...item.options, port }, compiler);

        let errored;

        try {
          await server.start();
        } catch (error) {
          errored = error;
        }

        if (item.throws) {
          expect(errored.message).toMatch(item.throws);
        } else {
          const optionsForSnapshot = klona(server.options);

          optionsForSnapshot.port = "<auto>";

          if (optionsForSnapshot.static.length > 0) {
            optionsForSnapshot.static.forEach((i) => {
              i.directory = i.directory
                .replace(/\\/g, "/")
                .replace(
                  new RegExp(process.cwd().replace(/\\/g, "/"), "g"),
                  "<cwd>"
                );
            });
          }

          expect(optionsForSnapshot).toMatchSnapshot();
        }

        await server.stop();
      });
    });
  });

  describe("event emitter", () => {
    it("test server error reporting", async () => {
      const compiler = webpack(config);
      const server = new Server(baseDevConfig, compiler);

      await server.start();

      const emitError = () =>
        server.server.emit("error", new Error("Error !!!"));

      expect(emitError).toThrowError();

      await server.stop();
    });
  });

  // issue: https://github.com/webpack/webpack-dev-server/issues/1724
  describe("express.static.mime.types", () => {
    it("should success even if mime.types doesn't exist", async () => {
      // expect.assertions(1);

      jest.mock("express", () => {
        const data = jest.requireActual("express");
        const { static: st } = data;
        const { mime } = st;

        delete mime.types;

        expect(typeof mime.types).toEqual("undefined");

        return { ...data, static: { ...st, mime } };
      });

      const compiler = webpack(config);
      const server = new Server(baseDevConfig, compiler);

      let hasStats = false;

      compiler.hooks.done.tap("webpack-dev-server", (s) => {
        const output = server.getStats(s);

        expect(output.errors.length).toEqual(0);

        hasStats = true;
      });

      await server.start();

      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (hasStats) {
            resolve();

            clearInterval(interval);
          }
        }, 100);
      });

      await server.stop();
    });
  });

  describe("listen", () => {
    let compiler;
    let server;

    beforeAll(() => {
      compiler = webpack(config);
    });

    it('should work and using "port" and "host" from options', (done) => {
      const options = {
        host: "localhost",
        port,
      };

      server = new Server(options, compiler);

      // eslint-disable-next-line no-undefined
      server.listen(undefined, undefined, () => {
        const info = server.server.address();

        expect(info.address).toBe("127.0.0.1");
        expect(info.port).toBe(port);

        server.close(done);
      });
    });

    it('should work and using "port" and "host" from arguments', (done) => {
      server = new Server({}, compiler);

      server.listen(port, "127.0.0.1", () => {
        const info = server.server.address();

        expect(info.address).toBe("127.0.0.1");
        expect(info.port).toBe(port);

        server.close(done);
      });
    });

    it('should work and using the same "port" and "host" from options and arguments', (done) => {
      const options = {
        host: "localhost",
        port,
      };

      server = new Server(options, compiler);

      server.listen(options.port, options.host, () => {
        const info = server.server.address();

        expect(info.address).toBe("127.0.0.1");
        expect(info.port).toBe(port);

        server.close(done);
      });
    });

    it('should work and using "port" from arguments and "host" from options', (done) => {
      const options = {
        host: "127.0.0.1",
      };

      server = new Server(options, compiler);

      // eslint-disable-next-line no-undefined
      server.listen(port, undefined, () => {
        const info = server.server.address();

        expect(info.address).toBe("127.0.0.1");
        expect(info.port).toBe(port);

        server.close(done);
      });
    });

    it('should work and using "port" from options and "port" from arguments', (done) => {
      const options = {
        port,
      };

      server = new Server(options, compiler);

      // eslint-disable-next-line no-undefined
      server.listen(undefined, "127.0.0.1", () => {
        const info = server.server.address();

        expect(info.address).toBe("127.0.0.1");
        expect(info.port).toBe(port);

        server.close(done);
      });
    });

    it('should log warning when the "port" and "host" options from options different from arguments', (done) => {
      const options = {
        host: "127.0.0.2",
        port: "9999",
      };

      server = new Server(options, compiler);

      const warnSpy = jest.fn();

      const getInfrastructureLoggerSpy = jest
        .spyOn(compiler, "getInfrastructureLogger")
        .mockImplementation(() => {
          return {
            warn: warnSpy,
            info: () => {},
          };
        });

      server.listen(port, "127.0.0.1", () => {
        const info = server.server.address();

        expect(warnSpy).toHaveBeenNthCalledWith(
          1,
          'The "port" specified in options is different from the port passed as an argument. Will be used from arguments.'
        );
        expect(warnSpy).toHaveBeenNthCalledWith(
          2,
          'The "host" specified in options is different from the host passed as an argument. Will be used from arguments.'
        );
        expect(info.address).toBe("127.0.0.1");
        expect(info.port).toBe(port);

        warnSpy.mockRestore();
        getInfrastructureLoggerSpy.mockRestore();
        server.close(done);
      });
    });
  });

  describe("checkHostHeader", () => {
    let compiler;
    let server;

    beforeEach(() => {
      compiler = webpack(config);
    });

    afterEach(async () => {
      await server.stop();
    });

    it("should allow access for every requests using an IP", () => {
      const options = {};

      const tests = [
        "192.168.1.123",
        "192.168.1.2:8080",
        "[::1]",
        "[::1]:8080",
        "[ad42::1de2:54c2:c2fa:1234]",
        "[ad42::1de2:54c2:c2fa:1234]:8080",
      ];

      server = new Server(options, compiler);

      tests.forEach((test) => {
        const headers = { host: test };

        if (!server.checkHeader(headers, "host")) {
          throw new Error("Validation didn't pass");
        }
      });
    });

    it('should allow urls with scheme for checking origin when the "option.client.webSocketURL" is object', () => {
      const options = {
        client: {
          webSocketURL: {
            hostname: "test.host",
          },
        },
      };
      const headers = {
        origin: "https://test.host",
      };

      server = new Server(options, compiler);

      if (!server.checkHeader(headers, "origin")) {
        throw new Error("Validation didn't fail");
      }
    });
  });

  describe("Invalidate Callback", () => {
    describe("Testing callback functions on calling invalidate without callback", () => {
      it("should use default `noop` callback", async () => {
        const compiler = webpack(config);
        const server = new Server(baseDevConfig, compiler);

        await server.start();

        server.invalidate();

        expect(server.middleware.context.callbacks.length).toEqual(1);

        await server.stop();
      });
    });

    describe("Testing callback functions on calling invalidate with callback", () => {
      it("should use `callback` function", async () => {
        const compiler = webpack(config);
        const callback = jest.fn();
        const server = new Server(baseDevConfig, compiler);

        await server.start();

        server.invalidate(callback);

        expect(server.middleware.context.callbacks[0]).toBe(callback);

        await server.stop();
      });
    });
  });

  describe("WEBPACK_SERVE environment variable", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
      // this is important - it clears the cache
      jest.resetModules();

      process.env = { ...OLD_ENV };

      delete process.env.WEBPACK_SERVE;
    });

    afterEach(() => {
      process.env = OLD_ENV;
    });

    it("should be present", () => {
      expect(process.env.WEBPACK_SERVE).toBeUndefined();

      require("../../lib/Server");

      expect(process.env.WEBPACK_SERVE).toBe(true);
    });
  });

  describe("Server.getFreePort", () => {
    let dummyServers = [];

    afterEach(() => {
      delete process.env.WEBPACK_DEV_SERVER_BASE_PORT;
      delete process.env.WEBPACK_DEV_SERVER_PORT_RETRY;

      return dummyServers
        .reduce(
          (p, server) =>
            p.then(
              () =>
                new Promise((resolve) => {
                  server.close(resolve);
                })
            ),
          Promise.resolve()
        )
        .then(() => {
          dummyServers = [];
        });
    });

    function createDummyServers(n) {
      process.env.WEBPACK_DEV_SERVER_BASE_PORT = 60000;

      return (Array.isArray(n) ? n : [...new Array(n)]).reduce(
        (p, _, i) =>
          p.then(
            () =>
              new Promise((resolve, reject) => {
                const server = http.createServer();

                dummyServers.push(server);

                server.listen(60000 + i, "0.0.0.0", () => {
                  resolve();
                });

                server.on("error", (error) => {
                  reject(error);
                });
              })
          ),
        Promise.resolve()
      );
    }

    it("should returns the port when the port is specified", async () => {
      const retryCount = 1;

      process.env.WEBPACK_DEV_SERVER_PORT_RETRY = retryCount;

      const freePort = await Server.getFreePort(8082);

      expect(freePort).toEqual(8082);
    });

    it("should returns the port when the port is null", async () => {
      const retryCount = 2;

      process.env.WEBPACK_DEV_SERVER_PORT_RETRY = retryCount;

      await createDummyServers(retryCount);

      const freePort = await Server.getFreePort(null);

      expect(freePort).toEqual(60000 + retryCount);
    });

    it("should returns the port when the port is undefined", async () => {
      const retryCount = 3;

      process.env.WEBPACK_DEV_SERVER_PORT_RETRY = retryCount;

      await createDummyServers(retryCount);

      // eslint-disable-next-line no-undefined
      const freePort = await Server.getFreePort(undefined);

      expect(freePort).toEqual(60000 + retryCount);
    });

    it("should retry finding the port for up to defaultPortRetry times (number)", async () => {
      const retryCount = 4;

      process.env.WEBPACK_DEV_SERVER_PORT_RETRY = retryCount;

      await createDummyServers(retryCount);

      const freePort = await Server.getFreePort();

      expect(freePort).toEqual(60000 + retryCount);
    });

    it("should retry finding the port for up to defaultPortRetry times (string)", async () => {
      const retryCount = 5;

      process.env.WEBPACK_DEV_SERVER_PORT_RETRY = retryCount;

      await createDummyServers(retryCount);

      const freePort = await Server.getFreePort();

      expect(freePort).toEqual(60000 + retryCount);
    });

    it("should retry finding the port when serial ports are busy", async () => {
      const busyPorts = [60000, 60001, 60002, 60003, 60004, 60005];

      process.env.WEBPACK_DEV_SERVER_PORT_RETRY = 1000;

      await createDummyServers(busyPorts);

      const freePort = await Server.getFreePort();

      expect(freePort).toBeGreaterThan(60005);
    });

    it("should throws the error when the port isn't found", async () => {
      expect.assertions(1);

      jest.mock("portfinder", () => {
        return {
          getPortPromise: () => Promise.reject(new Error("busy")),
        };
      });

      process.env.WEBPACK_DEV_SERVER_PORT_RETRY = 1;

      try {
        await Server.getFreePort();
      } catch (error) {
        expect(error.message).toMatchSnapshot();
      }
    });
  });
});
