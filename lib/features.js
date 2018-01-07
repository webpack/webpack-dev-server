'use strict';

const chokidar = require('chokidar');
const compress = require('compression');
const express = require('express');
const historyApiFallback = require('connect-history-api-fallback');
const serveIndex = require('serve-index');
const proxy = require('./proxy');
const { send } = require('./util');

module.exports = function features(devServer) {
  const { app, devMiddleware, options, wss } = devServer;

  function setHeaders(req, res, next) {
    if (options.headers) {
      devServer.emit('set-headers', options.headers);
      for (const name in options.headers) { // eslint-disable-line guard-for-in
        res.setHeader(name, options.headers[name]);
      }
    }

    next();
  }

  function magicHtml(req, res, next) {
    try {
      const script = `${req.path}.js`;
      const fs = devMiddleware.fileSystem;
      const stat = fs.statSync(devMiddleware.getFilenameFromUrl(script));
      if (!stat.isFile()) {
        return next();
      }

      // eslint-disable-next-line no-underscore-dangle
      const src = script + (req._parsedUrl.search || '');
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
</head>
<body>
  <script charset="utf-8" src="${src}"></script>
</body>
</html>`;
      res.end(html);
    } catch (e) {
      return next();
    }
  }

  function watch(path) {
    // duplicate the same massaging of options that watchpack performs
    // https://github.com/webpack/watchpack/blob/master/lib/DirectoryWatcher.js#L49
    // this isn't an elegant solution, but we'll improve it in the future
    const { watchOptions } = options;
    const usePolling = watchOptions.poll ? true : undefined; // eslint-disable-line no-undefined
    const interval = typeof watchOptions.poll === 'number' ? watchOptions.poll : undefined; // eslint-disable-line no-undefined
    const opts = {
      ignoreInitial: true,
      persistent: true,
      followSymlinks: false,
      depth: 0,
      atomic: false,
      alwaysStat: true,
      ignorePermissionErrors: true,
      ignored: watchOptions.ignored,
      usePolling,
      interval
    };

    devServer.emit('watch', path);
    const watcher = chokidar.watch(path, opts).on('change', () => {
      wss.clients.forEach(ws => send(ws, devServer, 'content-changed'));
    });

    devServer.watchers.push(watcher);
  }

  const creatures = {
    after: () => {
      devServer.emit('after');
      options.after(app, this);
    },

    before: () => {
      devServer.emit('before');
      options.before(app, this);
    },

    compress() {
      devServer.emit('compress');
      // Enable gzip compression.
      app.use(compress());
    },

    contentBaseFiles() {
      const { contentBase } = options;
      if (Array.isArray(contentBase)) {
        for (const base of contentBase) {
          app.get('*', express.static(base));
        }
      } else {
        // route content request
        app.get('*', express.static(contentBase, options.staticOptions));
      }
    },

    contentBaseIndex() {
      const { contentBase } = options;
      if (Array.isArray(contentBase)) {
        for (const base of contentBase) {
          app.get('*', serveIndex(base));
        }
      }
    },

    headers: () => {
      app.all('*', setHeaders);
    },

    historyApiFallback() {
      let fallbackOptions = null;

      if (options.historyApiFallback) {
        devServer.emit('history-api-fallback', options.historyApiFallback);
        if (typeof options.historyApiFallback === 'object') {
          fallbackOptions = options.historyApiFallback;
        }
        // Fall back to /index.html if nothing else matches.
        app.use(historyApiFallback(fallbackOptions));
      }
    },

    magicHtml: () => {
      app.get('*', magicHtml);
    },

    middleware: () => {
      // include our middleware to ensure it is able to handle '/index.html' request after redirect
      app.use(devMiddleware);
    },

    proxy() {
      proxy(app, devServer, options);
    },

    watchContentBase: () => {
      const { contentBase } = options;

      if (Array.isArray(contentBase)) {
        for (const base of contentBase) {
          watch(base);
        }
      } else {
        watch(contentBase);
      }
    }
  };

  const defaultFeatures = ['headers', 'middleware'];

  if (typeof options.before === 'function') {
    defaultFeatures.unshift('before');
  }

  if (options.proxy) {
    defaultFeatures.push('proxy', 'middleware');
  }

  if (options.contentBase !== false) {
    defaultFeatures.push('contentBaseFiles');
  }

  if (options.watchContentBase) {
    defaultFeatures.push('watchContentBase');
  }

  if (options.historyApiFallback) {
    defaultFeatures.push('historyApiFallback', 'middleware');
    if (options.contentBase !== false) {
      defaultFeatures.push('contentBaseFiles');
    }
  }

  defaultFeatures.push('magicHtml');

  if (options.contentBase !== false) {
    defaultFeatures.push('contentBaseIndex');
  }

  // compress is placed last and uses unshift so that it will be the first middleware used
  if (options.compress) {
    defaultFeatures.unshift('compress');
  }

  if (typeof options.after === 'function') {
    defaultFeatures.push('after');
  }

  for (const feature of (options.features || defaultFeatures)) {
    creatures[feature]();
  }
};
