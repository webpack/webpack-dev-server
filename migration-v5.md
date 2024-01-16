# Migration guide

This document serves as a migration guide for `webpack-dev-server@5.0.0`.

## ⚠ BREAKING CHANGES

- Minimum supported `Node.js` version is `18.12.0`.
- Minimum supported `webpack` version is `5.0.0`.
- Minimum compatible `webpack-cli` version is `4.7.0` but we recommend using the latest version.
- The `http2` and `https` options were removed in favor of [the `server` option](https://webpack.js.org/configuration/dev-server/#devserverserver).

  v4:

  ```js
  module.exports = {
    devServer: {
      http2: true,
      https: {
        ca: "./path/to/server.pem",
        pfx: "./path/to/server.pfx",
        key: "./path/to/server.key",
        cert: "./path/to/server.crt",
        passphrase: "webpack-dev-server",
        requestCert: true,
      },
    },
  };
  ```

  v5:

  ```js
  module.exports = {
    //...
    devServer: {
      server: {
        type: "spdy", // or use 'https'
        options: {
          ca: "./path/to/server.pem",
          pfx: "./path/to/server.pfx",
          key: "./path/to/server.key",
          cert: "./path/to/server.crt",
          passphrase: "webpack-dev-server",
          requestCert: true,
        },
      },
    },
  };
  ```

- The `server.options.cacert` option was removed in favor of the `server.options.ca` option.

  v4:

  ```js
  module.exports = {
    //...
    devServer: {
      server: {
        type: "https", // or use 'https'
        options: {
          cacert: "./path/to/server.pem",
        },
      },
    },
  };
  ```

  v5:

  ```js
  module.exports = {
    //...
    devServer: {
      server: {
        type: "https",
        options: {
          ca: "./path/to/server.pem",
        },
      },
    },
  };
  ```

- The `onAfterSetupMiddleware` and `onBeforeSetupMiddleware` options were removed in favor of [the `setupMiddlewares` option](https://webpack.js.org/configuration/dev-server/#devserversetupmiddlewares).

  v4:

  ```js
  module.exports = {
    //...
    devServer: {
      onAfterSetupMiddleware: function (devServer) {
        if (!devServer) {
          throw new Error("webpack-dev-server is not defined");
        }

        devServer.app.get("/some/after-path", function (req, res) {
          res.json({ custom: "response" });
        });
      },
      onBeforeSetupMiddleware: function (devServer) {
        if (!devServer) {
          throw new Error("webpack-dev-server is not defined");
        }

        devServer.app.get("/some/before-path", function (req, res) {
          res.json({ custom: "response" });
        });
      },
    },
  };
  ```

  v5:

  ```js
  module.exports = {
    // ...
    devServer: {
      setupMiddlewares: (middlewares, devServer) => {
        if (!devServer) {
          throw new Error("webpack-dev-server is not defined");
        }

        devServer.app.get("/setup-middleware/some/path", (_, response) => {
          response.send("setup-middlewares option GET");
        });

        // Use the `unshift` method if you want to run a middleware before all other middlewares
        // or when you are migrating from the `onBeforeSetupMiddleware` option
        middlewares.unshift({
          name: "first-in-array",
          // `path` is optional
          path: "/some/before-path",
          middleware: (req, res) => {
            res.send("Foo!");
          },
        });

        // Use the `push` method if you want to run a middleware after all other middlewares
        // or when you are migrating from the `onAfterSetupMiddleware` option
        middlewares.push({
          name: "hello-world-test-one",
          // `path` is optional
          path: "/some/after-bar",
          middleware: (req, res) => {
            res.send("Foo Bar!");
          },
        });

        middlewares.push((req, res) => {
          res.send("Hello World!");
        });

        return middlewares;
      },
    },
  };
  ```

- The `proxy` option's schema was updated to accept only an array.

v4:

```js
module.exports = {
  //...
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
};
```

v5:

```js
module.exports = {
  //...
  devServer: {
    proxy: [
      {
        context: ["/api"],
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    ],
  },
};
```

- The `--open-app` cli option was removed in favor of the `--open-app-name` option.
- The `--web-socket-server` cli option was removed in favor of the `--web-socket-server-type` option.
- The `magicHtml` option was removed without replacement.
- The value of the `WEBPACK_SERVE` environment variable was changed from `true`(boolean) to `'true'` (string).
- [`webpack-dev-middleware`](https://github.com/webpack/webpack-dev-middleware) was update to v6.
- The `constructor` arguments were changed, now the first argument is dev server options, the second is compiler.

  v4:

  ```js
  const devServerOptions = { host: "127.0.0.1", port: 8080 };
  const devServer = new Server(compiler, devServerOptions);
  ```

  v5:

  ```js
  const devServerOptions = { host: "127.0.0.1", port: 8080 };
  const devServer = new Server(devServerOptions, compiler);
  ```

- The `listen` method is deprecated in favor the [async `start`](https://webpack.js.org/api/webpack-dev-server/#start) or the [`startCallback`](https://webpack.js.org/api/webpack-dev-server/#startcallbackcallback) methods

  v4:

  ```js
  const devServerOptions = { host: "127.0.0.1", port: 8080 };
  const devServer = new Server(compiler, devServerOptions);

  devServer.listen(devServerOptions.host, devServerOptions.port, () => {
    console.log("Running");
  });
  ```

  v5:

  ```js
  const devServerOptions = { host: "127.0.0.1", port: 8080 };
  const devServer = new Server(devServerOptions, compiler);

  (async () => {
    await devServer.start();

    console.log("Running");
  })();
  ```

  ```js
  const devServerOptions = { host: "127.0.0.1", port: 8080 };
  const devServer = new Server(devServerOptions, compiler);

  devServer.startCallback(() => {
    console.log("Running");
  });
  ```

- The `close` method was removed in favor the [async `stop`](https://webpack.js.org/api/webpack-dev-server/#stop) or the [`stopCallback`](https://webpack.js.org/api/webpack-dev-server/#stopcallbackcallback) methods.

  v4:

  ```js
  const devServerOptions = { host: "127.0.0.1", port: 8080 };
  const devServer = new Server(compiler, devServerOptions);

  devServer.listen(devServerOptions.host, devServerOptions.port, () => {
    console.log("Running");

    devServer.close(() => {
      console.log("Closed");
    });
  });
  ```

  v5:

  ```js
  const devServerOptions = { host: "127.0.0.1", port: 8080 };
  const devServer = new Server(devServerOptions, compiler);

  (async () => {
    await devServer.start();

    console.log("Running");

    await devServer.stop();

    console.log("Closed");
  })();
  ```

  ```js
  const devServerOptions = { host: "127.0.0.1", port: 8080 };
  const devServer = new Server(devServerOptions, compiler);

  devServer.startCallback(() => {
    console.log("Running");

    devServer.stopCallback(() => {
      console.log("Closed");
    });
  });
  ```

- The `content-changed` method was removed in favor of the `static-changed` method from `onSocketMessage`.

  v4:

  ```js
  onSocketMessage["content-changed"]();
  ```

  v5:

  ```js
  onSocketMessage["static-changed"]();
  ```

## Deprecations

- The `bypass` option is deprecated for proxy in favor of the `router` and the `context` options. [Read more here](https://github.com/chimurai/http-proxy-middleware/tree/v2.0.6#http-proxy-middleware-options).
