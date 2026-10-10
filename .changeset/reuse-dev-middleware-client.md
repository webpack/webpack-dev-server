---
"webpack-dev-server": minor
---

The browser client, the error overlay and both transports now come from webpack-dev-middleware, so this package has no client code of its own. Every option keeps its name and meaning, `allowedHosts` and the origin checks still apply here, and this server's `{ type }` messages are still sent next to the middleware's, so React Refresh keeps working. `client/index.js`, `client/socket.js` and `client/clients/WebSocketClient.js` still resolve while the client's internal files are gone, and the console wording, the overlay and the progress indicator are now the middleware's. `client.webSocketTransport: "sse"` adds Server-Sent Events, a universal build now runs in Node without the client throwing, and `sendMessage()`, `getClientEntry()` and `getClientHotEntry()` still work, a subclass's overrides included, but are deprecated.
