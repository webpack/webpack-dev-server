---
"webpack-dev-server": minor
---

Add plugin support. `webpack-dev-server` can now be used as a webpack plugin, integrating with the compiler lifecycle without explicitly passing a compiler, preventing multiple server starts on recompilation, ensuring clean shutdown, and supporting `MultiCompiler` setups with multiple independent plugin servers.
