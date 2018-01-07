'use strict';

const url = require('url');
const internalIp = require('internal-ip');
const ip = require('ip');

module.exports = {

  addEntry(webpackOptions, devServerOptions, server) {
    if (devServerOptions.inline !== false) {
      // we're stubbing the app in this method as it's static and doesn't require
      // a server to be supplied. createDomain requires an app with the
      // address() signature.
      const app = server || {
        address() {
          return { port: devServerOptions.port };
        }
      };
      const domain = module.exports.createDomain(devServerOptions, app);
      const devClient = [`${require.resolve('./client/js/')}?${domain}`];

      if (devServerOptions.hotOnly) {
        devClient.push('webpack/hot/only-dev-server');
      } else if (devServerOptions.hot) {
        devClient.push('webpack/hot/dev-server');
      }

      [].concat(webpackOptions).forEach((wpOpt) => {
        // since devServer only inspects the first compiler options in an array
        // config, double check the subsequent configs to make sure they're
        // not setting inline.
        if (wpOpt.devServer && wpOpt.devServer.inline === false) {
          return;
        }

        if (typeof wpOpt.entry === 'object' && !Array.isArray(wpOpt.entry)) {
          Object.keys(wpOpt.entry).forEach((key) => {
            wpOpt.entry[key] = devClient.concat(wpOpt.entry[key]);
          });
        } else if (typeof wpOpt.entry === 'function') {
          wpOpt.entry = wpOpt.entry(devClient);
        } else {
          wpOpt.entry = devClient.concat(wpOpt.entry);
        }
      });
    }
  },

  createDomain(options, server) {
    const protocol = options.https ? 'https' : 'http';
    const appPort = server ? server.address().port : 0;
    const port = options.socket ? 0 : appPort;
    const hostname = options.useLocalIp ? internalIp.v4.sync() : options.host;

    // use explicitly defined public url (prefix with protocol if not explicitly given)
    if (options.public) {
      return /^[a-zA-Z]+:\/\//.test(options.public) ? `${options.public}` : `${protocol}://${options.public}`;
    }
    // the formatted domain (url without path) of the webpack server
    return url.format({
      protocol,
      hostname,
      port
    });
  },

  sendStats(socket, devServer, options) {
    const { force, stats } = options;

    if (!stats) {
      devServer.log.error('sendStats: options.stats is undefined');
    }

    if (stats.errors && stats.errors.length > 0) {
      this.send(socket, devServer, 'errors', stats.errors);
      return;
    }

    if (!force && stats.assets && stats.assets.every(asset => !asset.emitted)) {
      this.send(socket, devServer, 'still-ok');
      return;
    }

    this.send(socket, devServer, 'hash', stats.hash);

    if (stats.warnings.length > 0) {
      this.send(socket, devServer, 'warnings', stats.warnings);
    } else {
      this.send(socket, devServer, 'ok');
    }
  },

  send(socket, devServer, type, data) {
    if (socket.readyState !== socket.OPEN) {
      return;
    }

    const str = JSON.stringify({ type, data });

    devServer.log.debug('ws.send:', str);
    socket.send(str);

    // emit the same events we're sending through websockets, so interested
    // parties can tune in via API without connecitng a client socket
    devServer.emit(`ws-${type}`, data);
  },

  validateHost(headers, options) {
    // allow user to opt-out this security check, at own risk
    if (options.disableHostCheck) {
      return true;
    }

    // get the Host header and extract hostname
    // we don't care about port not matching
    const hostHeader = headers.host;

    if (!hostHeader) {
      return false;
    }

    // use the node url-parser to retrieve the hostname from the host-header.
    const { hostname } = url.parse(`//${hostHeader}`, false, true);

    // always allow requests with explicit IPv4 or IPv6-address.
    // A note on IPv6 addresses: hostHeader will always contain the brackets denoting
    // an IPv6-address in URLs, these are removed from the hostname in url.parse(),
    // so we have the pure IPv6-address in hostname.
    if (ip.isV4Format(hostname) || ip.isV6Format(hostname)) {
      return true;
    }

    // always allow localhost host, for convience
    if (hostname === 'localhost') {
      return true;
    }

    const { allowedHosts } = options;

    // allow if hostname is in allowedHosts
    if (allowedHosts && allowedHosts.length) {
      for (let hostIdx = 0; hostIdx < allowedHosts.length; hostIdx++) {
        const allowedHost = allowedHosts[hostIdx];
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
    if (hostname === options.activeHostname) {
      return true;
    }

    const publicHost = options.public;
    // also allow public hostname if provided
    if (typeof publicHost === 'string') {
      const idxPublic = publicHost.indexOf(':');
      const publicHostname = idxPublic >= 0 ? publicHost.substr(0, idxPublic) : publicHost;
      if (hostname === publicHostname) {
        return true;
      }
    }

    // disallow
    return false;
  }

};
