# Events

As of version 3.0.0 the `DevServer` class is now an `EventEmitter`. Consumers of
the API can now listen on all events sent via `WebSocket` to the client, in
addition to new events from the server. Below are a list of these events:

## DevServer API Events

- closed
- listening
- set-headers
- watch
- after
- before
- compress
- history-api-fallback
- compiler-invalid
- compiler-done
- progress
- progress-complete

## WebSocket Events

- ws-connected
- ws-content-changed
- ws-invalid
- ws-progress-update
- ws-options
- ws-still-ok
- ws-hash
- ws-errors
- ws-warnings
- ws-ok
