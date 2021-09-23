# API: stop

While it's recommended to run `webpack-dev-server` via the CLI, you may also
choose to stop a server via the API.

This example demonstrates using `stop` method. It instructs `webpack-dev-server` instance to stop the server.

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

const stopServer = async () => {
  console.log("Stopping server...");
  await server.stop();
};

runServer();

setTimeout(stopServer, 5000);
```

Use the following command to run this example:

```console
node server.js
```

## What Should Happen

1. The script should start the server and open `http://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success! Reload the page after 5 seconds.`.
3. After 5 seconds, the script will stop the server. Confirm by reloading the browser page after 5 seconds.
4. You should see `Stopping server...` in your terminal output.
