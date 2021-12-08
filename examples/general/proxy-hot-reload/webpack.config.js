"use strict";

const fs = require("fs");
// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
const { setup } = require("../../util");
const proxyConfig = require("./proxy-config");

let proxyOptions = {
  context: "/api",
  target: proxyConfig.target,
  pathRewrite: proxyConfig.pathRewrite,
  changeOrigin: true,
};

fs.watch("./proxy-config.js", () => {
  delete require.cache[require.resolve("./proxy-config")];
  try {
    const newProxyConfig = require("./proxy-config");
    if (proxyOptions.target !== newProxyConfig.target) {
      console.log("Proxy target changed:", newProxyConfig.target);
      proxyOptions = {
        context: "/api",
        target: newProxyConfig.target,
        pathRewrite: newProxyConfig.pathRewrite,
        changeOrigin: true,
      };
    }
  } catch (e) {
    // ignore
  }
});

module.exports = setup({
  context: __dirname,
  entry: "./app.js",
  devServer: {
    proxy: [
      function proxy() {
        return proxyOptions;
      },
    ],
  },
});
