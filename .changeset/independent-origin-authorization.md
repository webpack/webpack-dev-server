---
"webpack-dev-server": minor
---

Add `allowedOrigins` to say which pages may use the server — its HTTP endpoints, hot module replacement and proxied WebSockets — independently of `allowedHosts`, which goes back to checking `Host`. Nothing changes until it is set: the default, `"auto"`, keeps the rules derived from `allowedHosts`. A list allows the listed origins plus the page's own hostname (any port, loopback names counted as one, as before), answering them with CORS headers and allowing a plain `<script>` they load by its `Referer`; `"all"` allows every origin without turning off the `Host` check. Under `"auto"`, `allowedHosts: "all"` and an `Access-Control-Allow-Origin: *` entry in `headers` still open the server to every origin, and are deprecated for doing so.

Once `allowedOrigins` is set, the injected hot client is also handed a per-run token, and a client carrying it may connect from an origin the server does not otherwise know, such as a proxy's; the `Host` check still applies. webpack-dev-middleware is now required at `^8.5.0`, the first release that hands over a token without requiring it.

Add `static.deny`: `true` refuses `.env`, `.env.*`, keys and certificates, `.npmrc`, `.yarnrc.yml` and `.git` in a static directory with `403` and leaves them out of directory listings, or give patterns of your own. Off by default for now.
