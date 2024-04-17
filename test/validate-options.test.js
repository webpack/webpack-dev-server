"use strict";

const os = require("os");
const path = require("path");
const { readFileSync } = require("graceful-fs");
const webpack = require("webpack");
const { createFsFromVolume, Volume } = require("memfs");
const Server = require("../lib/Server");
const config = require("./fixtures/simple-config/webpack.config");

const httpsCertificateDirectory = path.join(
  __dirname,
  "./fixtures/https-certificate",
);

const tests = {
  bonjour: {
    success: [false, true, { type: "https" }],
    failure: [""],
  },
  client: {
    success: [
      {},
      {
        logging: "none",
      },
      {
        logging: "error",
      },
      {
        logging: "warn",
      },
      {
        logging: "info",
      },
      {
        logging: "log",
      },
      {
        logging: "verbose",
      },
      {
        progress: false,
      },
      {
        reconnect: false,
      },
      {
        reconnect: true,
      },
      {
        reconnect: 5,
      },
      {
        overlay: true,
      },
      {
        overlay: {},
      },
      {
        overlay: {
          errors: true,
        },
      },
      {
        overlay: {
          warnings: true,
        },
      },
      {
        webSocketTransport: "sockjs",
      },
      {
        webSocketTransport: require.resolve("../client/clients/SockJSClient"),
      },
      {
        webSocketURL: "ws://localhost:8080",
      },
      {
        webSocketURL: { hostname: "localhost" },
      },
      {
        webSocketURL: { port: 8080 },
      },
      {
        webSocketURL: { port: "8080" },
      },
      {
        webSocketURL: { pathname: "" },
      },
      {
        webSocketURL: { pathname: "/my-path/" },
      },
      {
        webSocketURL: {
          hostname: "localhost",
          port: 8080,
          pathname: "/my-path/",
        },
      },
      {
        webSocketURL: { username: "username", password: "password" },
      },
    ],
    failure: [
      "whoops!",
      {
        unknownOption: true,
      },
      {
        logging: "whoops!",
      },
      {
        logging: "silent",
      },
      {
        progress: "",
      },
      {
        reconnect: "",
      },
      {
        overlay: "",
      },
      {
        overlay: {
          errors: "",
        },
      },
      {
        overlay: {
          warnings: "",
        },
      },
      {
        overlay: {
          arbitrary: "",
        },
      },
      {
        webSocketTransport: true,
      },
      {
        webSocketURL: { hostname: true, pathname: "", port: 8080 },
      },
      {
        webSocketURL: { pathname: true },
      },
      {
        webSocketURL: { port: true },
      },
      {
        webSocketURL: { hostname: "" },
      },
      {
        webSocketURL: { port: "" },
      },
      {
        webSocketURL: { username: 123, password: 976 },
      },
    ],
  },
  compress: {
    success: [false, true],
    failure: [""],
  },
  devMiddleware: {
    success: [{}],
    failure: [""],
  },
  allowedHosts: {
    success: ["auto", "all", ["foo"], "bar"],
    failure: [true, false, 123, [], [""]],
  },
  headers: {
    success: [{}, { foo: "bar" }, () => {}, [{ key: "foo", value: "bar" }]],
    failure: [false, 1, [], [{ foo: "bar" }]],
  },
  historyApiFallback: {
    success: [{}, true],
    failure: [""],
  },
  host: {
    success: ["localhost", "::", "::1"],
    failure: [false, "", null],
  },
  hot: {
    success: [true, "only"],
    failure: ["", "foo"],
  },
  ipc: {
    success: [true, path.resolve(os.tmpdir(), "webpack-dev-server.socket")],
    failure: [false, {}],
  },
  liveReload: {
    success: [true, false],
    failure: ["invalid"],
  },
  onListening: {
    success: [() => {}],
    failure: [""],
  },
  open: {
    success: [
      true,
      "foo",
      [],
      ["foo", "bar"],
      [{ app: "google-chrome" }],
      [{ app: "google-chrome" }, { app: "firefox" }],
      [{ target: "foo", app: "google-chrome" }, { app: "firefox" }],
      [{ target: ["foo", "bar"], app: "google-chrome" }, { app: "firefox" }],
      { target: "foo" },
      { target: ["foo", "bar"] },
      { app: "google-chrome" },
      { app: { name: "google-chrome", arguments: ["--incognito"] } },
      { target: "foo", app: "google-chrome" },
      {
        target: ["foo", "bar"],
        app: { name: "google-chrome", arguments: ["--incognito"] },
      },
      {},
    ],
    failure: ["", { foo: "bar" }, { target: 90 }, { app: true }],
  },
  port: {
    success: ["20000", 20001, "auto", 0, 1, 65535],
    failure: [false, null, "", -1, 65536],
  },
  proxy: {
    success: [
      [
        {
          context: ["/auth", "/api"],
          target: "http://localhost:3000",
        },
      ],
    ],
    failure: [
      () => {},
      false,
      {
        "/api": "http://localhost:3000",
      },
    ],
  },
  server: {
    success: [
      "http",
      "https",
      "spdy",
      "custom-server.js",
      {
        type: "http",
      },
      {
        type: "https",
      },
      {
        type: "spdy",
      },
      {
        type: "custom-server.js",
      },
      {
        type: "https",
        options: {
          ca: path.join(httpsCertificateDirectory, "ca.pem"),
          key: path.join(httpsCertificateDirectory, "server.key"),
          pfx: path.join(httpsCertificateDirectory, "server.pfx"),
          cert: path.join(httpsCertificateDirectory, "server.crt"),
          requestCert: true,
          passphrase: "webpack-dev-server",
        },
      },
      {
        type: "https",
        options: {
          ca: readFileSync(
            path.join(httpsCertificateDirectory, "ca.pem"),
          ).toString(),
          pfx: readFileSync(
            path.join(httpsCertificateDirectory, "server.pfx"),
          ).toString(),
          key: readFileSync(
            path.join(httpsCertificateDirectory, "server.key"),
          ).toString(),
          cert: readFileSync(
            path.join(httpsCertificateDirectory, "server.crt"),
          ).toString(),
          passphrase: "webpack-dev-server",
        },
      },
      {
        type: "https",
        options: {
          ca: [
            readFileSync(
              path.join(httpsCertificateDirectory, "ca.pem"),
            ).toString(),
          ],
          pfx: [
            readFileSync(
              path.join(httpsCertificateDirectory, "server.pfx"),
            ).toString(),
          ],
          key: [
            readFileSync(
              path.join(httpsCertificateDirectory, "server.key"),
            ).toString(),
          ],
          cert: [
            readFileSync(
              path.join(httpsCertificateDirectory, "server.crt"),
            ).toString(),
          ],
          passphrase: "webpack-dev-server",
        },
      },
      {
        type: "https",
        options: {
          ca: readFileSync(path.join(httpsCertificateDirectory, "ca.pem")),
          pfx: readFileSync(path.join(httpsCertificateDirectory, "server.pfx")),
          key: readFileSync(path.join(httpsCertificateDirectory, "server.key")),
          cert: readFileSync(
            path.join(httpsCertificateDirectory, "server.crt"),
          ),
          passphrase: "webpack-dev-server",
        },
      },
      {
        type: "https",
        options: {
          ca: [readFileSync(path.join(httpsCertificateDirectory, "ca.pem"))],
          pfx: [
            readFileSync(path.join(httpsCertificateDirectory, "server.pfx")),
          ],
          key: [
            readFileSync(path.join(httpsCertificateDirectory, "server.key")),
          ],
          cert: [
            readFileSync(path.join(httpsCertificateDirectory, "server.crt")),
          ],
          passphrase: "webpack-dev-server",
        },
      },
      {
        type: "https",
        options: {
          ca: [path.join(httpsCertificateDirectory, "ca.pem")],
          key: [path.join(httpsCertificateDirectory, "server.key")],
          pfx: [path.join(httpsCertificateDirectory, "server.pfx")],
          cert: [path.join(httpsCertificateDirectory, "server.crt")],
          requestCert: true,
          passphrase: "webpack-dev-server",
        },
      },
      {
        type: "https",
        options: {
          minVersion: "TLSv1.1",
          ca: readFileSync(path.join(httpsCertificateDirectory, "ca.pem")),
          pfx: readFileSync(path.join(httpsCertificateDirectory, "server.pfx")),
          key: readFileSync(path.join(httpsCertificateDirectory, "server.key")),
          cert: readFileSync(
            path.join(httpsCertificateDirectory, "server.crt"),
          ),
          passphrase: "webpack-dev-server",
        },
      },
      {
        type: "https",
        options: {
          ca: readFileSync(path.join(httpsCertificateDirectory, "ca.pem")),
          pfx: [
            {
              buf: readFileSync(
                path.join(httpsCertificateDirectory, "server.pfx"),
              ),
            },
          ],
          key: [
            {
              pem: readFileSync(
                path.join(httpsCertificateDirectory, "server.key"),
              ),
            },
          ],
          cert: readFileSync(
            path.join(httpsCertificateDirectory, "server.crt"),
          ),
          passphrase: "webpack-dev-server",
        },
      },
    ],
    failure: [
      {
        type: "https",
        additional: "test",
      },
      {
        type: "https",
        options: {
          key: 10,
        },
      },
      {
        type: "https",
        options: {
          cert: true,
        },
      },
      {
        type: "https",
        options: {
          ca: true,
        },
      },
      {
        type: "https",
        options: {
          pfx: 10,
        },
      },
      {
        type: "https",
        options: {
          passphrase: false,
        },
      },
      {
        type: "https",
        options: {
          requestCert: "false",
        },
      },
    ],
  },
  app: {
    success: [
      () => require("connect")(),
      async () =>
        new Promise((resolve) => {
          resolve(require("connect")());
        }),
    ],
    failure: ["test", false],
  },
  static: {
    success: [
      "path",
      false,
      {
        directory: "path",
        staticOptions: {},
        publicPath: "/",
        serveIndex: true,
        watch: true,
      },
      {
        directory: "path",
        staticOptions: {},
        publicPath: ["/public1/", "/public2/"],
        serveIndex: {},
        watch: {},
      },
      [
        "path1",
        {
          directory: "path2",
          staticOptions: {},
          publicPath: "/",
          serveIndex: true,
          watch: true,
        },
      ],
    ],
    failure: [
      0,
      null,
      "",
      {
        publicPath: false,
      },
      {
        serveIndex: "true",
      },
      {
        directory: false,
      },
      {
        watch: 10,
      },
    ],
  },
  setupMiddlewares: {
    success: [() => {}],
    failure: [false, 10, "true"],
  },
  webSocketServer: {
    success: [
      false,
      "ws",
      "sockjs",
      {
        type: "ws",
        options: {
          path: "/ws",
        },
      },
      {
        options: {
          host: "127.0.0.1",
          port: 8090,
          path: "/ws",
        },
      },
      {
        type: "ws",
      },
    ],
    failure: [
      null,
      true,
      {
        type: false,
      },
      {
        notAnOption: true,
      },
      {
        type: true,
      },
    ],
  },
  watchFiles: {
    success: [
      "dir",
      ["one-dir", "two-dir"],
      { paths: ["dir"] },
      { paths: ["dir"], options: { usePolling: true } },
      [{ paths: ["one-dir"] }, "two-dir"],
    ],
    failure: [
      false,
      123,
      {
        paths: false,
      },
      {
        options: false,
      },
    ],
  },
};

