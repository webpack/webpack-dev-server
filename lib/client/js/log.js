'use strict';

const loglevel = require('loglevelnext/dist/loglevelnext');

function init(context, name) {
  const MethodFactory = loglevel.factories.MethodFactory;
  const css = {
    prefix: 'color: #999; padding: 0 0 0 20px; line-height: 16px; background: url(https://webpack.js.org/6bc5d8cf78d442a984e70195db059b69.svg) no-repeat; background-size: 16px 16px; background-position: 0 -2px;',
    reset: 'color: #444'
  };
  const log = loglevel.getLogger({ name: name });

  function IconFactory(logger) {
    MethodFactory.call(this, logger);
  }

  IconFactory.prototype = Object.create(MethodFactory.prototype);
  IconFactory.prototype.constructor = IconFactory;

  IconFactory.prototype.make = function make(methodName) {
    const og = MethodFactory.prototype.make.call(this, methodName);

    return function _() {
      const args = Array.prototype.slice.call(arguments);
      const prefix = '%c｢' + name + '｣ %c';
      const first = args[0];

      if (typeof first === 'string') {
        args[0] = prefix + first;
      } else {
        args.unshift(prefix);
      }

      args.splice(1, 0, css.prefix, css.reset);
      og.apply(undefined, args); // eslint-disable-line no-undefined
    };
  };

  log.factory = new IconFactory(log, {});
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
  const hmrlog = init('webpack-hot', 'hmr');
  const exports = function patch(level, message) {
    if (level === 'warning') {
      level = 'warn';
    }

    message = message.replace(/\[HMR\](\s*)/i, '');

    hmrlog[level](message);
  };

  exports.setLogLevel = function setLogLevel(level) {
    if (level === 'warning') {
      level = 'warn';
    }

    hmrlog.level = level;
  };

  // we have no equivalent to these in wds, so just pass-through
  exports.group = original.group;
  exports.groupCollapsed = original.groupCollapsed;
  exports.groupEnd = original.groupEnd;

  cache.exports = exports;
}

module.exports = init('webpack-dev-server', 'dev');
module.exports.patch = patchHot;
