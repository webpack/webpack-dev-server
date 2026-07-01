---
"webpack-dev-server": minor
---

Use `compiler.platform` to determine the target environment instead of inspecting the resolved `target` string. Universal targets (`"universal"` or `["web", "node"]`, where `compiler.platform.universal` is `true` since webpack `5.108.0`) are treated as web targets so the client runtime is injected.
