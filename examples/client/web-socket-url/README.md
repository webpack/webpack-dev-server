# Web Socket URL Option Protocol

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    host: "0.0.0.0",
    client: {
      webSocketURL: "ws://<insert-host>:8080",
    },
  },
};
```

Usage via CLI:

```console
npx webpack serve --open --host 0.0.0.0 --client-web-socket-url ws://<insert-host>:8080
```

_NOTE: replace `<insert-host>` with your local IP Address._

In order to make the server publicly accessible the client needs to know with
what host to connect to the server. If `--host 0.0.0.0` is given, the client
would try to connect to `0.0.0.0`. With the `--client-web-socket-url` and related options it is possible to
override this.

You're now able to explicitly define the protocol used with the `client.webSocketURL` option
(have a look at the config provided in `webpack.config.js`).

## What Should Happen

The script should open `http://localhost:8080/` in your default browser.

You should see a failed attempt to establish a connection to `/ws`
via the explicitly defined `https://localhost:8080`. This fails of course since
we're not hosting https.
