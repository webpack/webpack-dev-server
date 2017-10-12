'use strict';

const chokidar = require('chokidar');
const compress = require('compression');
const express = require('express');
const historyApiFallback = require('connect-history-api-fallback');
const serveIndex = require('serve-index');
const proxy = require('./proxy');

module.exports = function features(devServer) {
  const { app, devMiddleware, options, socket } = devServer;

  function setHeaders(req, res, next) {
    if (options.headers) {
      for (const name in options.headers) { // eslint-disable-line guard-for-in
        res.setHeader(name, options.headers[name]);
      }
    }

    next();
  }

  function magicHtml(req, res, next) {
    const _path = req.path;
    try {
      // TODO kill `this`
      if (!this.middleware.fileSystem.statSync(this.middleware.getFilenameFromUrl(`${_path}.js`)).isFile()) { return next(); }
      // Serve a page that executes the javascript
      res.write('<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body><script type="text/javascript" charset="utf-8" src="');
      res.write(_path);
      res.write('.js');
      res.write(req._parsedUrl.search || '');
      res.end('"></script></body></html>');
    } catch (e) {
      return next();
    }
  }

  function watch(path) {
    const watcher = chokidar.watch(path).on('change', () => {
      socket.send(socket.payload('content-changed'));
    });

    this.contentBaseWatchers.push(watcher);
  }

  const creatures = {
    after: () => {
      options.after(app, this);
    },

    before: () => {
      options.before(app, this);
    },

    compress() {
      // Enable gzip compression.
      app.use(compress());
    },

    contentBaseFiles() {
      const contentBase = options.contentBase;

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
      const contentBase = options.contentBase;

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
      proxy();
    },

    watchContentBase: () => {
      const contentBase = options.contentBase;

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
