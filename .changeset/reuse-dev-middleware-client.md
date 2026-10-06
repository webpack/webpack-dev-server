---
"webpack-dev-server": minor
---

The browser runtime, the error overlay and both transports now come from webpack-dev-middleware, so this package has no client code of its own. Every option keeps its name and meaning, including `webSocketServer.options` and `client.webSocketTransport`, and `allowedHosts` and the origin checks still apply here. Every `webpack-dev-server/client/*` path still resolves, `client/socket.js` included, and this server's old `{ type }` messages are still sent alongside the middleware's, so React Refresh's overlay keeps working. `client.webSocketTransport: "sse"` adds Server-Sent Events next to `"ws"`, and the overlay gains `styles`, `ansiColors`, `openEditorEndpoint` and `paginate`. `sendMessage()`, `getClientEntry()` and `getClientHotEntry()` still work but are deprecated, and the console wording is now the middleware's.
