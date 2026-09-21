---
"webpack-dev-server": patch
---

Stop watching the compiler's `output.path` for static file changes, so a build that writes into a static directory no longer reloads the page on its own output.
