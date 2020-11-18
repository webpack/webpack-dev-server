'use strict';

const addEntries = require('./addEntries');

function updateCompiler(compiler, options) {
  // it's possible that we should clone the config before doing
  // this, but it seems safe not to since it actually reflects
  // the changes we are making to the compiler
  // important: this relies on the fact that addEntries now
  // prevents duplicate new entries.
  addEntries(compiler, options);
}

module.exports = updateCompiler;
