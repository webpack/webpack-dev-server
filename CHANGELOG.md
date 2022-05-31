# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [4.9.1](https://github.com/webpack/webpack-dev-server/compare/v4.9.0...v4.9.1) (2022-05-31)


### Bug Fixes

* security problem with sockjs ([#4465](https://github.com/webpack/webpack-dev-server/issues/4465)) ([e765182](https://github.com/webpack/webpack-dev-server/commit/e765182e426cbca9c3c09294b02ac2d9737c1d74))

## [4.9.0](https://github.com/webpack/webpack-dev-server/compare/v4.8.1...v4.9.0) (2022-05-04)


### Features

* support Trusted Types for client overlay ([#4404](https://github.com/webpack/webpack-dev-server/issues/4404)) ([8132e1d](https://github.com/webpack/webpack-dev-server/commit/8132e1d029badab7b1e836f8f240844c2d843ecc))


### Bug Fixes

* ie11 runtime ([#4403](https://github.com/webpack/webpack-dev-server/issues/4403)) ([256d5fb](https://github.com/webpack/webpack-dev-server/commit/256d5fb5fea7ee5a6683f77ea347ac79816ad639))
* replace portfinder with custom implementation and fix security problem ([#4384](https://github.com/webpack/webpack-dev-server/issues/4384)) ([eea50f3](https://github.com/webpack/webpack-dev-server/commit/eea50f342e3090483f6da4932b84ed52bba44c58))
* use the host in options to check if port is available ([#4385](https://github.com/webpack/webpack-dev-server/issues/4385)) ([a10c7cf](https://github.com/webpack/webpack-dev-server/commit/a10c7cfd290d29384d14405d7cf79e105c7b5d15))

### [4.8.1](https://github.com/webpack/webpack-dev-server/compare/v4.8.0...v4.8.1) (2022-04-06)


### Bug Fixes

* types ([#4373](https://github.com/webpack/webpack-dev-server/issues/4373)) ([f6fe6be](https://github.com/webpack/webpack-dev-server/commit/f6fe6be27656c9cc1e65a894a889d7443be7e6a8))

## [4.8.0](https://github.com/webpack/webpack-dev-server/compare/v4.7.4...v4.8.0) (2022-04-05)


### Features

* export initialized socket client ([#4304](https://github.com/webpack/webpack-dev-server/issues/4304)) ([7920364](https://github.com/webpack/webpack-dev-server/commit/7920364d6b6ac29e1b7fdbb38c8a9fe22eec61de))


### Bug Fixes

* update description for `--no-client-reconnect` ([#4248](https://github.com/webpack/webpack-dev-server/issues/4248)) ([317648d](https://github.com/webpack/webpack-dev-server/commit/317648df21562f9dfe1b9f8069642b91ac3bffae))
* update description for `--no-client` ([#4250](https://github.com/webpack/webpack-dev-server/issues/4250)) ([c3b6690](https://github.com/webpack/webpack-dev-server/commit/c3b669077089802412774079f38a13bce054eee7))
* update description for `--no-history-api-fallback` ([#4277](https://github.com/webpack/webpack-dev-server/issues/4277)) ([d63a0a2](https://github.com/webpack/webpack-dev-server/commit/d63a0a298739d599f2161b237a750220c314deef))
* update negated descriptions for more options ([#4287](https://github.com/webpack/webpack-dev-server/issues/4287)) ([c64bd94](https://github.com/webpack/webpack-dev-server/commit/c64bd94fb75c30984281f71ad3c20393fcb5ee67))
* update schema to have `negatedDescription` only for type `boolean` ([#4280](https://github.com/webpack/webpack-dev-server/issues/4280)) ([fcf8e8e](https://github.com/webpack/webpack-dev-server/commit/fcf8e8e6a9951f4283e796df3ad72cc803e634a3))

### [4.7.4](https://github.com/webpack/webpack-dev-server/compare/v4.7.3...v4.7.4) (2022-02-02)


### Bug Fixes

* add @types/express ([#4226](https://github.com/webpack/webpack-dev-server/issues/4226)) ([e55f728](https://github.com/webpack/webpack-dev-server/commit/e55f728d3b5262884aa80daf9b021198b4bc65a9))
* negative descriptions ([#4216](https://github.com/webpack/webpack-dev-server/issues/4216)) ([fd854c0](https://github.com/webpack/webpack-dev-server/commit/fd854c07c2a4654f479bdbad1b717d9406ce15c6))
* types for the `proxy` option ([#4173](https://github.com/webpack/webpack-dev-server/issues/4173)) ([efec2f5](https://github.com/webpack/webpack-dev-server/commit/efec2f5bfb5ff4b99258b12317aa0d922836738e))
* use CLI specific description for `--open-app-name` and `--web-socket-server` ([#4215](https://github.com/webpack/webpack-dev-server/issues/4215)) ([329679a](https://github.com/webpack/webpack-dev-server/commit/329679a434219adc43f2d73c2ceeda14787dc64d))

### [4.7.3](https://github.com/webpack/webpack-dev-server/compare/v4.7.2...v4.7.3) (2022-01-11)

### Security

* update `selfsigned` to `2.0.0` version

### [4.7.2](https://github.com/webpack/webpack-dev-server/compare/v4.7.1...v4.7.2) (2021-12-29)


### Bug Fixes

* apply `onAfterSetupMiddleware` after `setupMiddlewares` (as behavior earlier) ([f6bc644](https://github.com/webpack/webpack-dev-server/commit/f6bc644bb81b966e030d8f8a54d5a99cd61ec8f2))

### [4.7.1](https://github.com/webpack/webpack-dev-server/compare/v4.7.0...v4.7.1) (2021-12-22)


### Bug Fixes

* removed `url` package, fixed compatibility with future webpack defaults ([#4132](https://github.com/webpack/webpack-dev-server/issues/4132)) ([4e5d8ea](https://github.com/webpack/webpack-dev-server/commit/4e5d8eae654ef382697722c6406dbc96207594aa))

## [4.7.0](https://github.com/webpack/webpack-dev-server/compare/v4.6.0...v4.7.0) (2021-12-21)


### Features

* added the `setupMiddlewares` option and deprecated `onAfterSetupMiddleware` and `onBeforeSetupMiddleware` options ([#4068](https://github.com/webpack/webpack-dev-server/issues/4068)) ([c13aa56](https://github.com/webpack/webpack-dev-server/commit/c13aa560651a3bb4c4a7b1b4363c04383596c7e9))
* added types ([8f02c3f](https://github.com/webpack/webpack-dev-server/commit/8f02c3f3d6131fd37f58ef4d5cbe15578c94a6fd))
* show deprecation warning for `cacert` option ([#4115](https://github.com/webpack/webpack-dev-server/issues/4115)) ([c73ddfb](https://github.com/webpack/webpack-dev-server/commit/c73ddfb934ec748e3dd34456d4293b933e9c6c99))


### Bug Fixes

* add description for `watchFiles` options ([#4057](https://github.com/webpack/webpack-dev-server/issues/4057)) ([75f3817](https://github.com/webpack/webpack-dev-server/commit/75f381751e5377ae297c32f9fcdcd096ef28c5c2))
* allow passing options for custom server ([#4110](https://github.com/webpack/webpack-dev-server/issues/4110)) ([fc8bed9](https://github.com/webpack/webpack-dev-server/commit/fc8bed95251f27a24c1441307c44782f3836edd6))
* correct schema for `ClientLogging` ([#4084](https://github.com/webpack/webpack-dev-server/issues/4084)) ([9b7ae7b](https://github.com/webpack/webpack-dev-server/commit/9b7ae7b5f4ac4a920b1ae3b47a8eb15d093cb369))
* mark `--open-app` deprecated in favor of `--open-app-name` ([#4091](https://github.com/webpack/webpack-dev-server/issues/4091)) ([693c28a](https://github.com/webpack/webpack-dev-server/commit/693c28a0499e431b09274b8b7ecce71adb292c8f))
* show deprecation warning for both `https` and `http2` ([#4069](https://github.com/webpack/webpack-dev-server/issues/4069)) ([d8d5d71](https://github.com/webpack/webpack-dev-server/commit/d8d5d71c8ca495098e1ee30ebc72ffd657ad5ba0))
* update `--web-socket-server` description ([#4098](https://github.com/webpack/webpack-dev-server/issues/4098)) ([65955e9](https://github.com/webpack/webpack-dev-server/commit/65955e96cf7869dd4294699fd2a3878c2179c656))
* update `listen` and `close` deprecation warning message ([#4097](https://github.com/webpack/webpack-dev-server/issues/4097)) ([b217a19](https://github.com/webpack/webpack-dev-server/commit/b217a191d09a93e8dcc1fff2ee26e97857e096d3))
* update descriptions of `https` and `server` options ([#4094](https://github.com/webpack/webpack-dev-server/issues/4094)) ([f97c9e2](https://github.com/webpack/webpack-dev-server/commit/f97c9e2df460ef9a84c8ab2016c6bce3c90d93ac))

## [4.6.0](https://github.com/webpack/webpack-dev-server/compare/v4.5.0...v4.6.0) (2021-11-25)


### Features

* allow to pass all `chokidar` options ([#4025](https://github.com/webpack/webpack-dev-server/issues/4025)) ([5026601](https://github.com/webpack/webpack-dev-server/commit/5026601bd670eb65bdddabc208ec9ae73a58e592))


### Bug Fixes

* reconnection logic ([#4044](https://github.com/webpack/webpack-dev-server/issues/4044)) ([9b32c96](https://github.com/webpack/webpack-dev-server/commit/9b32c968fd96a57f5bab36416f79e649ab3a4a2c))
* reload on warnings ([#4056](https://github.com/webpack/webpack-dev-server/issues/4056)) ([1ba9720](https://github.com/webpack/webpack-dev-server/commit/1ba97201f71b8a5b8f67281059f4834e55bf8f67))

## [4.5.0](https://github.com/webpack/webpack-dev-server/compare/v4.4.0...v4.5.0) (2021-11-13)


### Features

* add `--web-socket-server-type` option for CLI ([#4001](https://github.com/webpack/webpack-dev-server/issues/4001)) ([17c390a](https://github.com/webpack/webpack-dev-server/commit/17c390a04e474a675255eb25132b423e0614253f))
* show deprecation warning for `https`/`http2` option, [migration guide for `https`](https://github.com/webpack/webpack-dev-server/tree/master/examples/server/https) and [migration guide for `http2`](https://github.com/webpack/webpack-dev-server/tree/master/examples/server/spdy) (because we use [`spdy`](https://github.com/spdy-http2/node-spdy) for http2 due `express` doesn't support http2) ([#4003](https://github.com/webpack/webpack-dev-server/issues/4003)) ([521cf85](https://github.com/webpack/webpack-dev-server/commit/521cf852a81c5913e17cf36c90140c566d4218e5))


### Bug Fixes

* infinity refresh on warnings ([#4006](https://github.com/webpack/webpack-dev-server/issues/4006)) ([10da223](https://github.com/webpack/webpack-dev-server/commit/10da2238b0fce26973160ef03ba0dd35d5bc0568))
* invalid host message is missing on client with https ([#3997](https://github.com/webpack/webpack-dev-server/issues/3997)) ([#3998](https://github.com/webpack/webpack-dev-server/issues/3998)) ([ff0869c](https://github.com/webpack/webpack-dev-server/commit/ff0869cb08cd886ed5b1f8265736d514358c7305))
* remove process listeners after stopping the server ([#4013](https://github.com/webpack/webpack-dev-server/issues/4013)) ([d198e4e](https://github.com/webpack/webpack-dev-server/commit/d198e4e138c194427af596663c129515353db9c4))

## [4.4.0](https://github.com/webpack/webpack-dev-server/compare/v4.3.1...v4.4.0) (2021-10-27)


### Features

* added the `server` option, now you can pass server options, example `{ server: { type: 'http', options: { maxHeaderSize: 32768 } } }`, available options for [`http`](https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener) and [`https`](https://nodejs.org/api/https.html#httpscreateserveroptions-requestlistener), note - for `http2` is used [`spdy`](https://github.com/spdy-http2/node-spdy), options specified in the `server.options` option take precedence over `https`/`http2` options ([#3940](https://github.com/webpack/webpack-dev-server/issues/3940)) ([a70a7ef](https://github.com/webpack/webpack-dev-server/commit/a70a7ef025f07ec6be69cee0b3b5204c7e3a0c5b))
* added the `client.reconnect` option ([#3912](https://github.com/webpack/webpack-dev-server/issues/3912)) ([5edad76](https://github.com/webpack/webpack-dev-server/commit/5edad76bb099713210b2a8c5c29d22371df7371e))
* improve error handling within `startCallback` and `endCallback` ([#3969](https://github.com/webpack/webpack-dev-server/issues/3969)) ([b0928ac](https://github.com/webpack/webpack-dev-server/commit/b0928acadccd2251a9eb165bfae0c63c84d0d745))


### Bug Fixes

* schema for web socket server type ([#3913](https://github.com/webpack/webpack-dev-server/issues/3913)) ([f6aa6f7](https://github.com/webpack/webpack-dev-server/commit/f6aa6f7979dae5a44ff4597b7338027c5aab869a))
* typo in SSL information log ([#3939](https://github.com/webpack/webpack-dev-server/issues/3939)) ([4c6103b](https://github.com/webpack/webpack-dev-server/commit/4c6103ba9495a29c6e142373c8dad084a20b6bc8))

### [4.3.1](https://github.com/webpack/webpack-dev-server/compare/v4.3.0...v4.3.1) (2021-10-04)


### Bug Fixes

* perf ([#3906](https://github.com/webpack/webpack-dev-server/issues/3906)) ([f6e2a19](https://github.com/webpack/webpack-dev-server/commit/f6e2a1981d4c552368cd06ccf5dc400db298c2d6))

## [4.3.0](https://github.com/webpack/webpack-dev-server/compare/v4.2.1...v4.3.0) (2021-09-25)


### Features

* allow array for `headers` option ([#3847](https://github.com/webpack/webpack-dev-server/issues/3847)) ([9911437](https://github.com/webpack/webpack-dev-server/commit/9911437186a28b2249adfb282524361d7afe6c25))
* gracefully and force shutdown ([#3880](https://github.com/webpack/webpack-dev-server/issues/3880)) ([db24b16](https://github.com/webpack/webpack-dev-server/commit/db24b16e66a63a51e5bacead47ed30c3bf21ff5b))


### Bug Fixes

* avoid web socket connection when web socket server is not running ([#3879](https://github.com/webpack/webpack-dev-server/issues/3879)) ([8874d72](https://github.com/webpack/webpack-dev-server/commit/8874d72f2ee8f11c8420de131e8335982e516727))
* display file name for warnings/errors in overlay ([#3867](https://github.com/webpack/webpack-dev-server/issues/3867)) ([d20def5](https://github.com/webpack/webpack-dev-server/commit/d20def5c71609ad97ea783716c53070235f398cc))
* formatting errors/warnings ([#3877](https://github.com/webpack/webpack-dev-server/issues/3877)) ([f0dbea0](https://github.com/webpack/webpack-dev-server/commit/f0dbea019c822e7e4b7e5ed81a6a9588e9521d73))
* handle 0 value of the `port` option property ([ed67f66](https://github.com/webpack/webpack-dev-server/commit/ed67f66fc41eb1dd83fb84ecaa18703559dbe2ae))

### [4.2.1](https://github.com/webpack/webpack-dev-server/compare/v4.2.0...v4.2.1) (2021-09-13)


### Bug Fixes

* infinity loop for multi compiler mode ([#3840](https://github.com/webpack/webpack-dev-server/issues/3840)) ([e019bd2](https://github.com/webpack/webpack-dev-server/commit/e019bd24ea061c4839a4667f8bd75a04b9a48128))
* reloading logic for multi compiler mode ([#3841](https://github.com/webpack/webpack-dev-server/issues/3841)) ([ef148ec](https://github.com/webpack/webpack-dev-server/commit/ef148ec1feb66d0f72457d0b2de853b76b06b3c9))

### [4.2.0](https://github.com/webpack/webpack-dev-server/compare/v4.1.1...v4.2.0) (2021-09-09)


### Features

* added the `http.ca` option (CLI option added too) (should be used instead `cacert`, because we will remove it in the next major release in favor the `https.ca` option)
* added the `https.crl` option (CLI options added too), [more information](https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options)
* `https.ca`/`https.cacert`/ `https.cert`/`https.crl`/`https.key`/`https.pfx` options are now accept Arrays of `Buffer`/`string`/Path to file, using `--https-*-reset` CLI options you can reset these options
* `https.pfx`/`https.key` can be `Object[]`, [more information](https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options)
* `https` options can now accept custom options, you can use:

```js
module.exports = {
  // Other options
  devServer: {
    https: {
      // Allow to set additional TSL options https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options
      minVersion: "TLSv1.1",
      ca: path.join(httpsCertificateDirectory, "ca.pem"),
      pfx: path.join(httpsCertificateDirectory, "server.pfx"),
      key: path.join(httpsCertificateDirectory, "server.key"),
      cert: path.join(httpsCertificateDirectory, "server.crt"),
      passphrase: "webpack-dev-server",
    },
  }
};
```

### Bug Fixes

* accept connections with `file:` and `chrome-extensions:` protocol by default ([#3822](https://github.com/webpack/webpack-dev-server/issues/3822)) ([138f064](https://github.com/webpack/webpack-dev-server/commit/138f0641a4aa040fa2ff66dfd8891c920aa17808))
* close overlay on disconnection ([#3825](https://github.com/webpack/webpack-dev-server/issues/3825)) ([011bcf1](https://github.com/webpack/webpack-dev-server/commit/011bcf15c7eba8f7dcd45731f8e434b2eccf781e))
* respect `https.cacert` option ([#3820](https://github.com/webpack/webpack-dev-server/issues/3820)) ([0002ebf](https://github.com/webpack/webpack-dev-server/commit/0002ebfbc8f36e92f91013372c9e2bca97022825))

### [4.1.1](https://github.com/webpack/webpack-dev-server/compare/v4.1.0...v4.1.1) (2021-09-07)


### Bug Fixes

* improve the description of the `magicHtml` option ([#3772](https://github.com/webpack/webpack-dev-server/issues/3772)) ([b80610f](https://github.com/webpack/webpack-dev-server/commit/b80610f07357c3b2ae8557f6d371e4d563ae3c53))
* replace `ansi-html` with `ansi-html-community` to avoid CVE ([#3801](https://github.com/webpack/webpack-dev-server/issues/3801)) ([36fd214](https://github.com/webpack/webpack-dev-server/commit/36fd21477dac5131ec266cc1d717d87051f10a2b))

## [4.1.0](https://github.com/webpack/webpack-dev-server/compare/v4.0.0...v4.1.0) (2021-08-31)


### Features

* added the `magicHtml` option ([#3717](https://github.com/webpack/webpack-dev-server/issues/3717)) ([4831f58](https://github.com/webpack/webpack-dev-server/commit/4831f58a75d12f75f4d5e5064ff3245f1a3770ba))
* allow to set `hot` and `live-reload` for client using search params ([1c57680](https://github.com/webpack/webpack-dev-server/commit/1c576802bff4a4be78b1771ed2fc8f343780663b))
* show warning when the `hot` option is enabled with the HMR plugin in config ([#3744](https://github.com/webpack/webpack-dev-server/issues/3744)) ([6cb1e4e](https://github.com/webpack/webpack-dev-server/commit/6cb1e4e6a25de3fb284be84d2ad67fc701800b96))

### Bug Fixes

* change log type of `Disconnected!` to `info` ([fde27f5](https://github.com/webpack/webpack-dev-server/commit/fde27f5002ae3d679b2cee2215287f6e3a16febf))
* handle `--allowed-hosts all` correctly ([#3720](https://github.com/webpack/webpack-dev-server/issues/3720)) ([326ed56](https://github.com/webpack/webpack-dev-server/commit/326ed567638944bc3b64e185b118f9e723383e44))
* output documentation link on errors ([#3680](https://github.com/webpack/webpack-dev-server/issues/3680)) ([e16221b](https://github.com/webpack/webpack-dev-server/commit/e16221b1aed48f93c31c8659438834fdbf1e62bf))
* respect the `bypass` option with `target`/`router` options for proxy ([b5dd568](https://github.com/webpack/webpack-dev-server/commit/b5dd5687e521cd70e7e13b397280d8bda38df255))

## [4.0.0](https://github.com/webpack/webpack-dev-server/compare/v4.0.0-rc.1...v4.0.0) (2021-08-18)

## Notes:

- migration guide from v3 to v4 can be found [here](https://github.com/webpack/webpack-dev-server/blob/master/migration-v4.md)

### Bug Fixes

* improve https CLI output ([#3673](https://github.com/webpack/webpack-dev-server/issues/3673)) ([f2d87fb](https://github.com/webpack/webpack-dev-server/commit/f2d87fb2dc3f9545dd9203beda8bf9ac056c70f6))
* initial reloading for lazy compilation ([#3662](https://github.com/webpack/webpack-dev-server/issues/3662)) ([1768d6b](https://github.com/webpack/webpack-dev-server/commit/1768d6b7913055dad02318a49de65df2e93baa4f))
* respect protocol from browser for manual setup ([#3675](https://github.com/webpack/webpack-dev-server/issues/3675)) ([cdcabb2](https://github.com/webpack/webpack-dev-server/commit/cdcabb240f9afcab504ca26fbf71d3af013dd806))

## [4.0.0-rc.1](https://github.com/webpack/webpack-dev-server/compare/v4.0.0-rc.0...v4.0.0-rc.1) (2021-08-17)

## Notes:

- migration guide from v3 to v4 can be found [here](https://github.com/webpack/webpack-dev-server/blob/master/migration-v4.md)

### Features

* async API ([#3608](https://github.com/webpack/webpack-dev-server/issues/3608)) ([974ce25](https://github.com/webpack/webpack-dev-server/commit/974ce25669ef6a4f55e8a7576fc140bc7ccb55f1))
* use ECMA modules in client ([#3550](https://github.com/webpack/webpack-dev-server/issues/3550)) ([9307755](https://github.com/webpack/webpack-dev-server/commit/93077552c2bac020650936316dc93e03245b7a19))


### Bug Fixes

* fix usage legacy API ([#3660](https://github.com/webpack/webpack-dev-server/issues/3660)) ([c4678bc](https://github.com/webpack/webpack-dev-server/commit/c4678bc467370e7dc74d06a8b898515e448d0da0))
* proxy logging and allow to pass options without the `target` option ([#3651](https://github.com/webpack/webpack-dev-server/issues/3651)) ([6e2cbde](https://github.com/webpack/webpack-dev-server/commit/6e2cbde16b0d071b6dd5c243b1b0e867b69575c5))
* render ansi formatted error messages correctly in overlay ([#3579](https://github.com/webpack/webpack-dev-server/issues/3579)) ([9313454](https://github.com/webpack/webpack-dev-server/commit/9313454066c2a830b425965837a2756d8f945e97))
* use value of the `infastructureLogging.level` option by default for `client.logging`. ([#3613](https://github.com/webpack/webpack-dev-server/issues/3613)) ([c9ccc96](https://github.com/webpack/webpack-dev-server/commit/c9ccc96f9d5cd9930f69b927b248d52509ec1e55))
* schema for the `host` option ([#3549](https://github.com/webpack/webpack-dev-server/issues/3549)) ([7200d31](https://github.com/webpack/webpack-dev-server/commit/7200d3101403864b3ca795c6bf028197e9f62183))
* show deprecation warning for incorrect usage of Node.js API ([#3563](https://github.com/webpack/webpack-dev-server/issues/3563)) ([62b21ff](https://github.com/webpack/webpack-dev-server/commit/62b21ffb028685e76ee715babfe53d5a9606fbbc))

## [4.0.0-rc.0](https://github.com/webpack/webpack-dev-server/compare/v4.0.0-beta.3...v4.0.0-rc.0) (2021-07-19)


## Notes:

- migration guide from v3 to v4 can be found [here](https://github.com/webpack/webpack-dev-server/blob/master/migration-v4.md)

### ⚠ BREAKING CHANGES

* rename `client.transport` to `client.webSocketTransport`
* move web socket client to web socket server class, i.e. to get web socket clients use `this.webSocketServer.clients`
* remove entry options (i.e. `hotEntry` and `needClientEntry`) in favor manual setup entries (#3494)
* you need to reset CLI options using `reset` option, please look them in `webpack serve --help`
* `host` and `port` options can't be `null` or empty string

### Features

* allow to close overlay in browser ([#3433](https://github.com/webpack/webpack-dev-server/issues/3433)) ([307f2e7](https://github.com/webpack/webpack-dev-server/commit/307f2e7879b6c1ee18f279eb8f6d30509d550a86))
* add port `auto` ([#3297](https://github.com/webpack/webpack-dev-server/issues/3297)) ([437c8d3](https://github.com/webpack/webpack-dev-server/commit/437c8d3be7041e4203920d3d8a6af5a8071406fd))
* added `<url>` pattern for open and allow to use multiple browsers ([#3496](https://github.com/webpack/webpack-dev-server/issues/3496)) ([7c7ccf9](https://github.com/webpack/webpack-dev-server/commit/7c7ccf9c6cf2a26f980b725e9ba8ee9e48e5d397))
* allow string value for `client.webSocketURL.port` ([#3354](https://github.com/webpack/webpack-dev-server/issues/3354)) ([f5e7f8f](https://github.com/webpack/webpack-dev-server/commit/f5e7f8f6d2236d01b8e9562a23d9db077ce4032e))
* allow to disable web socket server using `webSocketServer: false` ([f62f20f](https://github.com/webpack/webpack-dev-server/commit/f62f20f301e39ac16be089f2d51129443838b921))
* allow `username` and `password` in clientURL ([#3452](https://github.com/webpack/webpack-dev-server/issues/3452)) ([a7225d5](https://github.com/webpack/webpack-dev-server/commit/a7225d5efc473549619f6121570b33c76b4fda7e))
* display documentation links on errors ([#3512](https://github.com/webpack/webpack-dev-server/issues/3512)) ([54790ab](https://github.com/webpack/webpack-dev-server/commit/54790abab19ccfc6a96461c32675d410551f902a))
* enable `compress` by default ([#3303](https://github.com/webpack/webpack-dev-server/issues/3303)) ([4d251b5](https://github.com/webpack/webpack-dev-server/commit/4d251b5c29418aba447021517158e0348dc37d32))
* implement the `client.webSocketURL.protocol` option ([#3380](https://github.com/webpack/webpack-dev-server/issues/3380)) ([8998d6b](https://github.com/webpack/webpack-dev-server/commit/8998d6b3a28251c5f8a6481d134f7557c5dc8e2b))
* the `ipc` option was added for unix socket ([#3479](https://github.com/webpack/webpack-dev-server/issues/3479)) ([b559738](https://github.com/webpack/webpack-dev-server/commit/b559738047bbe6f9bf508747c8ed188dacdec258))
* support `Function` in headers option ([#3267](https://github.com/webpack/webpack-dev-server/issues/3267)) ([28f9597](https://github.com/webpack/webpack-dev-server/commit/28f95978f6494885a5f6402ec14e9290bcae6bf4))


### Bug Fixes

* allow to use `80` port for dev server ([#3487](https://github.com/webpack/webpack-dev-server/issues/3487)) ([22f18eb](https://github.com/webpack/webpack-dev-server/commit/22f18ebfae77df0d75a44f2fa136cfecd655bce7))
* avoid duplicate `App updated. Recompiling...` ([#3488](https://github.com/webpack/webpack-dev-server/issues/3488)) ([a2e3ead](https://github.com/webpack/webpack-dev-server/commit/a2e3eaddd400e77668b8ab6585fef89ffb963ede))
* do not allow empty string for `port` ([#3372](https://github.com/webpack/webpack-dev-server/issues/3372)) ([8c53102](https://github.com/webpack/webpack-dev-server/commit/8c53102840c2a0310931c43ccf320226bec74766))
* don't allow empty array for `allowedHosts` option ([#3451](https://github.com/webpack/webpack-dev-server/issues/3451)) ([17aa345](https://github.com/webpack/webpack-dev-server/commit/17aa345b36fa8d70c9242015303b814de55cfa71))
* get rid of Symbol core-js polyfill ([#3535](https://github.com/webpack/webpack-dev-server/issues/3535)) ([7afe3d2](https://github.com/webpack/webpack-dev-server/commit/7afe3d2559d7f4145fe67bbffa8994498ee3a3b6))
* the `host` option can't be `null` or empty string ([#3352](https://github.com/webpack/webpack-dev-server/issues/3352)) ([216b0d3](https://github.com/webpack/webpack-dev-server/commit/216b0d3c71a617eeef32cff523f95fcd8916af72))
* improve message for static content changes ([#3289](https://github.com/webpack/webpack-dev-server/issues/3289)) ([970a7d7](https://github.com/webpack/webpack-dev-server/commit/970a7d7bbee1be33c749ee3faae344fc6567a599))
* improve processing of CLI flags ([#3313](https://github.com/webpack/webpack-dev-server/issues/3313)) ([32bc877](https://github.com/webpack/webpack-dev-server/commit/32bc877f378af5fbf893d9e152369ed68ab127ee))
* rename `firewall` option to `allowedHosts` option ([#3345](https://github.com/webpack/webpack-dev-server/issues/3345)) ([81e4e55](https://github.com/webpack/webpack-dev-server/commit/81e4e557a07381980083efdeb99eb26265b38aae))
* pass own logger in historyApiFallback ([#3373](https://github.com/webpack/webpack-dev-server/issues/3373)) ([3ba2fa5](https://github.com/webpack/webpack-dev-server/commit/3ba2fa5817c49e95424f7dfab2ca0a94af82996b))
* polling usage in watchFiles option ([#3366](https://github.com/webpack/webpack-dev-server/issues/3366)) ([2afb223](https://github.com/webpack/webpack-dev-server/commit/2afb223fb5384da2416ecf4b39ac45963d9ee2d5))
* postpone initialize ([#3467](https://github.com/webpack/webpack-dev-server/issues/3467)) ([80087de](https://github.com/webpack/webpack-dev-server/commit/80087dec9a816e6d68984b18a82e875b1a826835))
* regression with `port` and `bonjour` ([c2805fe](https://github.com/webpack/webpack-dev-server/commit/c2805fe5a3c359809e315d9ba55849a5bbbe3ecf))
* rename `path` to `pathname` for `client.webSocketURL` ([#3466](https://github.com/webpack/webpack-dev-server/issues/3466)) ([fd63e02](https://github.com/webpack/webpack-dev-server/commit/fd63e02ff58ed7e3ab2dcb84a36f0d49c1d553a2))
* respect `logLevel` and `logProvider` option for proxy ([#3257](https://github.com/webpack/webpack-dev-server/issues/3257)) ([199baec](https://github.com/webpack/webpack-dev-server/commit/199baec187376213f55d8d0542798f4945b8cce5))
* show plugin name in progress log ([#3337](https://github.com/webpack/webpack-dev-server/issues/3337)) ([b8a0932](https://github.com/webpack/webpack-dev-server/commit/b8a09323cb0d6f009459f77b618722408dfbe68c))

## [4.0.0-beta.3](https://github.com/webpack/webpack-dev-server/compare/v4.0.0-beta.2...v4.0.0-beta.3) (2021-05-06)


### ⚠ BREAKING CHANGES

* the `https.ca` option was removed in favor the `https.cacert` option
* the `dev` option was renamed to `devMiddleware`
* the `client.overlay` option is `true` by default and show warnings by default
* use server port for websocket connection by default, if you proxied `webpack-dev-server`, please update `webpack-cli` to `v4.7.0` ([#3185](https://github.com/webpack/webpack-dev-server/issues/3185)) ([0c3f817](https://github.com/webpack/webpack-dev-server/commit/0c3f8178bc80d7272246fe810964561ae747ec49))
* minimum supported Node.js version is `12.13.0`

### Features

* added `https.cacert` ([#3240](https://github.com/webpack/webpack-dev-server/issues/3240)) ([b212a2c](https://github.com/webpack/webpack-dev-server/commit/b212a2ce73c3e58f3450708801c8b413ca65fb5b))
* added more CLI options, please run `webpack server --help` to look at them ([#3238](https://github.com/webpack/webpack-dev-server/issues/3238)) ([469e558](https://github.com/webpack/webpack-dev-server/commit/469e558d1d772006a1057954331ccecd34dfdefa))
* support `bonjour` options ([#3202](https://github.com/webpack/webpack-dev-server/issues/3202)) ([5534583](https://github.com/webpack/webpack-dev-server/commit/55345836c2d8e22e45c2150a8f003019d8a0bd56))

### Bug Fixes

* improve warning message for `open` ([#3191](https://github.com/webpack/webpack-dev-server/issues/3191)) ([d473fd9](https://github.com/webpack/webpack-dev-server/commit/d473fd9a55334efd8d349aa2b37c64b395dea025))
* respect the `client.logging` option for HMR logging ([#3159](https://github.com/webpack/webpack-dev-server/issues/3159)) ([6f3c6ba](https://github.com/webpack/webpack-dev-server/commit/6f3c6bacb1b7f6eae95e5b688dc22b5a42628360))
* respect `client.needClientEntry` and `client.needHotEntry` options ([#3178](https://github.com/webpack/webpack-dev-server/issues/3178)) ([a2b6db9](https://github.com/webpack/webpack-dev-server/commit/a2b6db9417eb289a488584e8b244fcedc416ac56))
* overlay with warnings ([#3215](https://github.com/webpack/webpack-dev-server/issues/3215)) ([7e18161](https://github.com/webpack/webpack-dev-server/commit/7e181618ba7a8ce995bf39ded00a789a9714a14b))
* help description for options
* error description for options
* improve warning message for the `open` option

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
