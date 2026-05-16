---
"webpack-dev-server": patch
---

Treat loopback aliases (`127.0.0.1`, `::1`, `localhost`) as equivalent in `isSameOrigin` so the WebSocket client does not reject valid same-origin connections.
