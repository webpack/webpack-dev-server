# 2.0 (unreleased)

- Only compatible with webpack v2.
- Add compatibility for web workers (#298).
- `--inline` is enabled by default now.
- Convert to `yargs` to handle commandline options.
- Allow a `Promise` instead of a config object in the CLI (#419).
- Add `--hot-only` flag, a shortcut that adds `webpack/hot/only-dev-server` in `entry` in the webpack config (#439).

For the 1.x changelog, see the [webpack-1 branch](https://github.com/webpack/webpack-dev-server/blob/webpack-1/CHANGELOG.md).
