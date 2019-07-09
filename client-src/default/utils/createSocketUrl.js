'use strict';

/* global self */

const url = require('url');
const querystring = require('querystring');
const getCurrentScriptSource = require('./getCurrentScriptSource');

function createSocketUrl(resourceQuery) {
  let urlParts;

  if (typeof resourceQuery === 'string' && resourceQuery !== '') {
    // If this bundle is inlined, use the resource query to get the correct url.
    urlParts = url.parse(resourceQuery.substr(1));
  } else {
    // Else, get the url from the <script> this file was called with.
    let scriptHost = getCurrentScriptSource();

    // eslint-disable-next-line no-useless-escape
    scriptHost = scriptHost.replace(/\/[^\/]+$/, '');
    urlParts = url.parse(scriptHost || '/', false, true);
  }

  if (!urlParts.port || urlParts.port === '0') {
    urlParts.port = self.location.port;
  }

  const { auth, path } = urlParts;
  let { hostname, protocol } = urlParts;

  // check ipv4 and ipv6 `all hostname`
  // why do we need this check?
  // hostname n/a for file protocol (example, when using electron, ionic)
  // see: https://github.com/webpack/webpack-dev-server/pull/384
  const isAnyHostname =
    (hostname === '0.0.0.0' || hostname === '::') &&
    self.location.hostname &&
    // eslint-disable-next-line no-bitwise
    !!~self.location.protocol.indexOf('http');

  if (isAnyHostname) {
    hostname = self.location.hostname;
  }

  // `hostname` can be empty when the script path is relative. In that case, specifying
  // a protocol would result in an invalid URL.
  // When https is used in the app, secure websockets are always necessary
  // because the browser doesn't accept non-secure websockets.
  if (
    hostname &&
    (self.location.protocol === 'https:' || urlParts.hostname === '0.0.0.0')
  ) {
    protocol = self.location.protocol;
  }

  // default values of the sock url if they are not provided
  let sockHost = hostname;
  let sockPath = '/sockjs-node';
  let sockPort = urlParts.port;

  // eslint-disable-next-line no-undefined
  const shouldParsePath = path !== null && path !== undefined && path !== '/';
  if (shouldParsePath) {
    const parsedQuery = querystring.parse(path);
    // all of these sock url params are optionally passed in through
    // resourceQuery, so we need to fall back to the default if
    // they are not provided
    sockHost = parsedQuery.sockHost || sockHost;
    sockPath = parsedQuery.sockPath || sockPath;
    sockPort = parsedQuery.sockPort || sockPort;
  }

  return url.format({
    protocol,
    auth,
    hostname: sockHost,
    port: sockPort,
    // If sockPath is provided it'll be passed in via the resourceQuery as a
    // query param so it has to be parsed out of the querystring in order for the
    // client to open the socket to the correct location.
    pathname: sockPath,
  });
}

module.exports = createSocketUrl;
