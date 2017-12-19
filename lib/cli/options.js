'use strict';

const fs = require('fs');
const path = require('path');
const portfinder = require('portfinder');
const weblog = require('webpack-log');

const DEFAULT_PORT = 8080;

function copyFlags(argv) {
  const result = {};
  const keys = Object.keys(argv).filter((key) => { // eslint-disable-line arrow-body-style
    return key && typeof key === 'string' && key.length > 1 &&
           key.indexOf('-') === -1 && key.indexOf('$0') === -1;
  });

  // only set these keys on the result object if their argv value is falsy
  const falsy = ['inline', 'hot', 'hotOnly', 'clientLogLevel'];
  const skip = ['info', 'allowedHosts', 'color', 'colors', 'host', 'contentBase',
    'stats', 'cert', 'key', 'cacert', 'pfx', 'open', 'openPage'];
  const flags = keys.filter(x => skip.indexOf(x) < 0);

  for (const key of flags) {
    const value = argv[key];
    if (value || (falsy.includes(key) && !value)) {
      result[key] = value;
    }
  }

  return result;
}

function parseFlags(argv, options) {
  const result = {};

  if (argv.stdin) {
    process.stdin.on('end', () => {
      process.exit(0); // eslint-disable-line no-process-exit
    });
    process.stdin.resume();
  }

  result.info = argv.info;

  if (argv.host !== 'localhost' || !options.host) {
    result.host = argv.host;
  }

  if (argv['allowed-hosts']) {
    result.allowedHosts = argv['allowed-hosts'].split(',');
  }

  for (const key of ['cacert', 'cert', 'key', 'pfx']) {
    if (argv[key]) {
      result[key] = fs.readFileSync(path.resolve(argv[key]));
    }
  }

  if (argv['open-page']) {
    result.open = true;
    result.openPage = argv['open-page'];
  }

  if (typeof argv.open !== 'undefined') {
    result.open = argv.open !== '' ? argv.open : true;
  }

  return result;
}

function getContentBase(argv, options) {
  let result = options.contentBase;

  if (options.contentBase) {
    return result;
  }

  if (argv.contentBase == null) {
    return;
  } else if (argv['content-base'] === false) {
    result = false;
  } else {
    const base = argv.contentBase;

    if (Array.isArray(base)) {
      result = base.map(val => path.resolve(val));
    }
    // It is possible to disable the contentBase by using `--no-content-base`,
    // which results in arg["content-base"] = false
  }

  return result;
}

function getPort(argv, options) {
  // Kind of weird, but ensures prior behavior isn't broken in cases
  // that wouldn't throw errors. E.g. both argv.port and options.port
  // were specified, but since argv.port is 8080, options.port will be
  // tried first instead.
  let port = DEFAULT_PORT;

  if (argv.port === DEFAULT_PORT) {
    port = options.port || argv.port;
  } else {
    port = argv.port || options.port;
  }

  return new Promise((resolve, reject) => {
    if (options.port != null) {
      resolve(port);
    } else {
      portfinder.basePort = DEFAULT_PORT;
      portfinder.getPort((err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    }
  });
}

function awaitOptions(argv, options) {
  const log = weblog({
    name: 'wds',
    logLevel: options.logLevel,
    logTime: options.logTime
  });

  // support webpack options which return a promise by asserting that all
  // passed options are wrapped in a promise
  if (typeof options.then !== 'function') {
    options = Promise.resolve(options);
  }

  return options
    .then((webpackOptions) => {
      let first = webpackOptions;

      if (Array.isArray(webpackOptions)) {
        [first] = first;
      }

      const base = webpackOptions.devServer || first.devServer || {};
      const flags = Object.assign(copyFlags(argv), parseFlags(argv, base));

      // this isn't a valid API options so prune it from argv, which is merged
      // with defaults and passed to the API
      delete flags.stdin;

      const result = Object.assign(base, flags);
      const contentBase = getContentBase(argv, result);

      if (contentBase) {
        result.contentBase = contentBase;
      }

      if (!result.stats) {
        result.stats = {
          cached: false,
          cachedAssets: false
        };
      }

      if (typeof result.stats === 'object' && typeof result.stats.colors === 'undefined') {
        result.stats.colors = argv.color;
      }

      if (result.open && !result.openPage) {
        result.openPage = '';
      }

      if (!result.publicPath) {
        result.publicPath = (first.output) && (first.output.publicPath || '');
        if (!/^(https?:)?\/\//.test(result.publicPath) && result.publicPath[0] !== '/') {
          result.publicPath = `/${result.publicPath}`;
        }
      }

      if (!result.filename) {
        result.filename = first.output && first.output.filename;
      }

      if (!result.watchOptions) {
        result.watchOptions = first.watchOptions;
      }

      return { devServerOptions: result, log, webpackOptions };
    })
    .catch((e) => {
      log.error(e.stack || e);
      process.exit();
    });
}

module.exports = function options(argv, webpackOptions) {
  return new Promise((resolve, reject) => {
    awaitOptions(argv, webpackOptions).then((result) => {
      const { devServerOptions } = result;

      getPort(argv, devServerOptions)
        .then((port) => {
          result.devServerOptions.port = port;
          resolve(result);
        })
        .catch((err) => { reject(err); });
    });
  });
};
