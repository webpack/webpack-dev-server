// Re-exported rather than implemented: webpack-dev-middleware ships the same
// transport, and one copy means one place for the things this one was missing —
// a `close()` (which the interface declares and this file never had), the guard
// that stops a queued event reporting after the caller closed, and resolving a
// relative or `http(s):` url for browsers whose `WebSocket` will not.
//
// `client.webSocketTransport` resolves to this path, so anything pointing at it
// keeps working.
export { default } from "webpack-dev-middleware/client/ws";
