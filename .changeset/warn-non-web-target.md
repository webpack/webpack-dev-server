---
"webpack-dev-server": patch
---

Warn when `hot` or `liveReload` is enabled but no compiler has a web target, since no client is injected and nothing reaches a page.
