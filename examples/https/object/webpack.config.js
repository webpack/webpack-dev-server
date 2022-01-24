"use strict";

// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
const { setup } = require("../../util");

module.exports = setup({
  context: __dirname,
  entry: "./app.js",
  devServer: {
    https: {
      key: "./ssl/server.key",
      pfx: "./ssl/server.pfx",
      cert: "./ssl/server.crt",
      ca: "./ssl/ca.pem",
      passphrase: "webpack-dev-server",
      requestCert: true,
    },
  },
});
