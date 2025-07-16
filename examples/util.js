"use strict";

const path = require("node:path");
const fs = require("graceful-fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { marked } = require("marked");
const mime = require("mime");

module.exports = {
  setup(config) {
    const defaults = { mode: "development", plugins: [], devServer: {} };

    if (config.entry) {
      if (typeof config.entry === "string") {
        config.entry = path.resolve(config.entry);
      } else if (Array.isArray(config.entry)) {
        config.entry = config.entry.map((entry) => path.resolve(entry));
      } else if (typeof config.entry === "object") {
        for (const [key, value] of Object.entries(config.entry)) {
          config.entry[key] = path.resolve(value);
        }
      }
    }

    const result = { ...defaults, ...config };
    const onBeforeSetupMiddleware = ({ app }) => {
      app.use("/.assets/", (req, res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
          next();
          return;
        }

        res.setHeader("Content-Type", mime.lookup(req.url));

        const filename = path.join(__dirname, "/.assets/", req.url);
        const stream = fs.createReadStream(filename);

        stream.pipe(res);
      });
    };
    const renderer = new marked.Renderer();
    const { heading } = renderer;
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
    const readme = fs.readFileSync("README.md", "utf8");

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
      }),
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

    result.output = result.output ? { ...result.output, ...output } : output;

    return result;
  },
};
