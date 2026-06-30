---
"webpack-dev-server": patch
---

Reject cross-site requests to the internal `open-editor` and `invalidate` endpoints. They performed state-changing actions (opening a file in the editor, forcing a recompilation) on any GET request, so a page the developer visited could trigger them. They now require a same-origin request, validated via `Sec-Fetch-Site` with an `Origin`/`Host` fallback.
