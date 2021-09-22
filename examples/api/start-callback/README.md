# API: startCallback(callback)

While it's recommended to run `webpack-dev-server` via the CLI, you may also choose to start a server via the API.

This example demonstrates using `startCallback(callback)` method. It instructs `webpack-dev-server` instance to start the server and then run the callback function.

```js
const Webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const webpackConfig = require("./webpack.config");

const compiler = Webpack(webpackConfig);
const devServerOptions = { ...webpackConfig.devServer };
const server = new WebpackDevServer(devServerOptions, compiler);

server.startCallback(() => {
  console.log("Successfully started server on http://localhost:8080");
});
```

Use the following command to run this example:

```console
node server.js
```

## What Should Happen

1. Open `http://localhost:8080/` in your preferred browser.
2. You should see the text on the page itself change to read `Success!`.
3. You should see `Successfully started server on http://localhost:8080` in the terminal output.
