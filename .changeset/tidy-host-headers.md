---
"webpack-dev-server": patch
---

Validate Host and HTTP/2 authority headers independently of Origin protocol exceptions, including when `allowedHosts` is `"all"`. Handle malformed open-editor URLs with a controlled response and parse their query without relying on the Host header.
