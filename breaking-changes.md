## Breaking Changes

- `Server` renamed to `DevServer`
- `publicPath` is now a required option
- `contentBase` cannot be a number, nor a URI
- `setup` has been removed in favor of `before`
- `noInfo` option has been changed to `info`, with a default value of `true`
- `DevServer.listen` signature changed; only accepts a callback. `host` and `port`
must be passed through the `options` in the constructor.
- Browsers that don't support ES6 `const, let` aren't supported (as of v2.8.0)
- Browsers which don't support native `WebSocket` aren't supported
- `hotReload` query string option renamed to `hmr`

## Possible Breakages

- Proxies
- Upstream Sockets (listen-socket example)
- WebSockets use the configured hostname and port from CLI/API options, rather
than parsed hostname and port from the document.

## Broken Examples
modus-manual-script
progress
webworker (DEV_SERVER_OPTIONS)

## Untested Examples
listen-socket
modus-iframe
modus-inline
