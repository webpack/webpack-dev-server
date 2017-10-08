'use strict';

/* polyfills for Node 4.8.x users */

// internal-ip@2.x uses [].includes
const includes = require('array-includes');

includes.shim();
