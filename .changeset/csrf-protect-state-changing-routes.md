---
"webpack-dev-server": patch
---

Protect the built-in state-changing routes (`/webpack-dev-server/invalidate` and `/webpack-dev-server/open-editor`) against cross-site request forgery. Requests are now checked with `Sec-Fetch-Site` (falling back to an `Origin`/`Host` comparison when it is absent), so a cross-site page can no longer trigger a rebuild or open a file in the editor. Same-origin requests, user-initiated navigations, and non-browser clients (e.g. curl) are unaffected.
