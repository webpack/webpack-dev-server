'use strict';

const httpProxyMiddleware = require('http-proxy-middleware');

function getProxyMiddleware(config) {
  const context = config.context || config.path;

  // It is possible to use the `bypass` method without a `target`.
  // However, the proxy middleware has no use in this case, and will fail to
  // instantiate.
  if (config.target) {
    return httpProxyMiddleware(context, config);
  }
}

/**
  * @private
  * @method distill
  * @desc Distills object-notation proxy configuration to an array-noation.
  *
  * @param {Object} options  A proxy options object.
  * @return {Object}
  *
  * @example
  * If a proxy configuration specified as:
  * proxy: {
  *   'context': { options }
  * }
  * OR
  * proxy: {
  *   'context': 'target'
  * }
  */
function distill(options) {
  let results = Object.assign({}, options);

  if (!Array.isArray(options)) {
    results = Object.keys(options).map((context) => {
      let proxyOptions;
      // For backwards compatibility reasons.
      const correctedContext = context.replace(/^\*$/, '**').replace(/\/\*$/, '');

      if (typeof options[context] === 'string') {
        proxyOptions = {
          context: correctedContext,
          target: options[context]
        };
      } else {
        proxyOptions = Object.assign({}, options[context]);
        proxyOptions.context = correctedContext;
      }
      proxyOptions.logLevel = proxyOptions.logLevel || 'warn';

      return proxyOptions;
    });
  }

  return results;
}

module.exports = function proxy(app, options) {
  if (!options.proxy) {
    return;
  }

  const config = distill(options.proxy);

  /**
  * Expects a proxy configuration matching:
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
  for (const prxy of config) {
    let proxyConfig;
    let proxyMiddleware;

    if (typeof prxy === 'function') {
      proxyConfig = prxy();
    } else {
      proxyConfig = prxy;
    }

    proxyMiddleware = getProxyMiddleware(proxyConfig);

    app.use((req, res, next) => { // eslint-disable-line no-loop-func
      if (typeof prxy === 'function') {
        const newProxyConfig = prxy();

        if (newProxyConfig !== proxyConfig) {
          proxyConfig = newProxyConfig;
          proxyMiddleware = getProxyMiddleware(proxyConfig);
        }
      }

      const bypass = typeof proxyConfig.bypass === 'function';
      const bypassUrl = bypass && (proxyConfig.bypass(req, res, proxyConfig) || false);

      if (bypassUrl) {
        req.url = bypassUrl;
        next();
      } else if (proxyMiddleware) {
        return proxyMiddleware(req, res, next);
      } else {
        next();
      }
    });
  }
};
