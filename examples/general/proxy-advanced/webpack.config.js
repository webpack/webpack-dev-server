"use strict";

// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
const { setup } = require("../../util");

module.exports = setup({
  context: __dirname,
  entry: "./app.js",
  devServer: {
    port: 8080,
    static: {
      directory: ".",
    },
    proxy: [
      {
        context: "/api/nope",
        router: () => "http://localhost:8080",
        pathRewrite: () => "/bypass.html",
      },
      {
        context: "/api",
        target: "http://jsonplaceholder.typicode.com/",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "",
        },
      },
    ],
  },
});
