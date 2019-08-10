import url from 'url';
import getUrlParts from './getUrlParts';

function createSocketUrl(resourceQuery) {
  const urlParts = getUrlParts(resourceQuery);

  return url.format({
    protocol: urlParts.protocol,
    auth: urlParts.auth,
    hostname: urlParts.sockHost,
    port: urlParts.sockPort,
    // If sockPath is provided it'll be passed in via the resourceQuery as a
    // query param so it has to be parsed out of the querystring in order for the
    // client to open the socket to the correct location.
    pathname: urlParts.sockPath,
  });
}

export default createSocketUrl;
