"use strict";

module.exports = {
  mode: "development",
  context: __dirname,
  entry: {
    main: {
      import: "./foo.js",
    },
  },
};
