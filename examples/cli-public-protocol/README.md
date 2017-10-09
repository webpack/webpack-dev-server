# CLI - public protocol

NOTE: replace `<insert local ip>` with your local ip.

```shell
node ../../bin/webpack-dev-server.js
```

You're now able to explicitly define the protocol used with the `public` option (have a look to the config provided in `webpack.config.js`). 

## What should happen

If you open your browser at `http://localhost:8080` you'll see that dev-server tries to establish a connection to `/sockjs-node` via the explicitly defined `https://localhost:8080`. This fails of course since we're not hosting https.
