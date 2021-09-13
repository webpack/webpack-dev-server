"use strict";

// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
const { setup } = require("../../util");

module.exports = setup({
  context: __dirname,
  entry: "./app.js",
  devServer: {
    headers: () => {
      return { "X-Custom-Header": ["key1=value1", "key2=value2"] };
    },
  },
});
