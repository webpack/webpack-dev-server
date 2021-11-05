# spdy server

Serve over HTTP/2 using [spdy](https://www.npmjs.com/package/spdy). This option is ignored for Node 15.0.0 and above, as `spdy` is broken for those versions.

## HTTP/2 with a custom certificate:

Provide your own certificate using the `server.options` configuration:

- `key`: Path to an SSL key.
- `pfx`: Path to an SSL pfx file.
- `cert`: Path to an SSL certificate or content of an SSL certificate.
- `ca`: Path to an SSL CA certificate or content of an SSL CA certificate.
- `crl`: Path to PEM formatted CRLs (Certificate Revocation Lists) or content of PEM formatted CRLs (Certificate Revocation Lists).
- `passphrase`: Passphrase for a pfx file.
- `requestCert`: Request for an SSL certificate.

```js
module.exports = {
  // ...
  devServer: {
    server: {
      type: "spdy",
      options: {
        key: "./ssl/server.key",
        pfx: "./ssl/server.pfx",
        cert: "./ssl/server.crt",
        ca: "./ssl/ca.pem",
        passphrase: "webpack-dev-server",
      },
    },
  },
};
```

Usage via CLI:

```console
npx webpack serve --open --server-type spdy --server-options-key ./ssl/server.key --server-options-cert ./ssl/server.crt --server-options-ca ./ssl/ca.pem --server-options-passphrase webpack-dev-server
```

## What Should Happen

1. The script should open `https://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
