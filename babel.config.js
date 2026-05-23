export default (api) => {
  api.cache(true);

  return {
    ignore: ["client/**", "node_modules/**"],
    presets: [
      [
        "@babel/preset-env",
        {
          modules: false,
          targets: {
            esmodules: true,
            node: "22.15.0",
          },
        },
      ],
    ],
  };
};
