
# 2.x (unreleased)

## 2.1.0-beta.3

- **Breaking change:** removed overriding `output.path` to `"/"` in the webpack config when using the CLI ([#337](https://github.com/webpack/webpack-dev-server/issues/337)).
- **Breaking change:** removed `contentBase` as a proxy feature (deprecated since 1.x).
- Limit websocket retries when the server can't be reached ([#589](https://github.com/webpack/webpack-dev-server/issues/589)).
- Improve detection for getting the server URL in the client ([#496](https://github.com/webpack/webpack-dev-server/issues/496)).
- Add `clientLogLevel` (`--clientLogLevel` for CI) option. It controls the log messages shown in the browser. Available levels are `error`, `warning`, `info` or `none` ([#579](https://github.com/webpack/webpack-dev-server/issues/579)).
- Allow using no content base with the `--no-content-base` flag (previously it always defaulted to the working directory).
- Use stronger certs for the `https` modus, to prevent browsers from complaining about it ([#572](https://github.com/webpack/webpack-dev-server/issues/572)).

## Before 2.1.0-beta.3

- Only compatible with webpack v2.
- Add compatibility for web workers (#298).
- `--inline` is enabled by default now.
- Convert to `yargs` to handle commandline options.
- Allow a `Promise` instead of a config object in the CLI (#419).
- Add `--hot-only` flag, a shortcut that adds `webpack/hot/only-dev-server` in `entry` in the webpack config (#439).

For the 1.x changelog, see the [webpack-1 branch](https://github.com/webpack/webpack-dev-server/blob/webpack-1/CHANGELOG.md).
