# CLI: web-socket-server

To create a custom server implementation.

## sockjs

This mode uses [SockJS-node](https://github.com/sockjs/sockjs-node) as a server.

```console
npx webpack serve --web-socket-server sockjs --open-target <url>
```

## ws

This mode uses [ws](https://github.com/websockets/ws) as a server.

```console
npx webpack serve --web-socket-server ws --open-target <url>
```

### What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
