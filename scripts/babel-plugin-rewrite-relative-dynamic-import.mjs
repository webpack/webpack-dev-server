// Babel plugin (CJS build): rewrite only *relative* dynamic `import()` to
// `require()` so babel's `.default` interop keeps working for our internal
// modules. Bare/`node:` specifiers stay native `import()`, letting ESM-only
// deps load without `require(ESM)`.
export default ({ types: t }) => ({
  name: "rewrite-relative-dynamic-import",
  visitor: {
    CallExpression(path) {
      if (path.node.callee.type !== "Import") return;

      const [arg] = path.node.arguments;

      // a string-literal relative specifier (`./` or `../`) = an internal module
      if (t.isStringLiteral(arg) && /^\.\.?\//.test(arg.value)) {
        // `Promise.resolve().then(() => require(x))`: require runs in the
        // callback so a load failure rejects (like `import()`), not throws.
        path.replaceWith(
          t.callExpression(
            t.memberExpression(
              t.callExpression(
                t.memberExpression(
                  t.identifier("Promise"),
                  t.identifier("resolve"),
                ),
                [],
              ),
              t.identifier("then"),
            ),
            [
              t.arrowFunctionExpression(
                [],
                t.callExpression(t.identifier("require"), [arg]),
              ),
            ],
          ),
        );
      }
    },
  },
});
