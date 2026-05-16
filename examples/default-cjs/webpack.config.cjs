"use strict";

// CommonJS variant of the default example.
// Demonstrates that webpack-dev-server still supports CJS configs even
// though the rest of the examples use ESM.
//
// The file uses the `.cjs` extension because the project's package.json
// has `"type": "module"`, which makes plain `.js` files ESM by default.

const path = require("node:path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  context: __dirname,
  entry: "./app.js",
  output: {
    path: __dirname,
    filename: "bundle.js",
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: path.join(__dirname, "../.assets/layout.html"),
      title: "CommonJS example",
    }),
  ],
  stats: {
    colors: true,
  },
};
