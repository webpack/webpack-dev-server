// we'll delete this file when Node8 is not supported.
// because we can use fs.promise

'use strict';

const { promisify } = require('util');
const { writeFile, unlink } = require('fs');

const unlinkAsync = promisify(unlink);
const writeAsync = promisify(writeFile);

module.exports = {
  unlinkAsync,
  writeAsync,
};
