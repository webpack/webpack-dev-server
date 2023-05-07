"use strict";

const webpack = require("webpack");
const { klona } = require("klona/full");
const Server = require("../lib/Server");
const isWebpack5 = require("./helpers/isWebpack5");
const port = require("./ports-map")["normalize-option"];

describe("normalize options", () => {
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
        webpackConfig = require("./fixtures/multi-compiler-one-configuration/webpack.config");

        if (Array.isArray(item.webpackConfig)) {
          webpackConfig = item.webpackConfig.map((config, index) => {
            return { ...webpackConfig[index], ...config };
          });
        }
      } else {
        webpackConfig = require("./fixtures/simple-config/webpack.config");

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

      try {
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
      } catch (error) {
        throw error;
      } finally {
        await server.stop();
      }
    });
  });
});
