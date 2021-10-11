"use strict";

const express = require("express");
// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
const { setup } = require("../util");

async function listenProxyServer() {
  const proxyApp = express();

  proxyApp.get("/proxy", (req, res) => {
    res.send("response from proxy");
  });

  await new Promise((resolve) => {
    proxyApp.listen(5000, () => {
      resolve();
    });
  });
}

module.exports = setup({
  context: __dirname,
  entry: "./app.js",
  devServer: {
    onBeforeSetupMiddleware: async () => {
      await listenProxyServer();
    },
    proxy: {
      "/proxy": {
        target: "http://localhost:5000",
      },
    },
  },
});
