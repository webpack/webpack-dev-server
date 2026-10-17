---
"webpack-dev-server": minor
---

Add `allowedOrigins` to authorize cross-origin HTTP requests, HMR connections, and WebSocket proxies independently of `allowedHosts` and `client.webSocketURL`. Host configuration no longer disables origin protection, including when `allowedHosts` is `"all"`.

Cross-origin frontends must now list their full HTTP(S) origin in `allowedOrigins`. Origins include the protocol and port; loopback hostnames are no longer interchangeable. Use CORS (`crossorigin="anonymous"` on script and image elements) so the server can identify the authorized page. The server supplies CORS headers for authorized origins, while Fetch Metadata and resource-policy checks continue to protect requests without `Origin`. Configuring `headers` alone no longer grants cross-origin access. `allowedOrigins: "all"` explicitly opts out of origin checks without disabling host validation.
