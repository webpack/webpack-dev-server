# Migration guide

This document serves as a migration guide for `webpack-dev-server@4.0.0`.

### Before updating

- `webpack-dev-server` v3 and `webpack-dev-server` v4 automatically apply `HotModuleReplacementPlugin` plugin when you set `hot: true`, so please check you don't have `HotModuleReplacementPlugin` in your `plugins` if you have `hot: true`/`hot: "only"`
- `webpack-dev-server` v3 and `webpack-dev-server` v4 automatically inject `webpack/hot/dev-server` in your `entry` option when you set `hot: true` (except when you use `injectHot` for webpack-dev-server v3), please check you don't have `webpack/hot/dev-server` in your `entry` option
- `webpack-dev-server` v3 and `webpack-dev-server` v4 automatically inject `webpack-dev-server/client/index.js` in your `entry` option (except when you use `injectClient` for webpack-dev-server v3), please check you don't have `webpack-dev-server/client/index.js` in your `entry` option

### ⚠ BREAKING CHANGES

- Minimum supported `Node.js` version is `12.13.0`.
- Minimum supported `webpack` version is `4.37.0` (**but we so recommend using 5 version**).
- Minimum compatible `webpack-cli` version is `4.4.0`.
- The `hotOnly` option was removed, if you need hot only mode, use `{ hot: 'only' }` value.

v3:

```js
module.exports = {
  devServer: {
    hotOnly: true,
  },
};
```

v4:

```js
module.exports = {
  devServer: {
    hot: "only",
  },
};
```

