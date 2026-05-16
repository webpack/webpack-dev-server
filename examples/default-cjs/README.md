## CommonJS Example

This example demonstrates that `webpack-dev-server` still works with a
CommonJS configuration. The rest of the examples have been migrated to
ESM; this one is intentionally kept in CJS for users who haven't migrated
yet.

The webpack config is named `webpack.config.cjs` (with the explicit `.cjs`
extension) because the project's `package.json` has `"type": "module"`,
which makes plain `.js` files ESM by default.

```console
npx webpack serve --open --config webpack.config.cjs
```

## What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. You should see the text on the page change to `Success from CommonJS example!`.
