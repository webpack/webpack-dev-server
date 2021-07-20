"use strict";

const Webpack = require("webpack");
const WebpackDevServer = require("../../../lib/Server");
const webpackConfig = require("./webpack.config");

const compiler = Webpack(webpackConfig);
const devServerOptions = { ...webpackConfig.devServer, open: true };
const server = new WebpackDevServer(devServerOptions, compiler);

server.listen(8080, "127.0.0.1", () => {
  console.log("Starting server on http://localhost:8080");
});
