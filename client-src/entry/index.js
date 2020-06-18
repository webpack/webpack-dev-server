'use strict';

/* global __resourceQuery */

const init = require('../default');

// this is needed to pass along the resource query to the client bundle
// that is compiled with webpack and babel-loader
init(__resourceQuery);
