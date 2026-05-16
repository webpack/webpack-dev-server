import Webpack from "webpack";
import WebpackDevServer from "../../../lib/Server.js";
import webpackConfig from "./webpack.config.js";

const compiler = Webpack(webpackConfig);
const devServerOptions = { ...webpackConfig.devServer, open: true };
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
