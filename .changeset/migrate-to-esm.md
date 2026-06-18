---
"webpack-dev-server": major
---

Convert the source to native ES modules. The package keeps `"type": "module"` and now exposes both an ESM and a CommonJS build via the `exports` field: ESM consumers `import` the native `lib/`, while CommonJS consumers `require()` a transpiled `dist/` build — so the package works from both ESM and CommonJS, including environments where `require(ESM)` is not supported.
