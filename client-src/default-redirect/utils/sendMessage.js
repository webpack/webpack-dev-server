'use strict';

/* global __resourceQuery */

// eslint-disable-next-line import/no-unresolved, import/no-dynamic-require
module.exports = require(`../default/utils/sendMessage${
  typeof __resourceQuery === 'string' ? __resourceQuery : ''
}`);
