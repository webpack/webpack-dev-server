# https options

You may choose to wish to run `webpack-dev-server` on `https`.

## https

Use HTTPS protocol.

```js
module.exports = {
  // ...
  devServer: {
    https: true,
  },
};
```

Usage via CLI:

```console
npx webpack serve --open --https
```

## https options

Customize `https` configuration with the following options:

- `key`: Path to an SSL key.
- `pfx`: Path to an SSL pfx file.
- `cert`: Path to an SSL certificate.
- `cacert`: Path to an SSL CA certificate.
- `passphrase`: Passphrase for a pfx file.
- `requestCert`: Request for an SSL certificate.

```js
module.exports = {
  // ...
  devServer: {
    https: {
      key: "./ssl/server.key",
      pfx: "./ssl/server.pfx",
      cert: "./ssl/server.crt",
      cacert: "./ssl/ca.pem",
      passphrase: "webpack-dev-server",
      requestCert: true,
    },
  },
};
```

Usage via CLI:

```console
npx webpack serve --open --https-key ./ssl/server.key --https-pfx ./ssl/server.pfx --https-cert ./ssl/server.crt --https-cacert ./ssl/ca.pem --https-passphrase webpack-dev-server --https-request-cert
```

## What Should Happen

1. The script should open `https://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
