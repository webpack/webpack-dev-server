

import url from 'url';

// We handle legacy API that is Node.js specific, and a newer API that implements the same WHATWG URL Standard used by web browsers
// Please look at https://nodejs.org/api/url.html#url_url_strings_and_url_objects
function createSocketURL(parsedURL) {
  let { auth, hostname, protocol, port } = parsedURL;

  const getURLSearchParam = (name) => {
    if (parsedURL.searchParams) {
      return parsedURL.searchParams.get(name);
    }

    return parsedURL.query && parsedURL.query[name];
  };

  // Node.js module parses it as `::`
  // `new URL(urlString, [baseURLstring])` parses it as '[::]'
  const isInAddrAny =
    hostname === '0.0.0.0' || hostname === '::' || hostname === '[::]';

  // check ipv4 and ipv6 `all hostname`
  // why do we need this check?
  // hostname n/a for file protocol (example, when using electron, ionic)
  // see: https://github.com/webpack/webpack-dev-server/pull/384
  if (
    isInAddrAny &&
    self.location.hostname &&
    self.location.protocol.indexOf('http') === 0
  ) {
    hostname = self.location.hostname;
  }

  // `hostname` can be empty when the script path is relative. In that case, specifying a protocol would result in an invalid URL.
  // When https is used in the app, secure websockets are always necessary because the browser doesn't accept non-secure websockets.
  if (hostname && isInAddrAny && self.location.protocol === 'https:') {
    protocol = self.location.protocol;
  }

  const socketURLProtocol = protocol.replace(
    /^(?:http|.+-extension|file)/i,
    'ws'
  );

  // `new URL(urlString, [baseURLstring])` doesn't have `auth` property
  // Parse authentication credentials in case we need them
  if (parsedURL.username) {
    auth = parsedURL.username;

    // Since HTTP basic authentication does not allow empty username,
    // we only include password if the username is not empty.
    if (parsedURL.password) {
      // Result: <username>:<password>
      auth = auth.concat(':', parsedURL.password);
    }
  }

  const socketURLAuth = auth;

  // In case the host is a raw IPv6 address, it can be enclosed in
  // the brackets as the brackets are needed in the final URL string.
  // Need to remove those as url.format blindly adds its own set of brackets
  // if the host string contains colons. That would lead to non-working
  // double brackets (e.g. [[::]]) host
  //
  // All of these sock url params are optionally passed in through resourceQuery,
  // so we need to fall back to the default if they are not provided
  const socketURLHostname = (
    getURLSearchParam('host') ||
    hostname ||
    'localhost'
  ).replace(/^\[(.*)\]$/, '$1');

  if (!port || port === '0') {
    port = self.location.port;
  }

  const socketURLPort = getURLSearchParam('port') || port;

  // If path is provided it'll be passed in via the resourceQuery as a
  // query param so it has to be parsed out of the querystring in order for the
  // client to open the socket to the correct location.
  const socketURLPathname = getURLSearchParam('path') || '/ws';

  return url.format({
    protocol: socketURLProtocol,
    auth: socketURLAuth,
    hostname: socketURLHostname,
    port: socketURLPort,
    pathname: socketURLPathname,
    slashes: true,
  });
}

export default createSocketURL;
