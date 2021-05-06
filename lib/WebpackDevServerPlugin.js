'use strict';

const path = require('path');
const { validate } = require('schema-utils');
const isAbsoluteUrl = require('is-absolute-url');
const schema = require('./options.json');
const getSocketServerImplementation = require('./utils/getSocketServerImplementation');

class WebpackDevServerPlugin {
  constructor(options) {
    this.name = 'webpack-dev-server';
    this.options = options;

    validate(schema, options, this.name.replace(/-/g, ' '));

    this.sockets = [];
    this.staticWatchers = [];
    // Keep track of websocket proxies for external websocket upgrade.
    this.websocketProxies = [];
    // this value of ws can be overwritten for tests
    this.wsHeartbeatInterval = 30000;
  }

  apply(compiler) {
    this.normalizeOptions(compiler);
    this.logger = compiler.getInfrastructureLogger(this.name);
    this.SocketServerImplementation = getSocketServerImplementation(
      this.options
    );
  }

  normalizeOptions(compiler) {
    const defaultOptionsForStatic = {
      directory: path.join(process.cwd(), 'public'),
      staticOptions: {},
      publicPath: ['/'],
      serveIndex: { icons: true },
      // Respect options from compiler watchOptions
      watch: compiler.watchOptions,
    };

    if (typeof this.options.static === 'undefined') {
      this.options.static = [defaultOptionsForStatic];
    } else if (typeof this.options.static === 'boolean') {
      this.options.static = this.options.static
        ? [defaultOptionsForStatic]
        : false;
    } else if (typeof this.options.static === 'string') {
      this.options.static = [
        { ...defaultOptionsForStatic, directory: this.options.static },
      ];
    } else if (Array.isArray(this.options.static)) {
      this.options.static = this.options.static.map((item) => {
        if (typeof item === 'string') {
          return { ...defaultOptionsForStatic, directory: item };
        }

        return { ...defaultOptionsForStatic, ...item };
      });
    } else {
      this.options.static = [
        { ...defaultOptionsForStatic, ...this.options.static },
      ];
    }

    if (this.options.static) {
      this.options.static.forEach((staticOption) => {
        if (isAbsoluteUrl(staticOption.directory)) {
          throw new Error('Using a URL as static.directory is not supported');
        }

        // ensure that publicPath is an array
        if (typeof staticOption.publicPath === 'string') {
          staticOption.publicPath = [staticOption.publicPath];
        }

        // ensure that watch is an object if true
        if (staticOption.watch === true) {
          staticOption.watch = defaultOptionsForStatic.watch;
        }

        // ensure that serveIndex is an object if true
        if (staticOption.serveIndex === true) {
          staticOption.serveIndex = defaultOptionsForStatic.serveIndex;
        }
      });
    }

    this.options.hot =
      typeof this.options.hot === 'boolean' || this.options.hot === 'only'
        ? this.options.hot
        : true;
    this.options.liveReload =
      typeof this.options.liveReload !== 'undefined'
        ? this.options.liveReload
        : true;

    // normalize transportMode option
    if (typeof this.options.transportMode === 'undefined') {
      this.options.transportMode = {
        server: 'ws',
        client: 'ws',
      };
    } else {
      switch (typeof this.options.transportMode) {
        case 'string':
          this.options.transportMode = {
            server: this.options.transportMode,
            client: this.options.transportMode,
          };
          break;
        // if not a string, it is an object
        default:
          this.options.transportMode.server =
            this.options.transportMode.server || 'ws';
          this.options.transportMode.client =
            this.options.transportMode.client || 'ws';
      }
    }

    if (!this.options.client) {
      this.options.client = {};
    }

    // Enable client overlay by default
    if (typeof this.options.client.overlay === 'undefined') {
      this.options.client.overlay = true;
    }

    this.options.client.path = `/${
      this.options.client.path
        ? this.options.client.path.replace(/^\/|\/$/g, '')
        : 'ws'
    }`;

    this.options.devMiddleware = this.options.devMiddleware || {};

    if (typeof this.options.firewall === 'undefined') {
      // firewall is enabled by default
      this.options.firewall = true;
    }

    if (typeof this.options.setupExitSignals === 'undefined') {
      this.options.setupExitSignals = true;
    }
  }
}

module.exports = WebpackDevServerPlugin;
