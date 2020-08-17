'use strict';

function overwriteWebpackConfig(config) {
  // we use InfrastructureLogger for logger and it respects stats.colors
  if (config[0].stats == null) {
    config[0].stats = {};
    config[0].stats.colors = true;
  } else if (typeof config[0].stats === 'object') {
    if (config[0].stats.colors == null) {
      config[0].stats.colors = true;
    }
  }
}

module.exports = overwriteWebpackConfig;
