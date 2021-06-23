# Migration guide

This document serves as a migration guide for `webpack-dev-server@4.0.0`.

## `after` and `before`

Provides the ability to execute custom middleware after/prior to all other middleware internally within the server.

`before` and `after` were removed in favor `onBeforeSetupMiddleware` and `onAfterSetupMiddleware`:

### webpack-dev-server v3:

```js
module.exports = {
  devServer: {
    after: function (app, server, compiler) {
      // do fancy stuff
    },
    before: function (app, server, compiler) {
      app.get('/some/path', function (req, res) {
        res.json({ custom: 'response' });
      });
    },
  },
};
```

### webpack-dev-server v4:

```js
module.exports = {
  devServer: {
    onAfterSetupMiddleware: function (app, server, compiler) {
      // do fancy stuff
    },
    onBeforeSetupMiddleware: function (app, server, compiler) {
      app.get('/some/path', function (req, res) {
        res.json({ custom: 'response' });
      });
    },
  },
};
```

## `client` options

The `sockHost`, `sockPath`, `sockPort`, `clientLogLevel`, `injectClient`, `injectHot`, `overlay`, and `progress` options were moved to `client` option:

### webpack-dev-server v3:

```js
module.exports = {
  devServer: {
    clientLogLevel: 'info',
    injectClient: true,
    injectHot: true,
    overlay: true,
    progress: true,
    sockHost: '0.0.0.0',
    sockPath: '/ws',
    sockPort: 8080,
  },
};
```

### webpack-dev-server v4:

```js
module.exports = {
  devServer: {
    client: {
      logging: 'info',
      needClientEntry: true,
      needHotEntry: true,
      overlay: {
        errors: true,
        warnings: true,
      },
      progress: true,
      webSocketURL: {
        hostname: '0.0.0.0',
        pathname: '/ws',
        port: 8080,
      },
    },
  },
};
```

## `contentBase`/`contentBasePublicPath`/`serveIndex`/`watchContentBase`/`watchOptions`

Tell the server where to serve content from. This is only necessary if you want to serve static files.

- `contentBase` was removed in favor of `static.directory`.
- `contentBasePublicPath` was removed in favor of `static.publicPath`.
- `serveIndex` was removed in favor of `static.serveIndex`.
- `watchContentBase` and `watchOptions` were removed in favor of `static.watch`.

### webpack-dev-server v3:

```js
module.exports = {
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    contentBasePublicPath: '/serve-content-base-at-this-url',
    serveIndex: true,
    watchContentBase: true,
    watchOptions: {
      poll: true,
    },
  },
};
```

### webpack-dev-server v4:

```js
module.exports = {
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'static'),
      staticOptions: {},
      // Don't be confused with `devMiddleware.publicPath`, it is `publicPath` for static directory
      // Can be:
      // publicPath: ['/static-public-path-one/', '/static-public-path-two/'],
      publicPath: '/static-public-path/',
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

## `disableHostCheck`

This option bypasses host checking. It was removed in favor `allowedHosts: 'all'`.

### webpack-dev-server v3:

```js
module.exports = {
  devServer: {
    disableHostCheck: true,
  },
};
```

### webpack-dev-server v4:

```js
module.exports = {
  devServer: {
    allowedHosts: 'all',
  },
};
```

## `https` related options

The `key`, `cert`, `pfx`, `pfx-passphrase`, `cacert`, and `requestCert` options were moved to `https` options, please use `https.{key|cert|pfx|passphrase|requestCert|cacert}`

By default, dev-server will be served over HTTP. It can optionally be served over HTTP/2 with HTTPS:

### webpack-dev-server v3:

```js
module.exports = {
  devServer: {
    ca: './server.pem',
    pfx: './server.pfx',
    key: './server.key',
    cert: './server.crt',
    pfxPassphrase: 'webpack-dev-server',
    requestCert: true,
  },
};
```

### webpack-dev-server v4:

```js
module.exports = {
  devServer: {
    https: {
      cacert: './server.pem',
      pfx: './server.pfx',
      key: './server.key',
      cert: './server.crt',
      passphrase: 'webpack-dev-server',
      requestCert: true,
    },
  },
};
```

## `hotOnly`

Enables Hot Module Replacement without page refresh as a fallback in case of build failures.

### webpack-dev-server v3:

```js
module.exports = {
  devServer: {
    hotOnly: true,
  },
};
```

### webpack-dev-server v4:

```js
module.exports = {
  devServer: {
    hot: 'only',
  },
};
```

## `openPage`

Specify a page to navigate to when opening the browser.

### webpack-dev-server v3:

```js
module.exports = {
  devServer: {
    openPage: '/my-page',
  },
};
```

### webpack-dev-server v4:

```js
module.exports = {
  devServer: {
    open: ['/my-page'],
  },
};
```

## `quiet` and `noInfo`

`quiet` and `noInfo` were removed in favor built-in logger and can be reconfigured using [infrastructureLogging](https://webpack.js.org/configuration/other-options/#infrastructurelogging)

## `useLocalIp`

This option lets the browser open with your local IP. It was removed in favor of `host: 'local-ip'/'local-ipv4'/'local-ipv6'`.

### webpack-dev-server v3:

```js
module.exports = {
  devServer: {
    useLocalIp: true,
  },
};
```

### webpack-dev-server v4:

```js
module.exports = {
  devServer: {
    host: 'local-ip',
  },
};
```

## `transportMode`

This option allows us either to choose the current `devServer` transport mode for client/server individually or to provide custom client/server implementation.

- `transportMode.client` was removed in favor of `client.transport`.
- `transportMode.server` was removed in favor of `webSocketServer`.

### webpack-dev-server v3:

```js
// Example 1
module.exports = {
  transportMode: {
    client: 'ws',
    server: 'ws',
  },
};

// Example 2
module.exports = {
  transportMode: {
    client: require.resolve('./CustomClient'),
    server: require.resolve('./CustomServer'),
  },
};
```

### webpack-dev-server v4:

```js
// Example 1
module.exports = {
  devServer: {
    client: {
      transport: 'ws',
    },
    webSocketServer: 'ws',
  },
};

// Example 2
module.exports = {
  devServer: {
    client: {
      transport: require.resolve('./CustomClient'),
    },
    webSocketServer: require.resolve('./CustomServer'),
  },
};
```

## `warn`

`warn` was removed in favor of [ignoreWarnings](https://webpack.js.org/configuration/other-options/#ignorewarnings).

## `webpack-dev-middleware` options

The options related to webpack-dev-middleware(`fs`, `index`, `mimeTypes`, `publicPath`, `serverSideRender`, and `writeToDisk`) were moved to `devMiddleware` option.

### webpack-dev-server v3:

```js
module.exports = {
  devServer: {
    index: true,
    mimeTypes: { 'text/html': ['phtml'] },
    publicPath: '/publicPathForDevServe',
    serverSideRender: true,
    writeToDisk: true,
  },
};
```

### webpack-dev-server v4:

```js
module.exports = {
  devServer: {
    devMiddleware: {
      index: true,
      mimeTypes: { 'text/html': ['phtml'] },
      publicPath: '/publicPathForDevServe',
      serverSideRender: true,
      writeToDisk: true,
    },
  },
};
```
