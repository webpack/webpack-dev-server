// Re-exported rather than implemented: webpack-dev-middleware ships this
// transport, and taking it from there is the whole of what `sse` needs in the
// browser — the silence watchdog a Server-Sent Events connection needs (a
// proxy that stops forwarding, or a laptop that slept, does not always fire
// `error`) comes with it.
//
// `client.webSocketTransport: "sse"` resolves to this path, the same way `ws`
// resolves to its neighbour.
export { default } from "webpack-dev-middleware/client/sse";
