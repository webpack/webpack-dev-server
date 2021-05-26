# CLI: Web Socket URL Option Protocol

```console
npx webpack serve
```

_NOTE: replace `<insert local ip>` with your local IP Address._

You're now able to explicitly define the protocol used with the `client.webSocketURL` option
(have a look to the config provided in `webpack.config.js`).

## What Should Happen

The script should open `http://localhost:8080/` in your default browser.

You should see a failed attempt to establish a connection to `/ws`
via the explicitly defined `https://localhost:8080`. This fails of course since
we're not hosting https.
