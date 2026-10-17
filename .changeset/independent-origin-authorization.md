---
"webpack-dev-server": minor
---

Add `allowedOrigins` to authorize cross-origin HTTP requests, HMR connections, and WebSocket proxies independently of `allowedHosts` and `client.webSocketURL`. Host configuration no longer disables origin protection, including when `allowedHosts` is `"all"`.

Cross-origin frontends must now list their full HTTP(S) origin in `allowedOrigins`. Origins include the protocol and port; loopback hostnames are no longer interchangeable. Use CORS (`crossorigin="anonymous"` on script and image elements) so the server can identify the authorized page. The server supplies CORS headers for authorized origins, while Fetch Metadata and resource-policy checks continue to protect requests without `Origin`. Configuring `headers` alone no longer grants cross-origin access. `allowedOrigins: "all"` explicitly opts out of origin checks without disabling host validation.

Set `output.crossOriginLoading: "anonymous"` for webpack-generated lazy chunks and hot-update scripts loaded across origins, and ensure `output.publicPath` resolves to the dev server. The initial script's `crossorigin` attribute does not configure those generated scripts.

HMR on a separate port also accepts the origin of this dev server's HTTP(S) listener on the same hostname, using the actual bound port even with `port: 0`. This exception applies only to HMR; reverse proxies that change the public origin must still configure `allowedOrigins`.
