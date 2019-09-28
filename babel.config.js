'use strict';

module.exports = (api) => {
  api.cache(true);

  return {
    presets: ['@babel/preset-env'],
    env: {
      test: {
        plugins: ['@babel/plugin-transform-runtime'],
      },
    },
  };
};
