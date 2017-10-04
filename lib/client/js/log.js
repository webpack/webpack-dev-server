'use strict';

const loglevel = require('loglevel');

const log = loglevel.getLogger('webpack-dev-server');
const originalFactory = log.methodFactory;
const css = {
  prefix: 'color: #999; padding: 0 0 0 20px; line-height: 16px; background: url(https://webpack.js.org/6bc5d8cf78d442a984e70195db059b69.svg) no-repeat; background-size: 16px 16px; background-position: 0 -2px;',
  reset: 'color: #444'
};

log.methodFactory = function factory(methodName, logLevel, loggerName) {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);

  return function method() {
    const args = Array.prototype.slice.call(arguments);
    const prefix = '%c｢dev｣ %c';

    if (args.length && typeof args[0] === 'string') {
      // concat prefix with first argument to support string substitutions
      args[0] = prefix + args[0];
    } else {
      args.unshift(prefix);
    }

    args.splice(1, 0, css.prefix, css.reset);

    rawMethod.apply(this, args);
  };
};

// required to apply the pre/post
log.setLevel(log.getLevel());


// console.log('%cStarting Build...%c｢dev｣', );
//
//
// console.log('%cStarting Build...', 'padding: 20px 0 0 20px;line-height: 16px; background: url(https://webpack.js.org/6bc5d8cf78d442a984e70195db059b69.svg) no-repeat; background-size: 16px 16px; background-position: 0 18px;');
//
module.exports = log;
