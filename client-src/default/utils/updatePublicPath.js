'use strict';

/* global __webpack_public_path__ */

const url = require('url');
const getUrlParts = require('./getUrlParts');

function updatePublicPath(resourceQuery) {
  const urlParts = getUrlParts(resourceQuery);

  let publicPath = urlParts.publicPath;

  // this tests if publicPath is relative, and makes it an absolute url if it is
  // will match something of the form '/.../', or simply '/'
  if (/^\/.*\/$|^\/$/.test(publicPath)) {
    publicPath = url.format({
      protocol: urlParts.protocol,
      auth: urlParts.auth,
      hostname: urlParts.defaultHost,
      port: urlParts.defaultPort,
      pathname: urlParts.publicPath,
    });
  }

  // eslint-disable-next-line no-global-assign, camelcase
  __webpack_public_path__ = __webpack_public_path__ || publicPath;
}

module.exports = updatePublicPath;
