# client.reconnect: false

## false

Tells dev-server the number of times it should try to reconnect the client. When `false` it will not try to reconnect.

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    client: {
      reconect: false,
    },
  },
};
```

Usage via CLI:

```shell
npx webpack serve --open --no-client-reconnect
```

## What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. Open the console tab in your browser's devtools.
3. Now close the server with `Ctrl+C` to disconnect the client.

In the devtools console you should see that webpack-dev-server is not trying to reconnect:

```
[webpack-dev-server] Hot Module Replacement enabled.
[webpack-dev-server] Live Reloading enabled.
[webpack-dev-server] Disconnected!
```
