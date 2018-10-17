'use strict';

const createDomain = require('./createDomain');

function patchPublicPath(config, options) {
  if (options.public) {
    const publicPath = options.publicPath || config.output.publicPath;

    config.output = Object.assign({}, config.output, { publicPath: createDomain(options) + publicPath });
  }
}

module.exports = patchPublicPath;
