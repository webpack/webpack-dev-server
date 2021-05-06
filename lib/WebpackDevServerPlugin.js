'use strict';

const { validate } = require('schema-utils');
const schema = require('./options.json');

class WebpackDevServerPlugin {
  constructor(options) {
    this.name = 'webpack-dev-server';
    this.options = options;
    validate(schema, options, this.name);
  }

  apply(compiler) {
    this.logger = compiler.getInfrastructureLogger(this.name);
  }
}

module.exports = WebpackDevServerPlugin;
