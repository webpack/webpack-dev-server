---
"webpack-dev-server": major
---

Update `webpack-dev-middleware` to v8 and sync `originalUrl` for middleware compatibility. `server.middleware.getFilenameFromUrl()` is now asynchronous and resolves to `{ filename, extra: { stats, outputFileSystem } }`. See the [webpack-dev-middleware v8 release notes](https://github.com/webpack/webpack-dev-middleware/releases/tag/v8.0.0) for details.
