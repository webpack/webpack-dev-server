"use strict";

/* eslint-disable import/no-extraneous-dependencies */

const path = require("path");
const fs = require("graceful-fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { marked } = require("marked");

module.exports = {
  setup(config) {
    const defaults = { mode: "development", plugins: [], devServer: {} };

    if (config.entry) {
      if (typeof config.entry === "string") {
        config.entry = path.resolve(config.entry);
      } else if (Array.isArray(config.entry)) {
        config.entry = config.entry.map((entry) => path.resolve(entry));
      } else if (typeof config.entry === "object") {
        Object.entries(config.entry).forEach(([key, value]) => {
          config.entry[key] = path.resolve(value);
        });
      }
    }

    const result = { ...defaults, ...config };
    const onBeforeSetupMiddleware = ({ app }) => {
      app.get("/.assets/*", (req, res) => {
        const filename = path.join(__dirname, "/", req.path);
        res.sendFile(filename);
      });
    };
    const renderer = new marked.Renderer();
    const heading = renderer.heading;
    const markedOptions = {
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: false,
      sanitizer: null,
      mangle: true,
      smartLists: false,
      silent: false,
      langPrefix: "lang-",
      smartypants: false,
      headerPrefix: "",
      renderer,
      xhtml: false,
    };
    const readme = fs.readFileSync("README.md", "utf-8");

    let exampleTitle = "";

    renderer.heading = function headingProxy(text, level, raw, slugger) {
      if (level === 1 && !exampleTitle) {
        exampleTitle = text;
      }

      return heading.call(this, text, level, raw, slugger);
    };

    marked.setOptions(markedOptions);

    marked(readme, { renderer });

    result.plugins.push(
      new HtmlWebpackPlugin({
        filename: "index.html",
        template: path.join(__dirname, ".assets/layout.html"),
        title: exampleTitle,
      })
    );

    if (result.devServer.setupMiddlewares) {
      const proxy = result.devServer.setupMiddlewares;
      result.devServer.setupMiddlewares = (middlewares, devServer) => {
        onBeforeSetupMiddleware(devServer);
        return proxy(middlewares, devServer);
      };
    } else {
      result.devServer.setupMiddlewares = (middlewares, devServer) => {
        onBeforeSetupMiddleware(devServer);
        return middlewares;
      };
    }

    const output = {
      path: path.dirname(module.parent.filename),
    };

    if (result.output) {
      result.output = { ...result.output, ...output };
    } else {
      result.output = output;
    }

    return result;
  },
};
