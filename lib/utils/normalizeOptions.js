'use strict';

const os = require('os');
const path = require('path');
const del = require('del');
const fs = require('graceful-fs');
const getCompilerConfigArray = require('./getCompilerConfigArray');

function normalizeOptions(compiler, options, logger, cacheDir) {
  // TODO: improve this to not use .find for compiler watchOptions
  const configArray = getCompilerConfigArray(compiler);
  const watchOptionsConfig = configArray.find(
    (config) => config.watch !== false && config.watchOptions
  );
  const watchOptions = watchOptionsConfig
    ? watchOptionsConfig.watchOptions
    : {};

  const defaultOptionsForStatic = {
    directory: path.join(process.cwd(), 'public'),
    staticOptions: {},
    publicPath: ['/'],
    serveIndex: { icons: true },
    // Respect options from compiler watchOptions
    watch: watchOptions,
  };

  if (typeof options.allowedHosts === 'undefined') {
    // allowedHosts allows some default hosts picked from
    // `options.host` or `webSocketURL.hostname` and `localhost`
    options.allowedHosts = 'auto';
  }
  if (
    typeof options.allowedHosts === 'string' &&
    options.allowedHosts !== 'auto' &&
    options.allowedHosts !== 'all'
  ) {
    // we store allowedHosts as array when supplied as string
    options.allowedHosts = [options.allowedHosts];
  }

  if (
    typeof options.client === 'undefined' ||
    (typeof options.client === 'object' && options.client !== null)
  ) {
    if (!options.client) {
      options.client = {};
    }

    if (typeof options.client.webSocketURL === 'undefined') {
      options.client.webSocketURL = {};
    } else if (typeof options.client.webSocketURL === 'string') {
      const parsedURL = new URL(options.client.webSocketURL);

      options.client.webSocketURL = {
        protocol: parsedURL.protocol,
        hostname: parsedURL.hostname,
        port: parsedURL.port.length > 0 ? Number(parsedURL.port) : '',
        pathname: parsedURL.pathname,
        username: parsedURL.username,
        password: parsedURL.password,
      };
    } else if (typeof options.client.webSocketURL.port === 'string') {
      options.client.webSocketURL.port = Number(
        options.client.webSocketURL.port
      );
    }

    // Enable client overlay by default
    if (typeof options.client.overlay === 'undefined') {
      options.client.overlay = true;
    } else if (typeof options.client.overlay !== 'boolean') {
      options.client.overlay = {
        errors: true,
        warnings: true,
        ...options.client.overlay,
      };
    }
  }

  if (typeof options.compress === 'undefined') {
    options.compress = true;
  }

  options.devMiddleware = options.devMiddleware || {};

  options.hot =
    typeof options.hot === 'boolean' || options.hot === 'only'
      ? options.hot
      : true;

  // if the user enables http2, we can safely enable https
  if ((options.http2 && !options.https) || options.https === true) {
    options.https = {
      requestCert: false,
    };
  }

  // https option
  if (options.https) {
    for (const property of ['cacert', 'pfx', 'key', 'cert']) {
      const value = options.https[property];
      const isBuffer = value instanceof Buffer;

      if (value && !isBuffer) {
        let stats = null;

        try {
          stats = fs.lstatSync(fs.realpathSync(value)).isFile();
        } catch (error) {
          // ignore error
        }

        // It is file
        options.https[property] = stats
          ? fs.readFileSync(path.resolve(value))
          : value;
      }
    }

    let fakeCert;

    if (!options.https.key || !options.https.cert) {
      const certificateDir = cacheDir || os.tmpdir();
      const certificatePath = path.join(certificateDir, 'server.pem');
      let certificateExists = fs.existsSync(certificatePath);

      if (certificateExists) {
        const certificateTtl = 1000 * 60 * 60 * 24;
        const certificateStat = fs.statSync(certificatePath);

        const now = new Date();

        // cert is more than 30 days old, kill it with fire
        if ((now - certificateStat.ctime) / certificateTtl > 30) {
          logger.info('SSL Certificate is more than 30 days old. Removing.');

          del.sync([certificatePath], { force: true });

          certificateExists = false;
        }
      }

      if (!certificateExists) {
        logger.info('Generating SSL Certificate');

        const selfsigned = require('selfsigned');
        const attributes = [{ name: 'commonName', value: 'localhost' }];
        const pems = selfsigned.generate(attributes, {
          algorithm: 'sha256',
          days: 30,
          keySize: 2048,
          extensions: [
            // {
            //   name: 'basicConstraints',
            //   cA: true,
            // },
            {
              name: 'keyUsage',
              keyCertSign: true,
              digitalSignature: true,
              nonRepudiation: true,
              keyEncipherment: true,
              dataEncipherment: true,
            },
            {
              name: 'extKeyUsage',
              serverAuth: true,
              clientAuth: true,
              codeSigning: true,
              timeStamping: true,
            },
            {
              name: 'subjectAltName',
              altNames: [
                {
                  // type 2 is DNS
                  type: 2,
                  value: 'localhost',
                },
                {
                  type: 2,
                  value: 'localhost.localdomain',
                },
                {
                  type: 2,
                  value: 'lvh.me',
                },
                {
                  type: 2,
                  value: '*.lvh.me',
                },
                {
                  type: 2,
                  value: '[::1]',
                },
                {
                  // type 7 is IP
                  type: 7,
                  ip: '127.0.0.1',
                },
                {
                  type: 7,
                  ip: 'fe80::1',
                },
              ],
            },
          ],
        });

        fs.mkdirSync(certificateDir, { recursive: true });
        fs.writeFileSync(certificatePath, pems.private + pems.cert, {
          encoding: 'utf8',
        });
      }

      fakeCert = fs.readFileSync(certificatePath);
    }

    options.https.key = options.https.key || fakeCert;
    options.https.cert = options.https.cert || fakeCert;
  }

  if (typeof options.ipc === 'boolean') {
    const isWindows = process.platform === 'win32';
    const pipePrefix = isWindows ? '\\\\.\\pipe\\' : os.tmpdir();
    const pipeName = 'webpack-dev-server.sock';

    options.ipc = path.join(pipePrefix, pipeName);
  }

  options.liveReload =
    typeof options.liveReload !== 'undefined' ? options.liveReload : true;

  // https://github.com/webpack/webpack-dev-server/issues/1990
  const defaultOpenOptions = { wait: false };
  const getOpenItemsFromObject = ({ target, ...rest }) => {
    const normalizedOptions = { ...defaultOpenOptions, ...rest };

    if (typeof normalizedOptions.app === 'string') {
      normalizedOptions.app = {
        name: normalizedOptions.app,
      };
    }

    const normalizedTarget = typeof target === 'undefined' ? '<url>' : target;

    if (Array.isArray(normalizedTarget)) {
      return normalizedTarget.map((singleTarget) => {
        return { target: singleTarget, options: normalizedOptions };
      });
    }

    return [{ target: normalizedTarget, options: normalizedOptions }];
  };

  if (typeof options.open === 'undefined') {
    options.open = [];
  } else if (typeof options.open === 'boolean') {
    options.open = options.open
      ? [{ target: '<url>', options: defaultOpenOptions }]
      : [];
  } else if (typeof options.open === 'string') {
    options.open = [{ target: options.open, options: defaultOpenOptions }];
  } else if (Array.isArray(options.open)) {
    const result = [];

    options.open.forEach((item) => {
      if (typeof item === 'string') {
        result.push({ target: item, options: defaultOpenOptions });

        return;
      }

      result.push(...getOpenItemsFromObject(item));
    });

    options.open = result;
  } else {
    options.open = [...getOpenItemsFromObject(options.open)];
  }

  if (typeof options.port === 'string' && options.port !== 'auto') {
    options.port = Number(options.port);
  }

  /**
   * Assume a proxy configuration specified as:
   * proxy: {
   *   'context': { options }
   * }
   * OR
   * proxy: {
   *   'context': 'target'
   * }
   */
  if (typeof options.proxy !== 'undefined') {
    if (!Array.isArray(options.proxy)) {
      if (Object.prototype.hasOwnProperty.call(options.proxy, 'target')) {
        options.proxy = [options.proxy];
      } else {
        options.proxy = Object.keys(options.proxy).map((context) => {
          let proxyOptions;
          // For backwards compatibility reasons.
          const correctedContext = context
            .replace(/^\*$/, '**')
            .replace(/\/\*$/, '');

          if (typeof options.proxy[context] === 'string') {
            proxyOptions = {
              context: correctedContext,
              target: options.proxy[context],
            };
          } else {
            proxyOptions = { ...options.proxy[context] };
            proxyOptions.context = correctedContext;
          }

          const getLogLevelForProxy = (level) => {
            if (level === 'none') {
              return 'silent';
            }

            if (level === 'log') {
              return 'info';
            }

            if (level === 'verbose') {
              return 'debug';
            }

            return level;
          };

          const configs = getCompilerConfigArray(compiler);
          const configWithDevServer =
            configs.find((config) => config.devServer) || configs[0];

          if (typeof proxyOptions.logLevel === 'undefined') {
            proxyOptions.logLevel = getLogLevelForProxy(
              configWithDevServer.infrastructureLogging.level
            );
          }

          if (typeof proxyOptions.logProvider === 'undefined') {
            proxyOptions.logProvider = () => logger;
          }

          return proxyOptions;
        });
      }
    }
  }

  if (typeof options.setupExitSignals === 'undefined') {
    options.setupExitSignals = true;
  }

  if (typeof options.static === 'undefined') {
    options.static = [defaultOptionsForStatic];
  } else if (typeof options.static === 'boolean') {
    options.static = options.static ? [defaultOptionsForStatic] : false;
  } else if (typeof options.static === 'string') {
    options.static = [
      { ...defaultOptionsForStatic, directory: options.static },
    ];
  } else if (Array.isArray(options.static)) {
    options.static = options.static.map((item) => {
      if (typeof item === 'string') {
        return { ...defaultOptionsForStatic, directory: item };
      }

      return { ...defaultOptionsForStatic, ...item };
    });
  } else {
    options.static = [{ ...defaultOptionsForStatic, ...options.static }];
  }

  if (options.static) {
    const isAbsoluteUrl = require('is-absolute-url');

    options.static.forEach((staticOption) => {
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

  const defaultWebSocketServerType = 'ws';
  const defaultWebSocketServerOptions = { path: '/ws' };

  if (typeof options.webSocketServer === 'undefined') {
    options.webSocketServer = {
      type: defaultWebSocketServerType,
      options: defaultWebSocketServerOptions,
    };
  } else if (
    typeof options.webSocketServer === 'boolean' &&
    !options.webSocketServer
  ) {
    options.webSocketServer = false;
  } else if (
    typeof options.webSocketServer === 'string' ||
    typeof options.webSocketServer === 'function'
  ) {
    options.webSocketServer = {
      type: options.webSocketServer,
      options: defaultWebSocketServerOptions,
    };
  } else {
    options.webSocketServer = {
      type: options.webSocketServer.type || defaultWebSocketServerType,
      options: {
        ...defaultWebSocketServerOptions,
        ...options.webSocketServer.options,
      },
    };

    if (typeof options.webSocketServer.options.port === 'string') {
      options.webSocketServer.options.port = Number(
        options.webSocketServer.options.port
      );
    }
  }
}

module.exports = normalizeOptions;
