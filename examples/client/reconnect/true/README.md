# client.reconnect: true

## true

Tells dev-server the number of times it should try to reconnect the client. When `true` it will try to reconnect unlimited times.

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    client: {
      reconect: true,
    },
  },
};
```

Usage via CLI:

```shell
npx webpack serve --open --client-reconnect
```

## What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. Open the console tab in your browser's devtools.
3. Now close the server with `Ctrl+C` to disconnect the client.

In the devtools console you should see that webpack-dev-server is trying to reconnect:

```
[webpack-dev-server] Hot Module Replacement enabled.
[webpack-dev-server] Live Reloading enabled.
[webpack-dev-server] Disconnected!
[webpack-dev-server] Trying to reconnect...
WebSocket connection to 'ws://127.0.0.1:8163/ws' failed: Error in connection establishment: net::ERR_CONNECTION_REFUSED
[webpack-dev-server] JSHandle@object
[webpack-dev-server] Trying to reconnect...
WebSocket connection to 'ws://127.0.0.1:8163/ws' failed: Error in connection establishment: net::ERR_CONNECTION_REFUSED
[webpack-dev-server] JSHandle@object
[webpack-dev-server] Trying to reconnect...
WebSocket connection to 'ws://127.0.0.1:8163/ws' failed: Error in connection establishment: net::ERR_CONNECTION_REFUSED
[webpack-dev-server] JSHandle@object
```
