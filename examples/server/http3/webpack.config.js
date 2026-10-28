export default {
  mode: "development",
  context: import.meta.dirname,
  entry: "./app.js",
  output: { filename: "main.js", publicPath: "/" },
};
