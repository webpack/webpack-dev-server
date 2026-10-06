---
"webpack-dev-server": minor
---

The browser runtime is webpack-dev-middleware's now. This server has no client of its own: `client-src/` is gone — the runtime, the error overlay, the progress indicator, the logger, the socket wrapper and the WebSocket client, around two thousand lines that existed in near-duplicate in both projects.

What this means for a configuration is next to nothing. Every option keeps its name and its meaning: `hot`, `liveReload`, `client.overlay`, `client.progress`, `client.logging`, `client.reconnect`, `client.webSocketURL`, `client.webSocketTransport`, `webSocketServer`, `allowedHosts`. They are mapped onto the middleware's `hot` option, in `lib/hotOptions.js`, and what used to be two implementations of the same ideas is one.

What it means for the `webpack-dev-server/client/*` paths is that they re-export the middleware's client, so an import of `webpack-dev-server/client/index.js`, `client/overlay.js`, `client/progress.js` or `client/clients/WebSocketClient.js` resolves to the same thing it always did. The paths that were only this bundle's internals — `client/socket.js`, `client/utils/log.js`, `client/utils/sendMessage.js` and `client/modules/logger/index.js` — are not published any more; the middleware's client has its own.

The overlay keeps its element id, `webpack-dev-server-client-overlay`, so anything querying for it still finds it. It also gains the middleware's extra overlay options, which this project did not have: `styles`, `ansiColors`, `openEditorEndpoint` and `paginate`.

**What does look different** in a page and its console, because it is the middleware's client talking:

- The two lines logged at startup, `Server started: Hot Module Replacement enabled, …` and `[HMR] Waiting for update signal from WDS...`, are one: `connected`. What a rebuild logs is worded differently, and names the file that changed. `Errors while compiling. Reload prevented.` is gone: a build that has errors is never applied, so there is nothing to prevent.
- `client.progress` drives the middleware's indicator and posts the percentage to the page; it no longer logs a `NN% - message` line per step to the console. The indicator is no longer a `wds-progress` custom element.
- The overlay's markup and colours are the middleware's. A click on a file opens it through this server's `/webpack-dev-server/open-editor` route, as before.
- A build for a node target (`node`, `async-node`, `electron-main`) is given no client, and no `webpack/hot/dev-server` entry either, which had nothing to drive it there.
- A page's `?webpack-dev-server-hot=false` and `?webpack-dev-server-live-reload=false` still opt it out, and `?webpack-dev-server-apply=hmr|hmr-only|reload|nothing` says the same thing in one parameter.
- In a multi-compiler build, `liveReload` reloads a page when any compilation's build finishes, as it did, and an update is applied only in the bundle it belongs to.
- `__webpack_dev_server_client__` holds the transport in use, `ws` and `sse` included, so a transport of your own is still named by `client.webSocketTransport`.

**Protection stays here.** `allowedHosts`, the `Origin` checks and the same-origin rule are unchanged and still applied before anything is published to a client: the middleware is handed `cors: true` and no token, which is it applying no policy of its own, and every connection is judged here. A WebSocket handshake is refused before it completes rather than after, since the middleware exposes the upgrade rather than taking the server over.

**The wire protocol is the middleware's**, which is what changes for anyone reading the socket directly rather than through the client. `{ type: "ok" | "still-ok" | "invalid" | "hash" | "static-changed" | "progress-update" }` becomes `{ action: "built" | "sync" | "building" | "reload" | "progress" }`: `built` is a build that changed something and `sync` one that did not, errors and warnings arrive with the build that produced them rather than as messages of their own, and the configuration this server used to push to a client after the handshake is in the client's entry query instead. A client wired by hand therefore needs its options in that query — `?path=/ws&transport=ws&apply=hmr` — rather than waiting to be told.

**Two public `Server` methods are gone.** `getClientEntry()` and `getClientHotEntry()` returned the paths of the client entry and the `webpack/hot` entry this server added to the compilation. Neither entry is this server's to add any more — the middleware injects both — so there is nothing for them to return. Anything that called them to build its own entry list should list `webpack-dev-server/client/index.js` itself, which still resolves, or let the `hot` option do it. This is a breaking change to the class's public surface and is called out here rather than left to be found.

**A `webSocketServer` of your own still works.** A class, a module that exports one, or options giving the socket a port or a server of its own are wrapped into the shape the middleware asks a custom transport for, so there is one path from a build to a page either way. `BaseServer` keeps its published export and its contract. An implementation that forwarded whatever it was handed does not notice; one that inspected the old message shape sees the new one.
