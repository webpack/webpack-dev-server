# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.0.0-beta.2](https://github.com/webpack/webpack-dev-server/compare/v4.0.0-beta.1...v4.0.0-beta.2) (2021-04-06)


### ⚠ BREAKING CHANGES

* the `openPage` option and the `--open-page` CLI option were removed in favor `{ open: ['/my-page', '/my-other-page/'] }` for Node.js API and `--open-target [URL]` (without `[URL]` dev server will open a browser using the `host` option value) and `--open-app <browser>` for CLI
* the `useLocalIp` option was removed in favor `{ host: 'local-ip' }`, alternative you can provide values: `local-ipv4` for IPv4 and `local-ipv6` for IPv6
* `stdin` option was removed in favor `--watch-options-stdin`
* `injectClient` and `injectHot` was removed in favor `client.needClientEntry` and `client.needHotEntry`

### Features

* added the `watchFiles` option, now you can reload server on file changes, for example `{ watchFiles: ['src/**/*.php', 'public/**/*'] }` ([#3136](https://github.com/webpack/webpack-dev-server/issues/3136)) ([d73213a](https://github.com/webpack/webpack-dev-server/commit/d73213ab04b9cae38364a0c68dfc3bdfd8df227f))
* added more CLI options, please run `webpack server --help` ([#3148](https://github.com/webpack/webpack-dev-server/issues/3148)) ([03a2b27](https://github.com/webpack/webpack-dev-server/commit/03a2b27011098b6b98b3d20c4c46a949c4f05355))
* enable overlay by default ([#3108](https://github.com/webpack/webpack-dev-server/issues/3108)) ([5e05e48](https://github.com/webpack/webpack-dev-server/commit/5e05e48a56232038c1341f2c0deae3d35a1add47))
* you can specify multiple targets and browsers for the `open` option, i.e. `{ open: { target: ['/my-page', '/my-other-page'], app: ['google-chrome', '--incognito'] } }` ([e3c2683](https://github.com/webpack/webpack-dev-server/commit/e3c26835fae88a478baad477d537bd0ff1424db9))


### Bug Fixes

* `/webpack-dev-server` url shows list of files ([#3101](https://github.com/webpack/webpack-dev-server/issues/3101)) ([b3374c3](https://github.com/webpack/webpack-dev-server/commit/b3374c3ec2e07e4ba41e4ef40beaff5b9da2eccc))
* dev server client compatibility with `IE11`/`IE10`/`IE9` ([#3129](https://github.com/webpack/webpack-dev-server/issues/3129)) ([1e3e656](https://github.com/webpack/webpack-dev-server/commit/1e3e656b5871456a483401f829a4dd4e67d48863))

  * For `IE11`/`IE10` you need polyfill `fetch()` and `Promise`, example:
  
  ```js
  module.exports = {
    entry: {
      entry: [
        'whatwg-fetch', 
        'core-js/features/promise', 
        './entry.js'
      ],
    },
  };
  ```
  
  * For `IE9` you need polyfill `fetch()` and `Promise` and use `sockjs` for communications (because `WebSocket` is not supported), example:
  
  ```js
  module.exports = {
    entry: {
      entry: [
        'whatwg-fetch', 
        'core-js/features/promise', 
        './entry.js'
      ],
    },
    devServer: {
      transportMode: 'sockjs',
    },
  };
  ```
  
  IE8 is not supported

* hostname resolving ([#3128](https://github.com/webpack/webpack-dev-server/issues/3128)) ([cd39491](https://github.com/webpack/webpack-dev-server/commit/cd39491ea395c985f2014dfc03379db5c894f711))
* improve CLI options ([#3151](https://github.com/webpack/webpack-dev-server/issues/3151)) ([09fa827](https://github.com/webpack/webpack-dev-server/commit/09fa827c0abbce271fa70f3553b004ff64d16b32))
* output description on invalid options ([#3154](https://github.com/webpack/webpack-dev-server/issues/3154)) ([2e02978](https://github.com/webpack/webpack-dev-server/commit/2e02978f921ebdbda020f746f35c86048de9b2ee))
* prefer to open the `host` option ([#3115](https://github.com/webpack/webpack-dev-server/issues/3115)) ([7e525eb](https://github.com/webpack/webpack-dev-server/commit/7e525ebe35201996d047d14af05709b0b082ae7a))
* reduce number of `dependencies`

## [4.0.0-beta.1](https://github.com/webpack/webpack-dev-server/compare/v4.0.0-beta.0...v4.0.0-beta.1) (2021-03-23)


### ⚠ BREAKING CHANGES

* `--hot-only` option was removed
* default value of the `static` option is `path.resolve(process.cwd(), 'public')`, previously `path.resolve(process.cwd(), 'static')`
* the `overlay` option was moved into the `client` option

### Features

* add more negative flags - `--no-https`, `--no-http2`, `--no-compress` and `--no-history-api-fallback` ([#3070](https://github.com/webpack/webpack-dev-server/issues/3070)) ([ebc966f](https://github.com/webpack/webpack-dev-server/commit/ebc966f398c38c23c6d36b4be47f303ddfd29e7d))
* allow `Boolean` type for the `--firewall` option ([#3041](https://github.com/webpack/webpack-dev-server/issues/3041)) ([6711c1d](https://github.com/webpack/webpack-dev-server/commit/6711c1dd175820d781eac0cad6287582e8def950))
* improve output for localhost and fix open ([#2892](https://github.com/webpack/webpack-dev-server/issues/2892)) ([9e65c24](https://github.com/webpack/webpack-dev-server/commit/9e65c24214666241334b89c9e070f4d03bb0f317))
* improve output for IPv4 and IPv6 ([#3092](https://github.com/webpack/webpack-dev-server/issues/3092)) ([f362665](https://github.com/webpack/webpack-dev-server/commit/f3626654f7af58c159971b4059a741c25ce58249))


### Bug Fixes

* allow to open browser with `--open-page` ([#3032](https://github.com/webpack/webpack-dev-server/issues/3032)) ([581ee07](https://github.com/webpack/webpack-dev-server/commit/581ee07b0c511cabb6c531d8a680fdcdfafbc003))
* content security policy issue in client log ([2de2e01](https://github.com/webpack/webpack-dev-server/commit/2de2e010005f0424f872950abf6155b4aa9a1963))
* empty and multiple entries support ([#2920](https://github.com/webpack/webpack-dev-server/issues/2920)) ([45f6592](https://github.com/webpack/webpack-dev-server/commit/45f65923ac808d77a70b3fd695cf3deeab0b6585))
* improve descriptions for CLI options ([#3021](https://github.com/webpack/webpack-dev-server/issues/3021)) ([7d339d4](https://github.com/webpack/webpack-dev-server/commit/7d339d40a74842cbeae0b9c8ef20147af3a0f468))
* improve descriptions for negative flags ([#3029](https://github.com/webpack/webpack-dev-server/issues/3029)) ([2e2190a](https://github.com/webpack/webpack-dev-server/commit/2e2190a4c54ddebafc729857e5650772635a50ec))
* multi compiler mode with proxy ([#2905](https://github.com/webpack/webpack-dev-server/issues/2905)) ([247a92b](https://github.com/webpack/webpack-dev-server/commit/247a92b90c105a2e29432de4de8a32d147139c42))
* remove double brackets from the ws url when using raw IPv6 address ([#2951](https://github.com/webpack/webpack-dev-server/issues/2951)) ([2ec8160](https://github.com/webpack/webpack-dev-server/commit/2ec81605127cec82fae5064dd59da2798a628e02))
* show correct url in output status ([#3013](https://github.com/webpack/webpack-dev-server/issues/3013)) ([06b3d91](https://github.com/webpack/webpack-dev-server/commit/06b3d91918ed87c2b18f8df0ae4b6a5edee06137))
* show detailed error in overlay ([ba01b05](https://github.com/webpack/webpack-dev-server/commit/ba01b051d3455d99fa88a8dd3279e74e420b2f42))
* support `file:` and `chrome-extension:` protocols in client ([#2954](https://github.com/webpack/webpack-dev-server/issues/2954)) ([163bdce](https://github.com/webpack/webpack-dev-server/commit/163bdce5f067dd5bd1ed138b764657f8465586eb))
* warnings in overlay ([#3054](https://github.com/webpack/webpack-dev-server/issues/3054)) ([6144c8d](https://github.com/webpack/webpack-dev-server/commit/6144c8dabd144413d4e86bfb0cd9d82d7363fb9d))
* webpack-cli installation message ([#2955](https://github.com/webpack/webpack-dev-server/issues/2955)) ([b9ce07f](https://github.com/webpack/webpack-dev-server/commit/b9ce07fd83a53a1047c2f0f1f49d511aef2f7b29))


## [4.0.0-beta.0](https://github.com/webpack/webpack-dev-server/compare/v3.11.0...v4.0.0-beta.0) (2020-11-27)

### ⚠ BREAKING CHANGES

* drop support `Node.js@6` and `Node.js@8`, minimum supported `Node.js` version is `Node@10`
* the `hot` option is `true` by default
* the `hotOnly` option was removed, if you need hot only mode, use `hot: 'only'` value
* the default `transportMode` is switched from `sockjs` to `ws` (IE 11 and other old browsers doesn't support WebSocket, set `sockjs` value for `transportMode` if you need supports IE 11)
* `before`, `after` and `setup` were removed in favor `onBeforeSetupMiddleware` (previously `before`) and `onAfterSetupMiddleware` options (previously `after`)
* the `clientOptions` was renamed to the `client` option
* the `key`, `cert`, `pfx`, `pfx-passphrase`, `cacert`, `ca` and `requestCert` options were moved to `https` options, please use `https.{key|cert|pfx|passphrase|requestCert|cacert|ca|requestCert}`
* the `sockHost`, `sockPath` and `sockPort` options were removed in `client` option
* the `inline` option (`iframe` live mode) was removed
* the `lazy` and `filename` options were removed
* the `features` option was removed
* the `log`, `logLevel`, `logTime`, `noInfo`, `quiet`, `reporter` and `warn` options were removed in favor of built-in webpack logger, please read [this](https://webpack.js.org/configuration/other-options/#infrastructurelogginglevel) to enable and setup logging output
* the `fs`, `index`, `mimeTypes`, `publicPath`, `serverSideRender`, and `writeToDisk` options were moved in the `dev` option (`webpack-dev-middleware` options)
* updating `webpack-dev-middleware` to v4, which includes many breaking options changes, please [read](https://github.com/webpack/webpack-dev-middleware/releases)
* the `stats` option was removed, please use the [`stats`](https://webpack.js.org/configuration/stats/) option from `webpack.config.js`
* the `socket` option was removed
* the `contentBase`, `contentBasePublicPath`, `serveIndex`, `staticOptions`, `watchContentBase`, `watchOptions` were removed in favor of the `static` option
* the `disableHostCheck` and `allowedHosts` options were removed in favor of the `firewall` option
* `server.listen()` will find free port if the `port` is not set and the `port` argument is not passed, also print a warning if the `port` option and the `port` argument passed to `server.listen()` are different
* the `progress` option is moved to the `client` option, set `client: {progress: true}`
* the `profile` option was removed, to print profile data, set `client: { progress: 'profile' }`
* client uses the port of the current location (`location.port`, equivalent to `sockPort: 'location'`), by default. To get previously behavior, set the `client.port` with the port you'd like to set
* client uses the hostname of the current location (`location.hostname`), by default. To get previously behavior, set the `client.host` with the hostname you'd like to set

### Features

* compatibility with `webpack@5`
* compatibility with `webpack-cli@4`
* added the `setupExitSignals` option, it takes a boolean and if true (default on CLI), the server will close and exit the process on SIGINT and SIGTERM
* update `chokidar` to v3

### Notes

Unfortunately, due to the huge amount of changes it is very difficult to display all changes in a convenient form. Therefore, we offer you a couple of popular examples (feel free to send a PR with more examples).

#### `static`

Previously `contentBase`, `contentBasePublicPath`, `serveIndex`, `staticOptions`, `watchContentBase` and `watchOptions`

```js
module.exports = {
  // ...
  devServer: {
    // Can be:
    // static: path.resolve(__dirname, 'static')
    // static: false
    static: [
      // Simple example
      path.resolve(__dirname, 'static'),
      // Complex example
      {
        directory: path.resolve(__dirname, 'static'),
        staticOptions: {},
        // Don't be confused with `dev.publicPath`, it is `publicPath` for static directory
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
    ],
  },
};
```

#### `publicPath`

```js
module.exports = {
  // ...
  devServer: {
    dev: {
      publicPath: '/publicPathForDevServe',
    },
  },
};
```

#### `firewall`

Previously `disableHostCheck` and `allowedHosts`

```js
module.exports = {
  // ...
  devServer: {
    // Can be
    // firewall: ['192.168.0.1', 'domain.com']
    firewall: false,
  },
};
```

#### logging

```js
module.exports = {
  // ...
  infrastructureLogging: {
    // Only warnings and errors
    // level: 'none' disable logging
    // Please read https://webpack.js.org/configuration/other-options/#infrastructurelogginglevel
    level: 'warn',
  },
};
```

## [3.11.0](https://github.com/webpack/webpack-dev-server/compare/v3.10.3...v3.11.0) (2020-05-08)


### Features

* add icons for directory viewer ([#2441](https://github.com/webpack/webpack-dev-server/issues/2441)) ([e953d01](https://github.com/webpack/webpack-dev-server/commit/e953d01ca93764dabe38cedad8e7b9ef4e7f04bc))
* allow multiple `contentBasePublicPath` paths ([#2489](https://github.com/webpack/webpack-dev-server/issues/2489)) ([c6bdfe4](https://github.com/webpack/webpack-dev-server/commit/c6bdfe4afb2ce3612c02142954c68a8e657c3915))
* emit progress-update ([#2498](https://github.com/webpack/webpack-dev-server/issues/2498)) ([4808abd](https://github.com/webpack/webpack-dev-server/commit/4808abd434bac0511da688aee861f7e2d8b0c81c)), closes [#1666](https://github.com/webpack/webpack-dev-server/issues/1666)
* add invalidate endpoint ([#2493](https://github.com/webpack/webpack-dev-server/issues/2493)) ([89ffb86](https://github.com/webpack/webpack-dev-server/commit/89ffb86cd26425c59e3937ca06a2c804a01b8f1d))
* allow open option to accept an object ([#2492](https://github.com/webpack/webpack-dev-server/issues/2492)) ([adeb92e](https://github.com/webpack/webpack-dev-server/commit/adeb92e1e37551a6cbf3063942d6c2c7efbdff10))


### Bug Fixes

* do not swallow errors from server ([#2512](https://github.com/webpack/webpack-dev-server/issues/2512)) ([06583f2](https://github.com/webpack/webpack-dev-server/commit/06583f268b70f4a9715e4b747b1557055c419086))
* security vulnerability in yargs-parser ([#2566](https://github.com/webpack/webpack-dev-server/issues/2566)) ([41d1d0c](https://github.com/webpack/webpack-dev-server/commit/41d1d0cf99f53df0569991a85489d3c8bc095af5))
* don't crash on setupExitSignals(undefined) ([#2507](https://github.com/webpack/webpack-dev-server/issues/2507)) ([0d5c681](https://github.com/webpack/webpack-dev-server/commit/0d5c68143d780e631cdaf09081822fc87d7cb3ba))
* support entry descriptor (closes [#2453](https://github.com/webpack/webpack-dev-server/issues/2453)) ([#2465](https://github.com/webpack/webpack-dev-server/issues/2465)) ([8bbef6a](https://github.com/webpack/webpack-dev-server/commit/8bbef6adf6ae5f6a3109ecd4a6246223d2f77cb2))
* update jquery ([#2516](https://github.com/webpack/webpack-dev-server/issues/2516)) ([99ccfd8](https://github.com/webpack/webpack-dev-server/commit/99ccfd84d1db566aa4ed77c441c4674bc4e986df))

### [3.10.3](https://github.com/webpack/webpack-dev-server/compare/v3.10.2...v3.10.3) (2020-02-05)


### Bug Fixes

* forward error requests to the proxy ([#2425](https://github.com/webpack/webpack-dev-server/issues/2425)) ([e291cd4](https://github.com/webpack/webpack-dev-server/commit/e291cd4922f66c5c69dfd1fd3839812cfa502de5))

### [3.10.2](https://github.com/webpack/webpack-dev-server/compare/v3.10.0...v3.10.2) (2020-01-31)


### Bug Fixes

* fallthrough non `GET` and `HEAD` request to routes ([#2374](https://github.com/webpack/webpack-dev-server/issues/2374)) ([ebe8eca](https://github.com/webpack/webpack-dev-server/commit/ebe8eca37957a9009f8627e7dfb82699606846de))
* add an optional peer dependency on webpack-cli ([#2396](https://github.com/webpack/webpack-dev-server/issues/2396)) ([aa365df](https://github.com/webpack/webpack-dev-server/commit/aa365dfd7e86c5dca31304bd5dcfe9bb9b767b40))
* add heartbeat for the websocket server ([#2404](https://github.com/webpack/webpack-dev-server/issues/2404)) ([1a7c827](https://github.com/webpack/webpack-dev-server/commit/1a7c8273de5a5b164c63c9919950babd7ecfaadb))

### [3.10.1](https://github.com/webpack/webpack-dev-server/compare/v3.10.0...v3.10.1) (2019-12-19)


### Bug Fixes

* ie11 compatibility ([1306abe](https://github.com/webpack/webpack-dev-server/commit/1306abeb8c5fd125952cdc177fdf38c2c31b3c4f))

## [3.10.0](https://github.com/webpack/webpack-dev-server/compare/v3.9.0...v3.10.0) (2019-12-18)


### Features

* **client:** allow sock port to use location's port (`sockPort: 'location'`) ([#2341](https://github.com/webpack/webpack-dev-server/issues/2341)) ([dc10d06](https://github.com/webpack/webpack-dev-server/commit/dc10d0647413ad57814b684b5f6ef3659531f0f6))
* **server:** add `contentBasePublicPath` option ([#2150](https://github.com/webpack/webpack-dev-server/issues/2150)) ([cee700d](https://github.com/webpack/webpack-dev-server/commit/cee700d59aff644a499ee310c4a32d5c5693e559))


### Bug Fixes

* **client:** don't override protocol for socket connection to 127.0.0.1 ([#2303](https://github.com/webpack/webpack-dev-server/issues/2303)) ([3a31917](https://github.com/webpack/webpack-dev-server/commit/3a31917a02818dabb3dc549e3e4994618475d131)), closes [#2302](https://github.com/webpack/webpack-dev-server/issues/2302)
* **server:** respect sockPath on transportMode: 'ws' ([#2310](https://github.com/webpack/webpack-dev-server/issues/2310)) ([#2311](https://github.com/webpack/webpack-dev-server/issues/2311)) ([e188542](https://github.com/webpack/webpack-dev-server/commit/e188542d888dbb55be64c9da2f747343b73c319f))
* https on chrome linux ([#2330](https://github.com/webpack/webpack-dev-server/issues/2330)) ([dc8b475](https://github.com/webpack/webpack-dev-server/commit/dc8b47510e24649edb38e5a07579be389898189e))
* support webpack@5 ([#2359](https://github.com/webpack/webpack-dev-server/issues/2359)) ([8f89c01](https://github.com/webpack/webpack-dev-server/commit/8f89c0188579a419dc68021f8bc0fbeae70cbe5d))

## [3.9.0](https://github.com/webpack/webpack-dev-server/compare/v3.8.2...v3.9.0) (2019-10-22)


### Bug Fixes

* add `hostname` and `port` to bonjour name to prevent name collisions ([#2276](https://github.com/webpack/webpack-dev-server/issues/2276)) ([d8af2d9](https://github.com/webpack/webpack-dev-server/commit/d8af2d9))
* add `extKeyUsage` to self-signed cert ([#2274](https://github.com/webpack/webpack-dev-server/issues/2274)) ([a4dbc3b](https://github.com/webpack/webpack-dev-server/commit/a4dbc3b))


### Features

* add multiple `openPage` support ([#2266](https://github.com/webpack/webpack-dev-server/issues/2266)) ([c9e9178](https://github.com/webpack/webpack-dev-server/commit/c9e9178))

### [3.8.2](https://github.com/webpack/webpack-dev-server/compare/v3.8.1...v3.8.2) (2019-10-02)

### Security

* update `selfsigned` package

### [3.8.1](https://github.com/webpack/webpack-dev-server/compare/v3.8.0...v3.8.1) (2019-09-16)


### Bug Fixes

* add null check for connection.headers ([#2200](https://github.com/webpack/webpack-dev-server/issues/2200)) ([7964997](https://github.com/webpack/webpack-dev-server/commit/7964997))
* false positive for an absolute path in the `ContentBase` option on windows ([#2202](https://github.com/webpack/webpack-dev-server/issues/2202)) ([68ecf78](https://github.com/webpack/webpack-dev-server/commit/68ecf78))
* add status in quiet log level ([#2235](https://github.com/webpack/webpack-dev-server/issues/2235)) ([7e2224e](https://github.com/webpack/webpack-dev-server/commit/7e2224e))
* scriptHost in client ([#2246](https://github.com/webpack/webpack-dev-server/issues/2246)) ([00903f6](https://github.com/webpack/webpack-dev-server/commit/00903f6))

## [3.8.0](https://github.com/webpack/webpack-dev-server/compare/v3.7.2...v3.8.0) (2019-08-09)


### Bug Fixes

* **server:** fix setupExitSignals usage ([#2181](https://github.com/webpack/webpack-dev-server/issues/2181)) ([bbe410e](https://github.com/webpack/webpack-dev-server/commit/bbe410e))
* **server:** set port before instantiating server ([#2143](https://github.com/webpack/webpack-dev-server/issues/2143)) ([cfbf229](https://github.com/webpack/webpack-dev-server/commit/cfbf229))
* check for name of HotModuleReplacementPlugin to avoid RangeError ([#2146](https://github.com/webpack/webpack-dev-server/issues/2146)) ([4579775](https://github.com/webpack/webpack-dev-server/commit/4579775))
* **server:** check for external urls in array ([#1980](https://github.com/webpack/webpack-dev-server/issues/1980)) ([fa78347](https://github.com/webpack/webpack-dev-server/commit/fa78347))
* **server:** fix header check for socket server ([#2077](https://github.com/webpack/webpack-dev-server/issues/2077)) ([7f51859](https://github.com/webpack/webpack-dev-server/commit/7f51859))
* **server:** stricter headers security check ([#2092](https://github.com/webpack/webpack-dev-server/issues/2092)) ([078ddca](https://github.com/webpack/webpack-dev-server/commit/078ddca))


### Features

* **server:** add transportMode ([#2116](https://github.com/webpack/webpack-dev-server/issues/2116)) ([b5b9cb4](https://github.com/webpack/webpack-dev-server/commit/b5b9cb4))
* **server:** serverMode 'ws' option ([#2082](https://github.com/webpack/webpack-dev-server/issues/2082)) ([04483f4](https://github.com/webpack/webpack-dev-server/commit/04483f4))
* **server/client:** made progress option available to API ([#1961](https://github.com/webpack/webpack-dev-server/issues/1961)) ([56274e4](https://github.com/webpack/webpack-dev-server/commit/56274e4))

### Potential Breaking changes

We have migrated `serverMode` and `clientMode` to `transportMode` as an experimental option. If you want to use this feature, you have to change your settings. 

Related PR: https://github.com/webpack/webpack-dev-server/pull/2116


### [3.7.2](https://github.com/webpack/webpack-dev-server/compare/v3.7.1...v3.7.2) (2019-06-17)


### Bug Fixes

* **client:** add default fallback for client ([#2015](https://github.com/webpack/webpack-dev-server/issues/2015)) ([d26b444](https://github.com/webpack/webpack-dev-server/commit/d26b444))
* **open:** set `wait: false` to run server.close successfully ([#2001](https://github.com/webpack/webpack-dev-server/issues/2001)) ([2b4cb52](https://github.com/webpack/webpack-dev-server/commit/2b4cb52))
* **test:** fixed ProvidePlugin.test.js ([#2002](https://github.com/webpack/webpack-dev-server/issues/2002)) ([47453cb](https://github.com/webpack/webpack-dev-server/commit/47453cb))



### [3.7.1](https://github.com/webpack/webpack-dev-server/compare/v3.7.0...v3.7.1) (2019-06-07)


### Bug Fixes

* retry finding port when port is null and get ports in sequence ([#1993](https://github.com/webpack/webpack-dev-server/issues/1993)) ([bc57514](https://github.com/webpack/webpack-dev-server/commit/bc57514))



## [3.7.0](https://github.com/webpack/webpack-dev-server/compare/v3.6.0...v3.7.0) (2019-06-06)


### Bug Fixes

* change clientLogLevel order to be called first ([#1973](https://github.com/webpack/webpack-dev-server/issues/1973)) ([57c8c92](https://github.com/webpack/webpack-dev-server/commit/57c8c92))
* es6 syntax in client ([#1982](https://github.com/webpack/webpack-dev-server/issues/1982)) ([802aa30](https://github.com/webpack/webpack-dev-server/commit/802aa30))



## [3.6.0](https://github.com/webpack/webpack-dev-server/compare/v3.5.1...v3.6.0) (2019-06-05)


### Bug Fixes

* **config:** enable `--overlay` ([#1968](https://github.com/webpack/webpack-dev-server/issues/1968)) ([dc81e23](https://github.com/webpack/webpack-dev-server/commit/dc81e23))
* **server:** don't ignore node_modules by default ([#1970](https://github.com/webpack/webpack-dev-server/issues/1970)) ([699f8b4](https://github.com/webpack/webpack-dev-server/commit/699f8b4)), closes [#1794](https://github.com/webpack/webpack-dev-server/issues/1794)


### Features

* **server:** add serverMode option ([#1937](https://github.com/webpack/webpack-dev-server/issues/1937)) ([44a8cde](https://github.com/webpack/webpack-dev-server/commit/44a8cde))



### [3.5.1](https://github.com/webpack/webpack-dev-server/compare/v3.5.0...v3.5.1) (2019-06-01)


### Bug Fixes

* allow passing promise function of webpack.config.js ([#1947](https://github.com/webpack/webpack-dev-server/issues/1947)) ([8cf1053](https://github.com/webpack/webpack-dev-server/commit/8cf1053))



## [3.5.0](https://github.com/webpack/webpack-dev-server/compare/v3.4.1...v3.5.0) (2019-05-31)


### Bug Fixes

* add client code for `electron-renderer` target ([#1935](https://github.com/webpack/webpack-dev-server/issues/1935)) ([9297988](https://github.com/webpack/webpack-dev-server/commit/9297988))
* add client code for `node-webkit` target ([#1942](https://github.com/webpack/webpack-dev-server/issues/1942)) ([c6b2b1f](https://github.com/webpack/webpack-dev-server/commit/c6b2b1f))


### Features

* **server:** `onListening` option ([#1930](https://github.com/webpack/webpack-dev-server/issues/1930)) ([61d0cdf](https://github.com/webpack/webpack-dev-server/commit/61d0cdf))
* **server:** add callback support for invalidate ([#1900](https://github.com/webpack/webpack-dev-server/issues/1900)) ([cd218ef](https://github.com/webpack/webpack-dev-server/commit/cd218ef))
* **server:** add `WEBPACK_DEV_SERVER` env variable ([#1929](https://github.com/webpack/webpack-dev-server/issues/1929)) ([856169e](https://github.com/webpack/webpack-dev-server/commit/856169e))



### [3.4.1](https://github.com/webpack/webpack-dev-server/compare/v3.4.0...v3.4.1) (2019-05-17)


### Bug Fixes

* add none and warning to clientLogLevel ([#1901](https://github.com/webpack/webpack-dev-server/issues/1901)) ([0ae9be8](https://github.com/webpack/webpack-dev-server/commit/0ae9be8))
* broken hot reload ([#1903](https://github.com/webpack/webpack-dev-server/issues/1903)) ([6a444cd](https://github.com/webpack/webpack-dev-server/commit/6a444cd))



## [3.4.0](https://github.com/webpack/webpack-dev-server/compare/v3.3.1...v3.4.0) (2019-05-17)


### Bug Fixes

* don't use self.location.port ([#1838](https://github.com/webpack/webpack-dev-server/issues/1838)) ([6d31984](https://github.com/webpack/webpack-dev-server/commit/6d31984))
* do not include config files in dist ([#1883](https://github.com/webpack/webpack-dev-server/issues/1883)) ([c535bb2](https://github.com/webpack/webpack-dev-server/commit/c535bb2))
* only add client entry to web targets ([#1775](https://github.com/webpack/webpack-dev-server/issues/1775)) ([cf4d0d0](https://github.com/webpack/webpack-dev-server/commit/cf4d0d0))
* update clientLogLevel to match docs and error ([#1825](https://github.com/webpack/webpack-dev-server/issues/1825)) ([7f52bbf](https://github.com/webpack/webpack-dev-server/commit/7f52bbf))
* add errors-warnings preset ([#1895](https://github.com/webpack/webpack-dev-server/issues/1895)) ([2a81ad2](https://github.com/webpack/webpack-dev-server/commit/2a81ad2))


### Features

* added injectClient option ([#1775](https://github.com/webpack/webpack-dev-server/issues/1775)) ([cf4d0d0](https://github.com/webpack/webpack-dev-server/commit/cf4d0d0))
* added injectHot option ([#1775](https://github.com/webpack/webpack-dev-server/issues/1775)) ([cf4d0d0](https://github.com/webpack/webpack-dev-server/commit/cf4d0d0))
* added sockPort option ([#1792](https://github.com/webpack/webpack-dev-server/issues/1792)) ([58d1682](https://github.com/webpack/webpack-dev-server/commit/58d1682))
* added sockHost option ([#1858](https://github.com/webpack/webpack-dev-server/issues/1858)) ([f47dff2](https://github.com/webpack/webpack-dev-server/commit/f47dff2))
* support HEAD method ([#1875](https://github.com/webpack/webpack-dev-server/issues/1875)) ([c2360e4](https://github.com/webpack/webpack-dev-server/commit/c2360e4))
* added liveReload option ([#1889](https://github.com/webpack/webpack-dev-server/issues/1889)) ([fc4fe32](https://github.com/webpack/webpack-dev-server/commit/fc4fe32))
* update express to 4.17 version


## [3.3.1](https://github.com/webpack/webpack-dev-server/compare/v3.3.0...v3.3.1) (2019-04-09)


### Bug Fixes

* **regression:** always get necessary stats for hmr ([#1780](https://github.com/webpack/webpack-dev-server/issues/1780)) ([66b04a9](https://github.com/webpack/webpack-dev-server/commit/66b04a9))
* **regression:** host and port can be undefined or null ([#1779](https://github.com/webpack/webpack-dev-server/issues/1779)) ([028ceee](https://github.com/webpack/webpack-dev-server/commit/028ceee))
* only add entries after compilers have been created ([#1774](https://github.com/webpack/webpack-dev-server/issues/1774)) ([b31cbaa](https://github.com/webpack/webpack-dev-server/commit/b31cbaa))



# [3.3.0](https://github.com/webpack/webpack-dev-server/compare/v3.2.1...v3.3.0) (2019-04-08)


### Bug Fixes

* compatibility with webpack-cli@3.3 ([#1754](https://github.com/webpack/webpack-dev-server/issues/1754)) ([fd7cb0d](https://github.com/webpack/webpack-dev-server/commit/fd7cb0d))
* ignore proxy when bypass return false ([#1696](https://github.com/webpack/webpack-dev-server/issues/1696)) ([aa7de77](https://github.com/webpack/webpack-dev-server/commit/aa7de77))
* respect stats option from webpack config ([#1665](https://github.com/webpack/webpack-dev-server/issues/1665)) ([efaa740](https://github.com/webpack/webpack-dev-server/commit/efaa740))
* use location.port when location.hostname is used to infer HMR socket URL ([#1664](https://github.com/webpack/webpack-dev-server/issues/1664)) ([2f7f052](https://github.com/webpack/webpack-dev-server/commit/2f7f052))
* don't crash with express.static.mime.types ([#1765](https://github.com/webpack/webpack-dev-server/issues/1765)) ([919ff77](https://github.com/webpack/webpack-dev-server/commit/919ff77))


### Features

* add option "serveIndex" to enable/disable serveIndex middleware ([#1752](https://github.com/webpack/webpack-dev-server/issues/1752)) ([d5d60cb](https://github.com/webpack/webpack-dev-server/commit/d5d60cb))
* add webpack as argument to before and after options ([#1760](https://github.com/webpack/webpack-dev-server/issues/1760)) ([0984d4b](https://github.com/webpack/webpack-dev-server/commit/0984d4b))
* http2 option to enable/disable HTTP/2 with HTTPS ([#1721](https://github.com/webpack/webpack-dev-server/issues/1721)) ([dcd2434](https://github.com/webpack/webpack-dev-server/commit/dcd2434))
* random port retry logic ([#1692](https://github.com/webpack/webpack-dev-server/issues/1692)) ([419f02e](https://github.com/webpack/webpack-dev-server/commit/419f02e))
* relax depth limit from chokidar for content base ([#1697](https://github.com/webpack/webpack-dev-server/issues/1697)) ([7ea9ab9](https://github.com/webpack/webpack-dev-server/commit/7ea9ab9))



## [3.2.1](https://github.com/webpack/webpack-dev-server/compare/v3.2.0...v3.2.1) (2019-02-25)


### Bug Fixes

* deprecation message about `setup` now warning about `v4` ([#1684](https://github.com/webpack/webpack-dev-server/issues/1684)) ([523a6ec](https://github.com/webpack/webpack-dev-server/commit/523a6ec))
* **regression:** allow `ca`, `key` and `cert` will be string ([#1676](https://github.com/webpack/webpack-dev-server/issues/1676)) ([b8d5c1e](https://github.com/webpack/webpack-dev-server/commit/b8d5c1e))
* **regression:** handle `key`, `cert`, `cacert` and `pfx` in CLI ([#1688](https://github.com/webpack/webpack-dev-server/issues/1688)) ([4b2076c](https://github.com/webpack/webpack-dev-server/commit/4b2076c))
* **regression:** problem with `idb-connector` after update `internal-ip` ([#1691](https://github.com/webpack/webpack-dev-server/issues/1691)) ([eb48691](https://github.com/webpack/webpack-dev-server/commit/eb48691))



<a name="3.1.14"></a>
## [3.1.14](https://github.com/webpack/webpack-dev-server/compare/v3.1.13...v3.1.14) (2018-12-24)


### Bug Fixes

* add workaround for Origin header in sockjs ([#1608](https://github.com/webpack/webpack-dev-server/issues/1608)) ([1dfd4fb](https://github.com/webpack/webpack-dev-server/commit/1dfd4fb))



<a name="3.1.13"></a>
## [3.1.13](https://github.com/webpack/webpack-dev-server/compare/v3.1.12...v3.1.13) (2018-12-22)


### Bug Fixes

* delete a comma for Node.js <= v7.x ([#1609](https://github.com/webpack/webpack-dev-server/issues/1609)) ([0bab1c0](https://github.com/webpack/webpack-dev-server/commit/0bab1c0))



<a name="3.1.12"></a>
## [3.1.12](https://github.com/webpack/webpack-dev-server/compare/v3.1.11...v3.1.12) (2018-12-22)


### Bug Fixes

* regression in `checkHost` for checking Origin header ([#1606](https://github.com/webpack/webpack-dev-server/issues/1606)) ([8bb3ca8](https://github.com/webpack/webpack-dev-server/commit/8bb3ca8))



<a name="3.1.11"></a>
## [3.1.11](https://github.com/webpack/webpack-dev-server/compare/v3.1.10...v3.1.11) (2018-12-21)


### Bug Fixes

* **bin/options:** correct check for color support (`options.color`) ([#1555](https://github.com/webpack/webpack-dev-server/issues/1555)) ([55398b5](https://github.com/webpack/webpack-dev-server/commit/55398b5))
* **package:** update `spdy` v3.4.1...4.0.0 (assertion error) ([#1491](https://github.com/webpack/webpack-dev-server/issues/1491)) ([#1563](https://github.com/webpack/webpack-dev-server/issues/1563)) ([7a3a257](https://github.com/webpack/webpack-dev-server/commit/7a3a257))
* **Server:** correct `node` version checks ([#1543](https://github.com/webpack/webpack-dev-server/issues/1543)) ([927a2b3](https://github.com/webpack/webpack-dev-server/commit/927a2b3))
* **Server:** mime type for wasm in contentBase directory ([#1575](https://github.com/webpack/webpack-dev-server/issues/1575)) ([#1580](https://github.com/webpack/webpack-dev-server/issues/1580)) ([fadae5d](https://github.com/webpack/webpack-dev-server/commit/fadae5d))
* add url for compatibility with webpack@5 ([#1598](https://github.com/webpack/webpack-dev-server/issues/1598)) ([#1599](https://github.com/webpack/webpack-dev-server/issues/1599)) ([68dd49a](https://github.com/webpack/webpack-dev-server/commit/68dd49a))
* check origin header for websocket connection ([#1603](https://github.com/webpack/webpack-dev-server/issues/1603)) ([b3217ca](https://github.com/webpack/webpack-dev-server/commit/b3217ca))



<a name="3.1.10"></a>
## [3.1.10](https://github.com/webpack/webpack-dev-server/compare/v3.1.9...v3.1.10) (2018-10-23)


### Bug Fixes

* **options:** add `writeToDisk` option to schema ([#1520](https://github.com/webpack/webpack-dev-server/issues/1520)) ([d2f4902](https://github.com/webpack/webpack-dev-server/commit/d2f4902))
* **package:** update `sockjs-client` v1.1.5...1.3.0 (`url-parse` vulnerability) ([#1537](https://github.com/webpack/webpack-dev-server/issues/1537)) ([e719959](https://github.com/webpack/webpack-dev-server/commit/e719959))
* **Server:** set `tls.DEFAULT_ECDH_CURVE` to `'auto'` ([#1531](https://github.com/webpack/webpack-dev-server/issues/1531)) ([c12def3](https://github.com/webpack/webpack-dev-server/commit/c12def3))



<a name="3.1.9"></a>
## [3.1.9](https://github.com/webpack/webpack-dev-server/compare/v3.1.8...v3.1.9) (2018-09-24)



<a name="3.1.8"></a>
## [3.1.8](https://github.com/webpack/webpack-dev-server/compare/v3.1.7...v3.1.8) (2018-09-06)


### Bug Fixes

* **package:** `yargs` security vulnerability (`dependencies`) ([#1492](https://github.com/webpack/webpack-dev-server/issues/1492)) ([8fb67c9](https://github.com/webpack/webpack-dev-server/commit/8fb67c9))
* **utils/createLogger:** ensure `quiet` always takes precedence (`options.quiet`) ([#1486](https://github.com/webpack/webpack-dev-server/issues/1486)) ([7a6ca47](https://github.com/webpack/webpack-dev-server/commit/7a6ca47))



<a name="3.1.7"></a>
## [3.1.7](https://github.com/webpack/webpack-dev-server/compare/v3.1.6...v3.1.7) (2018-08-29)


### Bug Fixes

* **Server:** don't use `spdy` on `node >= v10.0.0` ([#1451](https://github.com/webpack/webpack-dev-server/issues/1451)) ([8ab9eb6](https://github.com/webpack/webpack-dev-server/commit/8ab9eb6))



<a name="3.1.6"></a>
## [3.1.6](https://github.com/webpack/webpack-dev-server/compare/v3.1.5...v3.1.6) (2018-08-26)


### Bug Fixes

* **bin:** handle `process` signals correctly when the server isn't ready yet ([#1432](https://github.com/webpack/webpack-dev-server/issues/1432)) ([334c3a5](https://github.com/webpack/webpack-dev-server/commit/334c3a5))
* **examples/cli:** correct template path in `open-page` example ([#1401](https://github.com/webpack/webpack-dev-server/issues/1401)) ([df30727](https://github.com/webpack/webpack-dev-server/commit/df30727))
* **schema:** allow the `output` filename to be a `{Function}` ([#1409](https://github.com/webpack/webpack-dev-server/issues/1409)) ([e2220c4](https://github.com/webpack/webpack-dev-server/commit/e2220c4))
