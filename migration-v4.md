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