- Default web socket server is [`ws`](https://github.com/websockets/ws) (IE9 does not support web socket, please use `{ webSocketServer: 'sockjs' }`).
- The `setup` option was removed without replacement.
- The `before` option was renamed to `onBeforeSetupMiddleware` and changed arguments.

v3:

```js
module.exports = {
  devServer: {
    before: function (app, server, compiler) {
      app.get("/some/path", function (req, res) {
        res.json({ custom: "response" });
      });
    },
  },
};
```

v4:

```js
module.exports = {
  devServer: {
    onBeforeSetupMiddleware: function (devServer) {
      devServer.app.get("/some/path", function (req, res) {
        res.json({ custom: "response" });
      });
    },
  },
};
```

- The `after` option was renamed to `onAfterSetupMiddleware` and changed arguments.

v3:

```js
module.exports = {
  devServer: {
    after: function (app, server, compiler) {
      app.get("/some/path", function (req, res) {
        res.json({ custom: "response" });
      });
    },
  },
};
```

v4:

```js
module.exports = {
  devServer: {
    onAfterSetupMiddleware: function (devServer) {
      devServer.app.get("/some/path", function (req, res) {
        res.json({ custom: "response" });
      });
    },
  },
};
```

- The `features` option was removed in favor `onBeforeSetupMiddleware` and `onAfterSetupMiddleware` options.
- The `key`, `cert`, `pfx`, `pfx-passphrase`, `cacert`, and `requestCert` options were moved to `https` options, please use `https.{key|cert|pfx|passphrase|requestCert|cacert}`.

v3:

```js
module.exports = {
  devServer: {
    ca: "./server.pem",
    pfx: "./server.pfx",
    key: "./server.key",
    cert: "./server.crt",
    pfxPassphrase: "webpack-dev-server",
    requestCert: true,
  },
};
```

v4:

```js
module.exports = {
  devServer: {
    https: {
      cacert: "./server.pem",
      pfx: "./server.pfx",
      key: "./server.key",
      cert: "./server.crt",
      passphrase: "webpack-dev-server",
      requestCert: true,
    },
  },
};
```

- The `compress` option is now `true` by default.
- `filename` and `lazy` options were removed in favor [experiments.lazyCompilation](https://webpack.js.org/configuration/experiments/#experimentslazycompilation).
- The `inline` (`iframe` live mode) option was removed without replacement.
- `log`, `logLevel`, `logTime`, `quiet`, `noInfo`, and `reporter` options were removed without replacement, [now we use built-in logger](https://webpack.js.org/configuration/other-options/#infrastructurelogging).
- The `useLocalIp` option was removed in favor of `host: 'local-ip'/'local-ipv4'/'local-ipv6'`.

v3:

```js
module.exports = {
  devServer: {
    useLocalIp: true,
  },
};
```

v4:

```js
module.exports = {
  devServer: {
    host: "local-ip",
  },
};
```

- `host`/`port` options can't be `null` or empty string, please use `host: 'local-ip'` or `port: 'auto'`.
- the `warn` option was removed in favor of [ignoreWarnings](https://webpack.js.org/configuration/other-options/#ignorewarnings)
- `fs`, `index`, `mimeTypes`, `publicPath`, `serverSideRender`, `stats`, and `writeToDisk` (related to [`webpack-dev-middleware`](https://github.com/webpack/webpack-dev-middleware)) were moved to `devMiddleware` option.

v3:

```js
module.exports = {
  devServer: {
    index: true,
    mimeTypes: { "text/html": ["phtml"] },
    publicPath: "/publicPathForDevServe",
    serverSideRender: true,
    writeToDisk: true,
  },
};
```

v4:

```js
module.exports = {
  devServer: {
    devMiddleware: {
      index: true,
      mimeTypes: { "text/html": ["phtml"] },
      publicPath: "/publicPathForDevServe",
      serverSideRender: true,
      writeToDisk: true,
    },
  },
};
```

- `progress`/`overlay`/`clientLogLevel` option were moved to the `client` option:

v3:

```js
module.exports = {
  devServer: {
    clientLogLevel: "info",
    overlay: true,
    progress: true,
  },
};
```

v4:

```js
module.exports = {
  devServer: {
    client: {
      logging: "info",
      // Can be used only for `errors`/`warnings`
      //
      // overlay: {
      //   errors: true,
      //   warnings: true,
      // }
      overlay: true,
      progress: true,
    },
  },
};
```

- `public`, `sockHost`, `sockPath`, and `sockPort` options were removed in favor `client.webSocketURL` option:

v3:

```js
module.exports = {
  devServer: {
    public: "ws://localhost:8080",
  },
};
```

```js
module.exports = {
  devServer: {
    sockHost: "0.0.0.0",
    sockPath: "/ws",
    sockPort: 8080,
  },
};
```

v4:

```js
module.exports = {
  devServer: {
    client: {
      // Can be `string`:
      //
      // To get protocol/hostname/port from browser
      // webSocketURL: 'auto://0.0.0.0:0/ws'
      webSocketURL: {
        hostname: "0.0.0.0",
        pathname: "/ws",
        port: 8080,
      },
    },
  },
};
```

If you need to set custom `path` to dev server web socket server, please use:

```js
module.exports = {
  devServer: {
    webSocketServer: {
      path: "/my/custom/path/to/web/socket/server",
    },
  },
};
```

- `client.overlay` (previously the `overlay` option ) is now `true` by default.
- `contentBase`/`contentBasePublicPath`/`serveIndex`/`watchContentBase`/`watchOptions`/`staticOptions` options were moved to `static` option:

v3:

```js
module.exports = {
  devServer: {
    contentBase: path.join(__dirname, "public"),
    contentBasePublicPath: "/serve-content-base-at-this-url",
    serveIndex: true,
    watchContentBase: true,
    watchOptions: {
      poll: true,
    },
  },
};
```

v4:

```js
module.exports = {
  devServer: {
    static: {
      directory: path.resolve(__dirname, "static"),
      staticOptions: {},
      // Don't be confused with `devMiddleware.publicPath`, it is `publicPath` for static directory
      // Can be:
      // publicPath: ['/static-public-path-one/', '/static-public-path-two/'],
      publicPath: "/static-public-path/",
      // Can be:
      // serveIndex: {} (options for the `serveIndex` option you can find https://github.com/expressjs/serve-index)
      serveIndex: true,
      // Can be:
      // watch: {} (options for the `watch` option you can find https://github.com/paulmillr/chokidar)
      watch: true,
    },
  },
};
```

- Default value of the `static` option is `path.resolve(process.cwd(), 'public')` directory and enabled by default.
- The `socket` option was renamed to `ipc` (also supports `string` type, i.e. path to unix socket):

v3:

```js
module.exports = {
  devServer: {
    socket: true,
  },
};
```

v4:

```js
module.exports = {
  devServer: {
    ipc: true,
  },
};
```

- The `disableHostCheck` option was removed in favor `allowedHosts: 'all'`:

v3:

```js
module.exports = {
  devServer: {
    disableHostCheck: true,
  },
};
```

v4:

```js
module.exports = {
  devServer: {
    allowedHosts: "all",
  },
};
```

- `open` and `openPage` options were unionized in favor of the `open` option:

v3:

```js
module.exports = {
  devServer: {
    // openPage: '/my-page',
    openPage: true,
  },
};
```

v4:

```js
module.exports = {
  devServer: {
    // open: ['/my-page'],
    open: true,
  },
};
```

```js
module.exports = {
  devServer: {
    open: {
      target: ["first.html", `http://localhost:8080/second.html`],
      app: {
        name: "google-chrome",
        arguments: ["--incognito", "--new-window"],
      },
    },
  },
};
```

- `transportMode` (i.e. `transportMode.client`/`transportMode.server` options) were removed in favor of `client.webSocketTransport` and `webSocketServer`:

v3:

```js
module.exports = {
  transportMode: "ws",
};
```

```js
module.exports = {
  transportMode: {
    client: require.resolve("./CustomClient"),
    server: require.resolve("./CustomServer"),
  },
};
```

v4:

```js
module.exports = {
  devServer: {
    // webSocketServer: 'sockjs',
    webSocketServer: "ws",
  },
};
```

```js
module.exports = {
  devServer: {
    client: {
      webSocketTransport: require.resolve("./CustomClient"),
    },
    webSocketServer: require.resolve("./CustomServer"),
  },
};
```

- (`webpack-dev-middleware`)[https://github.com/webpack/webpack-dev-middleware] was update to v5.
- All options can be set via CLI, don't forget if you need to override option from configuration(s) you should use `reset` flag, i.e. `--static-reset --static my-directory`
- Many CLI options were renamed in favor of the above change, please use `webpack serve --help` to get a list of them.
- The `stdin` option was removed in favor of `--watch-options-stdin`.
- `injectClient` and `injectHot` were removed in favor of manual setup entries.

  - `injectClient: false` was replaced with `client: false`:

  v3:

  ```js
  module.exports = {
    devServer: {
      injectClient: false,
    },
  };
  ```

  v4:

  ```js
  module.exports = {
    devServer: {
      client: false,
    },
  };
  ```

  - `injectHot: false` is now assumed when `hot: false` is used:

  v3:

  ```js
  module.exports = {
    devServer: {
      injectHot: false,
    },
  };
  ```

  v4:

  ```js
  module.exports = {
    devServer: {
      hot: false,
    },
  };
  ```

- The `sockWrite` public method was renamed to `sendMessage`.
- The `profile` option was removed in favor [`ProfilingPlugin`](https://webpack.js.org/plugins/profiling-plugin/).
- The `addDevServerEntrypoints` method was removed in favor of manual configuration.

  v4:

  ```js
  const webpack = require("webpack");
  const DevServer = require("webpack-dev-server");

  const config = {
    entry: [
      // Runtime code for hot module replacement
      "webpack/hot/dev-server.js",
      // Dev server client for web socket transport, hot and live reload logic
      "webpack-dev-server/client/index.js?hot=true&live-reload=true",
      // Your entry
      "./src/entry.js",
    ],
    plugin: [
      // Plugin for hot module replacement
      new webpack.HotModuleReplacementPlugin(),
    ],
  };
  const compiler = webpack(config);
  // `hot` and `client` options are disabled because we added them manually
  const server = new DevServer({ hot: false, client: false }, compiler);

  (async () => {
    await server.start();

    console.log("Running");
  })();
  ```

### Deprecations

- `constructor` arguments were changed, the first argument is dev server options, the second is compiler

  v3:

  ```js
  const devServerOptions = { host: "127.0.0.1", port: 8080 };
  const devServer = new Server(compiler, devServerOptions);
  ```

  v4:

  ```js
  const devServerOptions = { host: "127.0.0.1", port: 8080 };
  const devServer = new Server(devServerOptions, compiler);
  ```

- `listen` method is deprecated in favor async `start` or `startCallback` methods

  v3:

  ```js
  const devServerOptions = { host: "127.0.0.1", port: 8080 };
  const devServer = new Server(compiler, devServerOptions);

  devServer.listen(devServerOptions.host, devServerOptions.port, () => {
    console.log("Running");
  });
  ```

  v4:

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

- `close` method is deprecated in favor async `stop` or `stopCallback` methods

  v3:

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

  v4:

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

### Features

- Added the `setupExitSignals` option, it takes a boolean and if `true` (default on CLI), the server will close and exit the process on `SIGINT` and `SIGTERM`.
- Print a warning if the `host`/`port` option and the `host`/`port` argument passed to `server.listen()` are different.
- Allowed to disable web socket server using `webSocketServer: false`.
- Added the `watchFiles` option, now you can reload server on file changes, for example `{ watchFiles: ["src/**/*.php", "public/**/*"] }`.
- You can specify multiple targets and browsers for the open option, i.e. `{ open: { target: ['/my-page', '/my-other-page'], app: ['google-chrome', '--incognito'] } }`, also you can use `{ open: { target: '<url>', app: ['google-chrome', '--incognito'] } }` to open default URL in multiple browsers.
- Support [`bonjour`](https://www.npmjs.com/package/bonjour#publishing) options.
- The `headers` option can be `Function` type.
- Overlay can be closed in browser.
- The `allowedHosts` option can be `auto` or custom string with your domain (i.e. default value).
- The `static` option can be disabled using `static: false`.
- Added async `start` and `stop` methods to API
- Added `startCallback` and `stopCallback` methods to API
- Migrate on built-in `webpack` logger.

### Bug Fixes

- Compatibility with the `target` option (you can use `target: ['web', 'es5']`).
- `publicPath: auto` is now working out of box.
- No problems with the `target` option anymore, you can remove workaround (i.e. `target: 'web'` for webpack v5).
- Fix `webpack-dev-server` binary, i.e. `webpack server` and `webpack-dev-server` will work identically.
- Empty and multiple entries support.
- IPv6 supported.
- `chokidar` was updated.
- Respect the `client.logging` option for HMR logging.
- Show plugin name in progress log.
- Use value of the `infrastructureLogging.level` option by default for `client.logging`.
- Allow to pass options without the `target` option for the `proxy` options.
- Support lazy compilation.

There are a lot of other bug fixes.

### Notes

- Compatibility with `IE11`/`IE10`/`IE9`:

  - For `IE11`/`IE10` you need polyfill `fetch()` and `Promise`, example:

  ```js
  module.exports = {
    entry: {
      entry: ["whatwg-fetch", "core-js/features/promise", "./entry.js"],
    },
  };
  ```

  - For `IE9` you need polyfill `fetch()` and `Promise` and use `sockjs` for communications (because `WebSocket` is not supported), example:

  ```js
  module.exports = {
    entry: {
      entry: ["whatwg-fetch", "core-js/features/promise", "./entry.js"],
    },
    devServer: {
      webSocketServer: "sockjs",
    },
  };
  ```

  IE8 is not supported, sorry

- Change in **Node.js API**:

  - If you're using dev-server through the Node.js API, the options in devServer will be ignored. Pass the options as a first parameter instead:

  v3:

  ```js
  new WebpackDevServer(compiler, {...})
  ```

  v4:

  ```js
  new WebpackDevServer({...}, compiler)
  ```

  - [See here](https://github.com/webpack/webpack-dev-server/tree/master/examples/api/simple) for an example of how to use `webpack-dev-server` through the Node.js API.
