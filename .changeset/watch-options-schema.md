---
"webpack-dev-server": patch
---

The chokidar options in `static.watch` and `watchFiles.options` are now validated against chokidar's own option types, so a wrongly typed value such as `ignored: 123` or `usePolling: "false"` is reported instead of silently passed on, while options chokidar does not know are still accepted.
