# Allowing a separate frontend origin

`allowedHosts` validates the destination `Host` header. `allowedOrigins` controls
which pages can access HTTP resources, HMR (WebSocket or Server-Sent Events), and
WebSocket proxies. Configuring `allowedHosts` or `client.webSocketURL` does not
authorize another origin.

```js
export default {
  output: {
    crossOriginLoading: "anonymous",
  },
  devServer: {
    allowedHosts: ["localhost"],
    allowedOrigins: ["http://localhost:3000"],
    client: {
      webSocketURL: "ws://localhost:8080/ws",
    },
  },
};
```

Run this example from this directory:

```console
npx webpack serve --port 8080 --open
```

The page at `http://localhost:8080` should display `Success!`. A frontend served
from `http://localhost:3000` can also fetch the bundle and connect to HMR. For
example, run this in that frontend's browser console:

```js
const response = await fetch("http://localhost:8080/main.js");
console.log(response.status); // 200
```

The server supplies `Access-Control-Allow-Origin` for an authorized origin. Other
origins receive 403 for HTTP requests carrying `Origin` and cannot receive HMR
messages or connect through a WebSocket proxy. The host check still applies.

## Values

- `"auto"` (default) or `[]`: allow only the same origin.
- An HTTP(S) origin or an array of origins: allow those origins in addition to
  the same origin. The scheme, hostname, and port must match. Entries may have a
  trailing slash, but no path, credentials, query, or fragment. Hostname
  wildcards and opaque origins (`"null"`) are not supported.
- `"all"`: explicitly disable origin checks and send
  `Access-Control-Allow-Origin: *`. Only use this when you intend to expose the
  development server to any website. This does not disable the host check.

The CLI accepts repeated flags:

```console
npx webpack serve --allowed-origins http://localhost:3000 --allowed-origins https://app.example.com
```

When HMR listens on a separate port, it also accepts the page served by this
dev server's HTTP(S) listener on the same hostname. This uses the actual bound
port, including with `port: 0`. It applies only to HMR connections; HTTP resources,
WebSocket proxies, and state-changing endpoints keep their existing origin rules.
Reverse proxies that change the public origin still need `allowedOrigins`.

## Migrating cross-origin setups

Previously, an entry in `allowedHosts` or a custom `client.webSocketURL` could
implicitly disable origin protection. Add the frontend's full HTTP(S) origin to
`allowedOrigins`, including for reverse proxies that change the host, port, or
protocol. For TLS terminated at a reverse proxy, list the public HTTPS origin.
Forwarded headers do not grant permission.

`localhost`, `127.0.0.1`, and `[::1]` are different origins. Another port on the
same hostname is also a different origin. Add each frontend origin that you use.

Cross-origin script and image elements should use `crossorigin="anonymous"` so
the browser sends `Origin` and applies CORS:

```html
<script src="http://localhost:8080/main.js" crossorigin="anonymous"></script>
```

Webpack-generated lazy chunks and hot-update scripts also need
`output.crossOriginLoading: "anonymous"` so that the browser sends `Origin`.
Adding `crossorigin` to the initial script does not configure these generated
scripts. Their `output.publicPath` must also resolve to the dev server.

A cross-origin `no-cors` request without `Origin` cannot be matched to an allowed
page, even if it sends a referrer header. Fetch Metadata checks and
`Cross-Origin-Resource-Policy: same-origin` continue to protect those requests.
Configuring CORS headers through `headers` alone does not authorize an origin;
use `allowedOrigins`. Custom response headers, including preflight headers when
needed, can still be configured through `headers`.

The internal invalidate and open-editor endpoints retain their same-origin
protection because they change server state.
