# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# [3.3.0](https://github.com/webpack/webpack-dev-server/compare/v3.2.1...v3.3.0) (2019-04-08)


### Bug Fixes

* **deps:** update dependency yargs to v12.0.5 ([#1707](https://github.com/webpack/webpack-dev-server/issues/1707)) ([fa17131](https://github.com/webpack/webpack-dev-server/commit/fa17131))
* **example/util:** use path.resolve ([#1678](https://github.com/webpack/webpack-dev-server/issues/1678)) ([5d1476e](https://github.com/webpack/webpack-dev-server/commit/5d1476e)), closes [#1428](https://github.com/webpack/webpack-dev-server/issues/1428)
* compatibility with webpack-cli@3.3 ([#1754](https://github.com/webpack/webpack-dev-server/issues/1754)) ([fd7cb0d](https://github.com/webpack/webpack-dev-server/commit/fd7cb0d))
* ignore proxy when bypass return false ([#1696](https://github.com/webpack/webpack-dev-server/issues/1696)) ([aa7de77](https://github.com/webpack/webpack-dev-server/commit/aa7de77))
* respect stats option from webpack config ([#1665](https://github.com/webpack/webpack-dev-server/issues/1665)) ([efaa740](https://github.com/webpack/webpack-dev-server/commit/efaa740))
* use location.port when location.hostname is used to infer HMR socket URL ([#1664](https://github.com/webpack/webpack-dev-server/issues/1664)) ([2f7f052](https://github.com/webpack/webpack-dev-server/commit/2f7f052))
* **Server:** validate express.static.mime.types ([#1765](https://github.com/webpack/webpack-dev-server/issues/1765)) ([919ff77](https://github.com/webpack/webpack-dev-server/commit/919ff77))


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
