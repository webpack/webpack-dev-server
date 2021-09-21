# API: start

While it's recommended to run `webpack-dev-server` via the CLI, you may also
choose to start a server via the API.

This example demonstrates using `start` method. It instructs `webpack-dev-server` instance to stop watching for file changes.

```js
const Webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const webpackConfig = require("./webpack.config");

const compiler = Webpack(webpackConfig);
const devServerOptions = { ...webpackConfig.devServer };
const server = new WebpackDevServer(devServerOptions, compiler);

const runServer = async () => {
  console.log("Starting server...");
  await server.start();
};

runServer();
```

Use the following command to run this example:

```console
node server.js
```

## What Should Happen

1. Open `http://localhost:8080/` in your preferred browser.
2. You should see the text on the page itself change to read `Success!`.
