'use strict';

module.exports = (api) => {
  api.cache(true);

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: '0.12',
          },
        },
      ],
    ],
    plugins: ['@babel/plugin-transform-object-assign'],
    env: {
      test: {
        plugins: ['@babel/plugin-transform-runtime'],
      },
    },
  };
};
