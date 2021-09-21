"use strict";

const Webpack = require("webpack");
const WebpackDevServer = require("../../../lib/Server");
const webpackConfig = require("./webpack.config");

const compiler = Webpack(webpackConfig);
const devServerOptions = { ...webpackConfig.devServer, open: true };
const server = new WebpackDevServer(devServerOptions, compiler);

const runServer = async () => {
  console.log("Starting server...");
  await server.start();
};

runServer();
