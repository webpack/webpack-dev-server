---
"webpack-dev-server": patch
---

In plugin mode, a failure to start the server (e.g. `EADDRINUSE` when the port is taken) is now passed to the `watch()` callback, for a `MultiCompiler` too, instead of only being logged while the watch build keeps running.
