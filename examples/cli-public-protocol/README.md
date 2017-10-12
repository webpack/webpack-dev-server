# CLI - public protocol

NOTE: replace `<insert local ip>` with your local ip.

```shell
node ../../bin/webpack-dev-server.js
```

You're now able to explicitly define the protocol used with the `public` option (have a look to the config provided in `webpack.config.js`).

## What should happen

The script should open `https://localhost:8080`. In the app you should see "It
works."
