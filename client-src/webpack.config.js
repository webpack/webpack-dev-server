import path from "node:path";
import { fileURLToPath } from "node:url";
import webpack from "webpack";
import { merge } from "webpack-merge";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const library = {
  library: {
    type: "module",
  },
};

const baseForModules = {
  devtool: false,
  mode: "development",
  experiments: {
    outputModule: true,
  },
  output: {
    path: path.resolve(__dirname, "../client/modules"),
    ...library,
  },
  target: ["web", "es2024"],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: "babel-loader",
          },
        ],
      },
    ],
  },
};

export default [
  merge(baseForModules, {
    entry: path.join(__dirname, "modules/logger/index.js"),
    output: {
      filename: "logger/index.js",
    },
    plugins: [
      new webpack.NormalModuleReplacementPlugin(
        /^tapable$/,
        path.join(__dirname, "modules/logger/tapable.js"),
      ),
    ],
  }),
];
