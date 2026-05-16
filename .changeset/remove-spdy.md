---
"webpack-dev-server": major
---

Remove the `spdy` dependency. Use the built-in `node:http2` module via the `server` option for HTTP/2 support.
