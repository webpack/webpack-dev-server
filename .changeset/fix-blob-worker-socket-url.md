---
"webpack-dev-server": patch
---

Connect the client to the page's host when it runs in a worker started from a `blob:` URL, instead of `0.0.0.0` or an insecure `ws:` socket on HTTPS pages.
