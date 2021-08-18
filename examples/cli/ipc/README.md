# CLI: IPC

The Unix socket to listen to (instead of a [host](../host-and-port/README.md)).

## true

Setting it to `true` will listen to a socket at `/your-os-temp-dir/webpack-dev-server.sock`:

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    ipc: true,
  },
};
```

Usage via CLI:

```console
npx webpack serve --ipc
```

## string

You can also listen to a different socket with:

**webpack.config.js**

```js
const path = require("path");

module.exports = {
  // ...
  devServer: {
    ipc: path.join(__dirname, "my-socket.sock"),
  },
};
```

Usage via CLI:

```console
npx webpack serve --ipc ./my-socket.sock
```

## What Should Happen

1. The script should listen to the socket provided.
1. A proxy server should be created.
1. Go to `http://localhost:8080/`, you should see the text on the page itself change to read `Success!`.
