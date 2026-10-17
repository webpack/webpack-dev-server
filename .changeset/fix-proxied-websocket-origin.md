---
"webpack-dev-server": patch
---

Validate the `Host` and `Origin` headers and enforce same-origin checks on WebSocket upgrade requests handled by proxies with `ws: true`. This prevents cross-origin pages from connecting to proxied WebSocket services through the development server.
