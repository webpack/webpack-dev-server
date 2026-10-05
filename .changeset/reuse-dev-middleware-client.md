---
"webpack-dev-server": minor
---

The browser runtime is webpack-dev-middleware's now. This server has no client of its own: `client-src/` is gone — the runtime, the error overlay, the progress indicator, the logger, the socket wrapper and the WebSocket client, around two thousand lines that existed in near-duplicate in both projects.

What this means for a configuration is nothing. Every option keeps its name and its meaning: `hot`, `liveReload`, `client.overlay`, `client.progress`, `client.logging`, `client.reconnect`, `client.webSocketURL`, `client.webSocketTransport`, `webSocketServer`, `allowedHosts`. They are mapped onto the middleware's `hot` option, in `lib/hotOptions.js`, and what used to be two implementations of the same ideas is one.

What it means for the `webpack-dev-server/client/*` paths is that they re-export the middleware's client, so an import of `webpack-dev-server/client/index.js`, `client/overlay.js`, `client/progress.js` or `client/clients/WebSocketClient.js` resolves to the same thing it always did. The paths that were only this bundle's internals — `client/socket.js`, `client/utils/log.js`, `client/utils/sendMessage.js` and `client/modules/logger/index.js` — are not published any more; the middleware's client has its own.

The overlay keeps its element id, `webpack-dev-server-client-overlay`, so anything querying for it still finds it. It also gains the middleware's extra overlay options, which this project did not have: `styles`, `ansiColors`, `openEditorEndpoint` and `paginate`.

**Protection stays here.** `allowedHosts`, the `Origin` checks and the same-origin rule are unchanged and still applied before anything is published to a client: the middleware is handed `cors: true` and no token, which is it applying no policy of its own, and every connection is judged here. A WebSocket handshake is refused before it completes rather than after, since the middleware exposes the upgrade rather than taking the server over.

**The wire protocol is the middleware's**, which is what changes for anyone reading the socket directly rather than through the client. `{ type: "ok" | "still-ok" | "invalid" | "hash" | "static-changed" | "progress-update" }` becomes `{ action: "built" | "sync" | "building" | "reload" | "progress" }`: `built` is a build that changed something and `sync` one that did not, errors and warnings arrive with the build that produced them rather than as messages of their own, and the configuration this server used to push to a client after the handshake is in the client's entry query instead. A client wired by hand therefore needs its options in that query — `?path=/ws&transport=ws&apply=hmr` — rather than waiting to be told.

**A `webSocketServer` of your own still works.** A class, a module that exports one, or options giving the socket a port or a server of its own are wrapped into the shape the middleware asks a custom transport for, so there is one path from a build to a page either way. `BaseServer` keeps its published export and its contract. An implementation that forwarded whatever it was handed does not notice; one that inspected the old message shape sees the new one.
