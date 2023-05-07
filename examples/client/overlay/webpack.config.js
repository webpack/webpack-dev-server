"use strict";

// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
const { setup } = require("../../util");

module.exports = setup({
  context: __dirname,
  // create error for overlay
  entry: "./app.js",
  devServer: {
    client: {
      overlay: {
        warnings: false,
        runtimeErrors: (msg) => {
          if (msg) {
            if (msg instanceof DOMException && msg.name === "AbortError") {
              return false;
            }

            let msgString;

            if (msg instanceof Error) {
              msgString = msg.message;
            } else if (typeof msg === "string") {
              msgString = msg;
            }

            if (msgString) {
              return !/something/i.test(msgString);
            }
          }

          return true;
        },
      },
    },
  },
  // uncomment to test for IE
  // target: ["web", "es5"],
});
