'use strict';

const fs = require('fs');
const path = require('path');

const findCacheDir = () => {
  const cwd = process.cwd();
  let dir = cwd;
  for (;;) {
    try {
      if (fs.statSync(path.join(dir, 'package.json')).isFile()) break;
      // eslint-disable-next-line no-empty
    } catch (e) {}
    const parent = path.dirname(dir);
    if (dir === parent) {
      // eslint-disable-next-line no-undefined
      dir = undefined;
      break;
    }
    dir = parent;
  }
  if (!dir) {
    return path.resolve(cwd, '.cache/webpack');
  } else if (process.versions.pnp === '1') {
    return path.resolve(dir, '.pnp/.cache/webpack');
  } else if (process.versions.pnp === '3') {
    return path.resolve(dir, '.yarn/.cache/webpack');
  }
  return path.resolve(dir, 'node_modules/.cache/webpack');
};

module.exports = findCacheDir;
