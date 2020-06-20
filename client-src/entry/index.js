'use strict';

/* global __resourceQuery __webpack_hot_emitter__ */
/* eslint-disable
  camelcase
*/

const init = require('./bundle');

const hotEmitter =
  typeof __webpack_hot_emitter__ === 'undefined'
    ? null
    : __webpack_hot_emitter__;
// this is needed to pass along the resource query to the client bundle
// that is compiled with webpack and babel-loader
init(__resourceQuery, hotEmitter);
