---
"webpack-dev-server": patch
---

fix: allow `undefined` for the `Server` constructor `options` argument

The constructor type was narrowed to `Configuration<A, S>` in 5.2.3, which broke
passing `config.devServer` (typed as `DevServerConfiguration | undefined`) without
a non-null assertion or fallback. The `options` argument is now `Configuration<A, S> | undefined`
again and defaults to an empty object, restoring the previous behaviour.
