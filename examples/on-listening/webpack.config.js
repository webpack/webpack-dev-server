"use strict";

// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
const { setup } = require("../util");

module.exports = setup({
  context: __dirname,
  entry: "./app.js",
  devServer: {
    onListening: (devServer) => {
      const port = devServer.server.address().port;
      console.log("Listening on port:", port);
    },
  },
});
