---
"webpack-dev-server": patch
---

`/webpack-dev-server/open-editor` now opens only a file the last build actually
read. The reference it is given is webpack's module identifier, taken from a
build error whose text a loader or a dependency writes, so it is not
necessarily a file the project built — and the endpoint hands it to an editor.
The compilation's own file dependencies are the boundary, so a module outside
the project root, which a monorepo has, still opens, while a path the build
never touched is refused.

The same-origin check on `/webpack-dev-server/open-editor` and
`/webpack-dev-server/invalidate` no longer trusts a request that carries
neither `Sec-Fetch-*` metadata nor an `Origin`. Browsers omit Fetch Metadata
for a destination that is not potentially trustworthy — plain `http` to
anything but `localhost`, which `host: "0.0.0.0"` gives you — and a no-cors
request such as `<img src>` carries no `Origin` either, so a cross-site load of
either endpoint arrived with neither header and was indistinguishable from the
overlay's own request. It is the same omission that defeated the earlier
`Sec-Fetch` check in CVE-2026-6402.

This costs `curl` access to those two endpoints, which was never documented.
Reach the dev server over `localhost` or `https` to use them from a browser on
another machine.
