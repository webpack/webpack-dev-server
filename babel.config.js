import rewriteRelativeDynamicImport from "./scripts/babel-plugin-rewrite-relative-dynamic-import.mjs";

export default (api) => {
  // `api.env()` makes the resolved config cache depend on `BABEL_ENV`/`NODE_ENV`
  // so the `cjs` build and the default client build don't share a cache entry.
  const env = api.env();

  // CommonJS build. Transpile static `import`/`export` to CJS, but leave dynamic
  // `import()` native (`exclude` below) so ESM-only deps load without
  // `require(ESM)`; `rewrite-relative-dynamic-import` handles internal modules.
  if (env === "cjs") {
    return {
      presets: [
        [
          "@babel/preset-env",
          {
            modules: "commonjs",
            exclude: ["@babel/plugin-transform-dynamic-import"],
            targets: {
              node: "22.15.0",
            },
          },
        ],
      ],
      plugins: [
        "babel-plugin-transform-import-meta",
        rewriteRelativeDynamicImport,
      ],
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
  };
};
