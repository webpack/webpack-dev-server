"use strict";

module.exports = {
  "*": ["prettier --write --ignore-unknown"],
  "*.js": ["eslint --cache --fix"],
};
