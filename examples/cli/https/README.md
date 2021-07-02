# CLI: https

You may choose to wish to run `webpack-dev-server` on `https`.

## https

Use HTTPS protocol.

```console
npx webpack serve --open-target <url> --https
```

## https options

Customize `https` configuration with the following options:

- `--https-key`: Path to an SSL key.
- `--https-pfx`: Path to an SSL pfx file.
- `--https-cert`: Path to an SSL certificate.
- `--https-cacert`: Path to an SSL CA certificate.
- `--https-passphrase`: Passphrase for a pfx file.

```console
npx webpack serve --open-target <url> --https-key ./ssl/server.key --https-pfx ./ssl/server.pfx --https-cert ./ssl/server.crt --https-cacert ./ssl/ca.pem --https-passphrase webpack-dev-server
```

## What Should Happen

1. The script should open `https://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
