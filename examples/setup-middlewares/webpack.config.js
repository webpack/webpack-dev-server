"use strict";

// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
const { setup } = require("../util");

module.exports = setup({
  context: __dirname,
  entry: "./app.js",
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error("webpack-dev-server is not defined");
      }

      devServer.app.get("/setup-middleware/some/path", (_, response) => {
        response.send("setup-middlewares option GET");
      });

      middlewares.push({
        name: "hello-world-test-one",
        // `path` is optional
        path: "/foo/bar",
        middleware: (req, res) => {
          res.send("Foo Bar!");
        },
      });

      middlewares.push((req, res) => {
        res.send("Hello World!");
      });

      return middlewares;
    },
  },
});
