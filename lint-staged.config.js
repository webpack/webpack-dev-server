"use strict";

module.exports = {
  "*.js": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,css}": ["prettier --write"],
};
