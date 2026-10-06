---
"webpack-dev-server": minor
---

The browser runtime, error overlay and both transports are now webpack-dev-middleware's, so this package has no client code of its own: every option keeps its name and is mapped onto the middleware's `hot` option, the `webpack-dev-server/client/*` entry points still resolve, and `allowedHosts` and the origin checks still apply here. `client.webSocketTransport: "sse"` adds Server-Sent Events next to `"ws"`, and the overlay gains `styles`, `ansiColors`, `openEditorEndpoint` and `paginate` while keeping its `webpack-dev-server-client-overlay` id. The console wording and the socket messages are the middleware's (`{ action }` rather than `{ type }`), and `Server#getClientEntry()` and `Server#getClientHotEntry()` are removed because the middleware now adds those entries.
