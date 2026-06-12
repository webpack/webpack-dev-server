---
"webpack-dev-server": patch
---

Skip the HMR WebSocket path when forwarding upgrade requests to user-defined proxies, so custom proxy WebSocket upgrades are no longer intercepted by the dev server.
