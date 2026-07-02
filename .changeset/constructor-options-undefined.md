---
"webpack-dev-server": patch
---

fix: allow `undefined` as the `Server` constructor `options` argument again

Restores accepting `undefined` (defaulting it to `{}`) for the `options`
argument, so passing a webpack config's optional `devServer` field type-checks and works as before.
