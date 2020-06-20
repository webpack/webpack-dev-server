'use strict';

/* global __resourceQuery __webpack_hot_emitter__ __webpack_dev_server_client__ */
/* eslint-disable
  camelcase
*/

const init = require('./bundle');

const hotEmitter =
  typeof __webpack_hot_emitter__ === 'undefined'
    ? null
    : __webpack_hot_emitter__;

const clientClass =
  typeof __webpack_dev_server_client__ === 'undefined'
    ? null
    : __webpack_dev_server_client__;

// this is needed to pass along the resource query to the client bundle
// that is compiled with webpack and babel-loader
init(__resourceQuery, hotEmitter, clientClass);
