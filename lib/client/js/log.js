'use strict';

const weblog = require('webpack-log');

function init(context, name) {
  const log = weblog({
    name: name
  });
  // const originalFactory = log.methodFactory;
  // const css = {
  //   prefix: 'color: #999; padding: 0 0 0 20px; line-height: 16px; background: url(https://webpack.js.org/6bc5d8cf78d442a984e70195db059b69.svg) no-repeat; background-size: 16px 16px; background-position: 0 -2px;',
  //   reset: 'color: #444'
  // };

  // log.methodFactory = function factory(methodName, logLevel, loggerName) {
  //   const rawMethod = originalFactory(methodName, logLevel, loggerName);
  //
  //   return function method() {
  //     const args = Array.prototype.slice.call(arguments);
  //     const prefix = '%c｢' + label + '｣ %c';
  //
  //     if (args.length && typeof args[0] === 'string') {
  //       // concat prefix with first argument to support string substitutions
  //       args[0] = prefix + args[0];
  //     } else {
  //       args.unshift(prefix);
  //     }
  //
  //     args.splice(1, 0, css.prefix, css.reset);
  //
  //     rawMethod.apply(this, args);
  //   };
  // };

  // required to apply the pre/post
  // log.setLevel(log.getLevel());

  return log;
}

/**
 * Monkey-patches webpack/hot/log to use loglevel
 */
function patchHot() {
  const context = require.context('webpack/hot', false, /^\.\/log$/);
  if (context.keys().indexOf('./log') === -1) {
    // older version of webpack that doesn't have webpack/hot/log.js. bail.
    return;
  }

  // require it here so we can manipulate the cache
  context('./log');

  const cacheKey = context.resolve('./log');
  const cache = require.cache[cacheKey];
  const original = cache.exports;
  const log = init('webpack-hot', 'hmr');
  const exports = function patch(level, message) {
    if (level === 'warning') {
      level = 'warn';
    }

    message = message.replace(/\[HMR\](\s*)/i, '');

    log[level](message);
  };

  exports.setLogLevel = function setLogLevel(level) {
    if (level === 'warning') {
      level = 'warn';
    }

    log.level = level;
  };

  // we have no equivalent to these in wds, so just pass-through
  exports.group = original.group;
  exports.groupCollapsed = original.groupCollapsed;
  exports.groupEnd = original.groupEnd;

  cache.exports = exports;
}

module.exports = init('webpack-dev-server', 'dev');
module.exports.patch = patchHot;
