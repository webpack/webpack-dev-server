'use strict';

/* global self */

const url = require('url');

/*
 * Gets socket URL based on Script Source/Location
 * (scriptSrc: URL, location: URL) -> URL
 */
function createSocketUrl(urlParts, loc) {
  // Use parameter to allow passing location in unit tests
  if (typeof loc === 'string' && loc !== '') {
    loc = url.parse(loc);
  } else {
    loc = self.location;
  }

  const { auth, query } = urlParts;
  let { hostname, protocol, port } = urlParts;

  const isInaddrAny = hostname === '0.0.0.0' || hostname === '::';

  if (!port || port === '0') {
    port = loc.port;
  }

  // check ipv4 and ipv6 `all hostname`
  // why do we need this check?
  // hostname n/a for file protocol (example, when using electron, ionic)
  // see: https://github.com/webpack/webpack-dev-server/pull/384
  if (isInaddrAny && loc.hostname && loc.protocol.indexOf('http') === 0) {
    hostname = loc.hostname;
  }

  // `hostname` can be empty when the script path is relative. In that case, specifying
  // a protocol would result in an invalid URL.
  // When https is used in the app, secure websockets are always necessary
  // because the browser doesn't accept non-secure websockets.
  if (
    hostname &&
    hostname !== '127.0.0.1' &&
    (loc.protocol === 'https:' || isInaddrAny)
  ) {
    protocol = loc.protocol;
  }

  // all of these sock url params are optionally passed in through
  // resourceQuery, so we need to fall back to the default if
  // they are not provided
  const host = query.host || hostname;
  const path = query.path || '/ws';
  let portOption = query.port || port;

  if (portOption === 'location') {
    portOption = loc.port;
  }

  return url.format({
    protocol,
    auth,
    hostname: host,
    port: portOption,
    // If path is provided it'll be passed in via the resourceQuery as a
    // query param so it has to be parsed out of the querystring in order for the
    // client to open the socket to the correct location.
    pathname: path,
  });
}

module.exports = createSocketUrl;
