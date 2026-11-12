---
"webpack-dev-server": patch
---

In plugin mode, `compiler.close()` now also closes the built-in hot transport, so a WebSocket endpoint on a port of its own no longer outlives the compiler and keeps the process running. Requires webpack-dev-middleware `^8.6.1`.
