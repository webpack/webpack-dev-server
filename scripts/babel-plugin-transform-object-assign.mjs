// Babel plugin (client build): replace `Object.assign` calls with babel's own
// `extends` helper, which falls back to a loop where `Object.assign` is missing.
// Replaces `@babel/plugin-transform-object-assign`, which babel did not release
// for babel 8 — the bundled `webpack/lib/logging/runtime.js` still calls it.
export default () => ({
  name: "transform-object-assign",
  visitor: {
    CallExpression(path, file) {
      if (path.get("callee").matchesPattern("Object.assign")) {
        path.node.callee = file.addHelper("extends");
      }
    },
  },
});
