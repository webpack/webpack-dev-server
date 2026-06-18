export default (api) => {
  // `api.env()` makes the resolved config cache depend on `BABEL_ENV`/`NODE_ENV`
  // so the `cjs` build and the default client build don't share a cache entry.
  const env = api.env();

  // CommonJS build (`build:cjs`, `babel --env-name cjs`). `lib/` is authored as
  // native ESM; here we transpile it to CJS for the dual package. `preset-env`
  // with `modules: "commonjs"` rewrites `import()` into real `require()` (the
  // target environments don't reliably support `require(ESM)`), and
  // `babel-plugin-transform-import-meta` rewrites `import.meta.url` (used by
  // `createRequire`) for CJS.
  if (env === "cjs") {
    return {
      presets: [
        [
          "@babel/preset-env",
          {
            modules: "commonjs",
            targets: {
              node: "22.15.0",
            },
          },
        ],
      ],
      plugins: ["babel-plugin-transform-import-meta"],
    };
  }

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
                node: "22.15.0",
              },
            },
          ],
        ],
        plugins: ["@babel/plugin-transform-runtime"],
      },
    },
  };
};
