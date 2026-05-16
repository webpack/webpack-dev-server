import Webpack from "webpack";
import WebpackDevServer from "../../../lib/Server.js";
import webpackConfig from "./webpack.config.js";

const compiler = Webpack(webpackConfig);
const devServerOptions = { ...webpackConfig.devServer, open: true };
const server = new WebpackDevServer(devServerOptions, compiler);

server.startCallback(() => {
  console.log("Starting server on http://localhost:8080");
});
