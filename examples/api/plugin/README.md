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

- Use `webpack --watch`, not `webpack serve`. `webpack serve` creates its own
  standalone dev server; if you also have a plugin instance in `plugins[]`,
  the plugin detects the standalone server and stays passive to avoid binding
  the same port twice.
- A plain `webpack` build (no watch) will not start the server — the plugin
  detects build mode and stays passive so the build can finish and the process
  can exit normally.
