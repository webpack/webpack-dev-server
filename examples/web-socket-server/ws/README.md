# web-socket-server (ws)

To create a custom server implementation.

## ws

This mode uses [ws](https://github.com/websockets/ws) as a server.

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    webSocketServer: "ws",
  },
};
```

Usage via CLI:

```console
npx webpack serve --web-socket-server ws --open
```

### What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