describe("options", () => {
  jest.setTimeout(20000);

  let consoleMock;

  beforeAll(() => {
    consoleMock = jest.spyOn(console, "warn").mockImplementation();
  });

  afterAll(() => {
    consoleMock.mockRestore();
  });

  describe("validate", () => {
    function stringifyValue(value) {
      if (
        Array.isArray(value) ||
        (value && typeof value === "object" && value.constructor === Object)
      ) {
        return JSON.stringify(value, (_key, replacedValue) => {
          if (
            replacedValue &&
            replacedValue.type &&
            replacedValue.type === "Buffer"
          ) {
            return "<Buffer>";
          }

          if (typeof replacedValue === "string") {
            replacedValue = replacedValue
              .replace(/\\/g, "/")
              .replace(
                new RegExp(process.cwd().replace(/\\/g, "/"), "g"),
                "<cwd>",
              );
          }

          return replacedValue;
        });
      }

      return value;
    }

    function createTestCase(type, key, value) {
      it(`should ${
        type === "success" ? "successfully validate" : "throw an error on"
      } the "${key}" option with '${stringifyValue(
        value,
      )}' value`, async () => {
        const compiler = webpack(config);
        let thrownError;

        try {
          // eslint-disable-next-line no-new
          new Server({ [key]: value }, compiler);
        } catch (error) {
          thrownError = error;
        }

        if (type === "success") {
          expect(thrownError).toBeUndefined();
        } else {
          expect(thrownError).not.toBeUndefined();
          expect(thrownError.toString()).toMatchSnapshot();
        }
      });
    }

    const memfs = createFsFromVolume(new Volume());

    // We need to patch memfs
    // https://github.com/webpack/webpack-dev-middleware#fs
    memfs.join = path.join;

    for (const [key, values] of Object.entries(tests)) {
      for (const type of Object.keys(values)) {
        for (const value of values[type]) {
          createTestCase(type, key, value);
        }
      }
    }
  });
});
