'use strict';

/* eslint-disable
  no-shadow,
  global-require,
  multiline-ternary,
  array-bracket-spacing,
  space-before-function-paren
*/

// eslint-disable-next-line
const defaultTo = (value, def) => {
  return value == null ? def : value;
};

function version () {
  return `webpack-dev-server ${require('../package.json').version}\n` +
  `webpack ${require('webpack/package.json').version}`;
}

module.exports = { version, defaultTo };
