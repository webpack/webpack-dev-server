---
"webpack-dev-server": minor
---

Added `"sse"` as a second transport, next to `"ws"`:

```js
module.exports = {
  devServer: {
    client: { webSocketTransport: "sse" },
  },
};
```

The page connects with `EventSource` instead of a WebSocket, and the endpoint
is served by webpack-dev-middleware's hot endpoint — an ordinary response
rather than an upgrade, so it needs no second server and passes through
anything that only speaks HTTP. Naming it as the client's transport picks the
endpoint that serves it, so `webSocketServer` does not have to be set as well;
`webSocketServer: "sse"` is accepted too.

Everything above the wire is unchanged: the same protocol, the same messages,
the same options, and `allowedHosts` and the origin check still decide who may
connect. There is one difference in how that check reads a request. A browser
puts an `Origin` on a WebSocket handshake whether or not it is cross-origin,
so a handshake without one is refused. `EventSource` sends no `Origin` on a
same-origin request, so for a stream an absent one is taken as a page of this
server's own; a stream that does carry an `Origin` — which is what a
cross-origin page sends — is checked as before, and the `Host` check runs
either way.

Both transports are now webpack-dev-middleware's, so
`client-src/clients/WebSocketClient.js` and `client-src/clients/EventSourceClient.js`
re-export them. `client.webSocketTransport` resolves to those paths as it
always has, and a transport of your own still works.

One thing to know if you script a browser against the dev server: a stream is
a request that never ends, so a page with an open one never reaches "network
idle". Wait for `load` or `domcontentloaded` instead.
