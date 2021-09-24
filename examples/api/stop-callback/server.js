"use strict";

const Webpack = require("webpack");
const WebpackDevServer = require("../../../lib/Server");
const webpackConfig = require("./webpack.config");

const compiler = Webpack(webpackConfig);
const devServerOptions = { ...webpackConfig.devServer, open: true };
const server = new WebpackDevServer(devServerOptions, compiler);

server.startCallback(() => {
  console.log("Successfully started server on http://localhost:8080");
});

const stopServer = () =>
  server.stopCallback(() => {
    console.log("Server stopped.");
  });

setTimeout(stopServer, 5000);
