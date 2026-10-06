import path from "node:path";
import { fileURLToPath } from "node:url";
import ReactRefreshPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import HTMLGeneratorPlugin from "../../helpers/html-generator-plugin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// What React's guide for webpack-dev-server sets up: `react-refresh/babel` in
// the app's own code, and the plugin with its overlay reading this server's
// socket, which is its default.
export default {
  mode: "development",
  context: __dirname,
  stats: "none",
  devtool: false,
  entry: "./index.js",
  output: {
    path: "/",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: __dirname,
        exclude: /webpack\.config\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            babelrc: false,
            configFile: false,
            plugins: ["react-refresh/babel"],
          },
        },
      },
    ],
  },
  infrastructureLogging: {
    level: "info",
    stream: {
      write: () => {},
    },
  },
  plugins: [new ReactRefreshPlugin(), new HTMLGeneratorPlugin()],
};
