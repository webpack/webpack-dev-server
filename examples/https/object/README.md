# https options

You may choose to wish to run `webpack-dev-server` on `https`.

Customize `https` configuration with the following options:

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
npx webpack serve --open --https-key ./ssl/server.key --https-pfx ./ssl/server.pfx --https-cert ./ssl/server.crt --https-ca ./ssl/ca.pem --https-passphrase webpack-dev-server --https-request-cert
```

You can also directly pass the contents of respective files:

```js
const fs = require("fs");
const path = require("path");

module.exports = {
  // ...
  devServer: {
    https: {
      key: fs.readFileSync(path.join(__dirname, "./ssl/server.key")),
      pfx: fs.readFileSync(path.join(__dirname, "./ssl/server.pfx")),
      cert: fs.readFileSync(path.join(__dirname, "./ssl/server.crt")),
      ca: fs.readFileSync(path.join(__dirname, "./ssl/ca.pem")),
      passphrase: "webpack-dev-server",
      requestCert: true,
    },
  },
};
```

## What Should Happen

1. The script should open `https://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
