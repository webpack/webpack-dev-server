'use strict';

const express = require('express');
const httpProxyMiddleware = require('http-proxy-middleware');
const historyApiFallback = require('connect-history-api-fallback');
const compress = require('compression');
const serveIndex = require('serve-index');

function createFeatures({
  app,
  options,
  compiler,
  contentBase,
  websocketProxies,
}) {
  return {
    compress: () => {
      if (options.compress) {
        // Enable gzip compression.
        app.use(compress());
      }
    },
    proxy: () => {
      if (options.proxy) {
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
                proxyOptions = Object.assign({}, options.proxy[context]);
                proxyOptions.context = correctedContext;
              }

              proxyOptions.logLevel = proxyOptions.logLevel || 'warn';

              return proxyOptions;
            });
          }
        }

        const getProxyMiddleware = (proxyConfig) => {
          const context = proxyConfig.context || proxyConfig.path;
          // It is possible to use the `bypass` method without a `target`.
          // However, the proxy middleware has no use in this case, and will fail to instantiate.
          if (proxyConfig.target) {
            return httpProxyMiddleware(context, proxyConfig);
          }
        };
        /**
         * Assume a proxy configuration specified as:
         * proxy: [
         *   {
         *     context: ...,
         *     ...options...
         *   },
         *   // or:
         *   function() {
         *     return {
         *       context: ...,
         *       ...options...
         *     };
         *   }
         * ]
         */
        options.proxy.forEach((proxyConfigOrCallback) => {
          let proxyConfig;
          let proxyMiddleware;

          if (typeof proxyConfigOrCallback === 'function') {
            proxyConfig = proxyConfigOrCallback();
          } else {
            proxyConfig = proxyConfigOrCallback;
          }

          proxyMiddleware = getProxyMiddleware(proxyConfig);

          if (proxyConfig.ws) {
            websocketProxies.push(proxyMiddleware);
          }

          app.use((req, res, next) => {
            if (typeof proxyConfigOrCallback === 'function') {
              const newProxyConfig = proxyConfigOrCallback();

              if (newProxyConfig !== proxyConfig) {
                proxyConfig = newProxyConfig;
                proxyMiddleware = getProxyMiddleware(proxyConfig);
              }
            }

            // - Check if we have a bypass function defined
            // - In case the bypass function is defined we'll retrieve the
            // bypassUrl from it otherwise byPassUrl would be null
            const isByPassFuncDefined =
              typeof proxyConfig.bypass === 'function';
            const bypassUrl = isByPassFuncDefined
              ? proxyConfig.bypass(req, res, proxyConfig)
              : null;

            if (typeof bypassUrl === 'boolean') {
              // skip the proxy
              req.url = null;
              next();
            } else if (typeof bypassUrl === 'string') {
              // byPass to that url
              req.url = bypassUrl;
              next();
            } else if (proxyMiddleware) {
              return proxyMiddleware(req, res, next);
            } else {
              next();
            }
          });
        });
      }
    },
    historyApiFallback: () => {
      if (options.historyApiFallback) {
        const fallback =
          typeof options.historyApiFallback === 'object'
            ? options.historyApiFallback
            : null;
        // Fall back to /index.html if nothing else matches.
        app.use(historyApiFallback(fallback));
      }
    },
    contentBaseFiles: () => {
      if (Array.isArray(contentBase)) {
        contentBase.forEach((item) => {
          app.get('*', express.static(item));
        });
      } else if (/^(https?:)?\/\//.test(contentBase)) {
        this.log.warn(
          'Using a URL as contentBase is deprecated and will be removed in the next major version. Please use the proxy option instead.'
        );

        this.log.warn(
          'proxy: {\n\t"*": "<your current contentBase configuration>"\n}'
        );
        // Redirect every request to contentBase
        app.get('*', (req, res) => {
          res.writeHead(302, {
            Location: contentBase + req.path + (req._parsedUrl.search || ''),
          });

          res.end();
        });
      } else if (typeof contentBase === 'number') {
        this.log.warn(
          'Using a number as contentBase is deprecated and will be removed in the next major version. Please use the proxy option instead.'
        );

        this.log.warn(
          'proxy: {\n\t"*": "//localhost:<your current contentBase configuration>"\n}'
        );
        // Redirect every request to the port contentBase
        app.get('*', (req, res) => {
          res.writeHead(302, {
            Location: `//localhost:${contentBase}${req.path}${req._parsedUrl
              .search || ''}`,
          });

          res.end();
        });
      } else {
        // route content request
        app.get('*', express.static(contentBase, options.staticOptions));
      }
    },
    contentBaseIndex: () => {
      if (Array.isArray(contentBase)) {
        contentBase.forEach((item) => {
          app.get('*', serveIndex(item));
        });
      } else if (
        !/^(https?:)?\/\//.test(contentBase) &&
        typeof contentBase !== 'number'
      ) {
        app.get('*', serveIndex(contentBase));
      }
    },
    watchContentBase: () => {
      if (
        /^(https?:)?\/\//.test(contentBase) ||
        typeof contentBase === 'number'
      ) {
        throw new Error('Watching remote files is not supported.');
      } else if (Array.isArray(contentBase)) {
        contentBase.forEach((item) => {
          this._watch(item);
        });
      } else {
        this._watch(contentBase);
      }
    },
    before: () => {
      if (typeof options.before === 'function') {
        options.before(app, this, compiler);
      }
    },
    middleware: () => {
      // include our middleware to ensure
      // it is able to handle '/index.html' request after redirect
      app.use(this.middleware);
    },
    after: () => {
      if (typeof options.after === 'function') {
        options.after(app, this, compiler);
      }
    },
    headers: () => {
      app.all('*', this.setContentHeaders.bind(this));
    },
    magicHtml: () => {
      app.get('*', this.serveMagicHtml.bind(this));
    },
    setup: () => {
      if (typeof options.setup === 'function') {
        this.log.warn(
          'The `setup` option is deprecated and will be removed in v4. Please update your config to use `before`'
        );

        options.setup(app, this);
      }
    },
  };
}

module.exports = createFeatures;
