"use strict";

module.exports = (api) => {
  api.cache(true);

  return {
    presets: [
      [
        "@babel/preset-env",
        {
          modules: false,
          targets: {
            esmodules: true,
            node: "0.12",
          },
        },
      ],
    ],
    plugins: ["@babel/plugin-transform-object-assign"],
    env: {
      test: {
        presets: [
          [
            "@babel/preset-env",
            {
              targets: {
                node: "16.10.0",
              },
            },
          ],
        ],
        plugins: ["@babel/plugin-transform-runtime"],
      },
    },
  };
};
