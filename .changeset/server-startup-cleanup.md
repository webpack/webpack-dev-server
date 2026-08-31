---
"webpack-dev-server": patch
---

Reject occupied TCP and IPC startup attempts, clean up only owned WebSocket upgrade listeners, wait for pending plugin startup during shutdown, and report the configured Bonjour protocol correctly.
