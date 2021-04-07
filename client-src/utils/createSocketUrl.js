'use strict';

const url = require('url');

function createSocketUrl(parsedURL) {
  const { auth, query } = parsedURL;
  let { hostname, protocol, port } = parsedURL;

  const isInaddrAny = hostname === '0.0.0.0' || hostname === '::';

  if (!port || port === '0') {
    port = self.location.port;
  }

  // check ipv4 and ipv6 `all hostname`
  // why do we need this check?
  // hostname n/a for file protocol (example, when using electron, ionic)
  // see: https://github.com/webpack/webpack-dev-server/pull/384
  if (
    isInaddrAny &&
    self.location.hostname &&
    self.location.protocol.indexOf('http') === 0
  ) {
    hostname = self.location.hostname;
  }

  // `hostname` can be empty when the script path is relative. In that case, specifying
  // a protocol would result in an invalid URL.
  // When https is used in the app, secure websockets are always necessary
  // because the browser doesn't accept non-secure websockets.
  if (
    hostname &&
    hostname !== '127.0.0.1' &&
    (self.location.protocol === 'https:' || isInaddrAny)
  ) {
    protocol = self.location.protocol;
  }

  // all of these sock url params are optionally passed in through
  // resourceQuery, so we need to fall back to the default if
  // they are not provided
  let host = query.host || hostname;
  const path = query.path || '/ws';
  let portOption = query.port || port;

  if (portOption === 'location') {
    portOption = self.location.port;
  }

  // In case the host is a raw IPv6 address, it can be enclosed in
  // the brackets as the brackets are needed in the final URL string.
  // Need to remove those as url.format blindly adds its own set of brackets
  // if the host string contains colons. That would lead to non-working
  // double brackets (e.g. [[::]]) host
  host = typeof host === 'string' ? host.replace(/^\[(.*)\]$/, '$1') : host;

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
