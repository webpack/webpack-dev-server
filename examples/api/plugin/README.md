# API: Plugin

Use `webpack-dev-server` as a webpack plugin by adding an instance to
`plugins[]`. The dev server starts when the first compilation finishes and
stops when the compiler closes — no separate `server.start()` call is needed.

```js
// webpack.config.js
const WebpackDevServer = require("webpack-dev-server");

module.exports = {
  // ...
  plugins: [new WebpackDevServer({ port: 8080, open: true })],
};
```

If you have existing `devServer` options in your config, spread them into the
plugin instance — the plugin reads its options from its constructor argument,
not from `config.devServer`:

```js
const devServerOptions = { ...config.devServer, open: true };
config.plugins.push(new WebpackDevServer(devServerOptions));
```

## Run

```console
npx webpack --watch
```

## What should happen

1. Open `http://localhost:8080/` in your preferred browser.
2. You should see the text on the page itself change to read `Success!`.
3. Press `Ctrl+C` in the terminal — `webpack-cli` closes the compiler, which
   fires the plugin's `shutdown` hook, stopping the dev server cleanly.

## Notes

- The plugin works with both `webpack --watch` and `webpack serve`. With
  `webpack serve`, `webpack-cli` already creates its own standalone dev server
  for the same compiler, so you would end up with two servers running. If
  that's intentional (e.g. different ports/hosts), make sure the plugin's
  `port` does not clash with the one `webpack-cli` resolves from
  `config.devServer` and CLI args. Otherwise prefer one or the other.
