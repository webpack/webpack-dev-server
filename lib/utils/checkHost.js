'use strict';

/* eslint-disable
  space-before-function-paren,
  multiline-ternary
*/
const url = require('url');
const ip = require('ip');

// Need avoid using `this` and pass options as second argument, but it is breaking change
// Need rewrite in next major release
function checkHost (headers) {
  // allow user to opt-out this security check, at own risk
  if (this.disableHostCheck) {
    return true;
  }
  // get the Host header and extract hostname
  // we don't care about port not matching
  const hostHeader = headers.host;

  if (!hostHeader) {
    return false;
  }

  // use the node url-parser to retrieve the hostname from the host-header.
  const hostname = url.parse(`//${hostHeader}`, false, true).hostname;
  // always allow requests with explicit IPv4 or IPv6-address.
  // A note on IPv6 addresses:
  // hostHeader will always contain the brackets denoting
  // an IPv6-address in URLs,
  // these are removed from the hostname in url.parse(),
  // so we have the pure IPv6-address in hostname.
  if (ip.isV4Format(hostname) || ip.isV6Format(hostname)) {
    return true;
  }
  // always allow localhost host, for convience
  if (hostname === 'localhost') {
    return true;
  }
  // allow if hostname is in allowedHosts
  if (this.allowedHosts && this.allowedHosts.length) {
    for (let hostIdx = 0; hostIdx < this.allowedHosts.length; hostIdx++) {
      const allowedHost = this.allowedHosts[hostIdx];

      if (allowedHost === hostname) {
        return true;
      }

      // support "." as a subdomain wildcard
      // e.g. ".example.com" will allow "example.com", "www.example.com", "subdomain.example.com", etc
      if (allowedHost[0] === '.') {
        // "example.com"
        if (hostname === allowedHost.substring(1)) {
          return true;
        }
        // "*.example.com"
        if (hostname.endsWith(allowedHost)) {
          return true;
        }
      }
    }
  }

  // allow hostname of listening adress
  if (hostname === this.hostname) {
    return true;
  }

  // also allow public hostname if provided
  if (typeof this.publicHost === 'string') {
    const idxPublic = this.publicHost.indexOf(':');

    const publicHostname = idxPublic >= 0
      ? this.publicHost.substr(0, idxPublic)
      : this.publicHost;

    if (hostname === publicHostname) {
      return true;
    }
  }

  // disallow
  return false;
}

module.exports = checkHost;
