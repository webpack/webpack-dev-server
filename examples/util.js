import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import fs from "graceful-fs";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { marked } from "marked";

const __dirname = import.meta.dirname;

/**
 * @param {object} config webpack config
 * @param {string} callerUrl `import.meta.url` of the calling webpack config — used to derive `output.path`
 * @returns {object} normalized webpack config
 */
export function setup(config, callerUrl) {
  const context = path.dirname(fileURLToPath(callerUrl));
  const defaults = { mode: "development", context, plugins: [], devServer: {} };
  const result = { ...defaults, ...config };
  const readme = fs.readFileSync(path.join(context, "README.md"), "utf8");
  const exampleTitle =
    marked
      .lexer(readme)
      .find((token) => token.type === "heading" && token.depth === 1)?.text ||
    "";

  result.plugins.push(
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: path.join(__dirname, ".assets/layout.html"),
      title: exampleTitle,
    }),
  );

  const { setupMiddlewares } = result.devServer;
  result.devServer.setupMiddlewares = (middlewares, devServer) => {
    middlewares.unshift({
      name: "example-assets",
      path: "/.assets",
      middleware: express.static(path.join(__dirname, ".assets")),
    });
    return setupMiddlewares
      ? setupMiddlewares(middlewares, devServer)
      : middlewares;
  };

  const output = {
    path: path.join(context, "dist"),
    publicPath: "/",
  };

  result.output = result.output ? { ...result.output, ...output } : output;

  return result;
}
