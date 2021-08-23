# client.logging Option

`'log' | 'info' | 'warn' | 'error' | 'none' | 'verbose'`

Allows to set log level in the browser, e.g. before reloading, before an error or when Hot Module Replacement is enabled.

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    client: {
      logging: "info",
    },
  },
};
```

Usage via CLI:

```shell
npx webpack serve --open --client-logging info
```

## What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. You should see an overlay in browser for compilation warnings.
3. Open the console in your browser's devtools.

In the devtools console you should see:

```
[HMR] Waiting for update signal from WDS...
[webpack-dev-server] Hot Module Replacement enabled.
[webpack-dev-server] Live Reloading enabled.
[webpack-dev-server] Warnings while compiling.
[webpack-dev-server] Manual warnings produced during compilation.
```
