# Allowing a frontend on another origin

`allowedHosts` checks the `Host` header the request was sent to. `allowedOrigins`
checks which pages may use the server: its bundles, hot module replacement
(WebSocket or Server-Sent Events), WebSocket proxies and its internal endpoints.

```js
export default {
  devServer: {
    allowedOrigins: ["http://app.localhost:3000"],
  },
};
```

Run this example from this directory:

```console
npx webpack serve --port 8080 --open
```

The page at `http://localhost:8080` should display `Success!`. A frontend at
`http://app.localhost:3000` (any page served there, such as a backend's template)
can load the bundle with a plain script tag and connect for hot module
replacement:

```html
<script src="http://localhost:8080/main.js"></script>
```

or read it with `fetch`, in that page's console:

```js
const response = await fetch("http://localhost:8080/main.js");
console.log(response.status); // 200
```

A listed origin's requests get `Access-Control-Allow-Origin` and
`Access-Control-Allow-Credentials`, its preflight requests are answered with the methods
and headers it asks for (and Private Network Access), and a script or
image it loads without `crossorigin` is allowed by the page's `Referer`. Any
other origin gets `403`, cannot receive hot updates and cannot connect through a
WebSocket proxy. The `Host` check still applies.

## Values

- `"auto"` (the default): the rules derived from `allowedHosts`, unchanged. The
  page's own hostname on any port is allowed, with `localhost`, `127.0.0.1` and
  `[::1]` counted as one, and so is every origin when `allowedHosts` is `"all"`
  (deprecated: set `allowedOrigins` instead).
- An HTTP(S) origin, or a list of them: those, plus the page's own hostname (on
  any port, loopback names counted as one, as with `"auto"`), whatever
  `allowedHosts` says. A listed origin's scheme, hostname and port must match.
  Entries may have a trailing slash, but no path, credentials, query or
  fragment. `[]` allows the page's own hostname only — which still includes
  every other page on `localhost` when the server is on `localhost`.
- `"all"`: every origin, with `Access-Control-Allow-Origin: *`. It does not turn
  off the `Host` check.

The CLI takes the flag more than once:

```console
npx webpack serve --allowed-origins http://app.localhost:3000 --allowed-origins https://app.example.com
```

## Tunnels, containers and reverse proxies

`allowedHosts: "all"` is the usual answer to a `Host` the server does not know.
Under `"auto"` it also lets every website use the server; list the origin your
frontend is served from to keep that closed:

```js
export default {
  devServer: {
    allowedHosts: "all",
    allowedOrigins: ["https://my-app.example-tunnel.dev"],
  },
};
```

Forwarded headers grant nothing. For TLS terminated at a proxy, list the public
`https` origin.

Hot module replacement does not need the list for a proxy once `allowedOrigins`
is set: the injected client is handed a token, new on every run, and a client
that carries it may connect from an origin the server does not know.

## A page that sends no `Referer`

With `Referrer-Policy: no-referrer`, a plain script load carries nothing to
identify the page, and a cross-site one is refused. Load the bundle with
`crossorigin` so the browser sends `Origin`, and set
`output.crossOriginLoading: "anonymous"` so lazy chunks and hot updates do too:

```html
<script src="http://localhost:8080/main.js" crossorigin="anonymous"></script>
```
