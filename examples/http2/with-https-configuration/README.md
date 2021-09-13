# http2 option

Serve over HTTP/2 using [spdy](https://www.npmjs.com/package/spdy). This option is ignored for Node 15.0.0 and above, as `spdy` is broken for those versions.

## HTTP/2 with a custom certificate:

Provide your own certificate using the [https](https://webpack.js.org/configuration/dev-server/#devserverhttps) option:

```js
module.exports = {
  // ...
  devServer: {
    https: {
      key: "./ssl/server.key",
      pfx: "./ssl/server.pfx",
      cert: "./ssl/server.crt",
      ca: "./ssl/ca.pem",
      passphrase: "webpack-dev-server",
    },
  },
};
```

Usage via CLI:

```console
npx webpack serve --open --http2 --https-key ./ssl/server.key --https-pfx ./ssl/server.pfx --https-cert ./ssl/server.crt --https-ca ./ssl/ca.pem --https-passphrase webpack-dev-server
```

## What Should Happen

1. The script should open `https://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
