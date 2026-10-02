---
"webpack-dev-server": patch
---

The error overlay is webpack-dev-middleware's, with no code left here to adapt
it. `client-src/overlay.js` is gone: the client calls
`showProblems`/`clear` directly, since that overlay keeps a slot per reporting
source and the state machine this package had was what stood in for that, and
`formatProblem` comes from there too. What stays is this package's own
identity on top of it — the `webpack-dev-server-client-overlay` element id,
the `webpack-dev-server#overlay` Trusted Types policy name, and the
`/webpack-dev-server/open-editor` route — passed as options.

Nothing changes for `client.overlay`, its `errors`/`warnings`/`runtimeErrors`
filters, or `trustedTypesPolicyName`.
