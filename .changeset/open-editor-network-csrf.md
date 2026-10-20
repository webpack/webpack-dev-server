---
"webpack-dev-server": patch
---

Refuse a request to open the editor that shows no page it came from, when the server is reached through a network address. Over `http:` anywhere but `localhost` a browser sends neither `Sec-Fetch-Site` nor `Origin`, so any page could have the developer's editor open a file of its choosing. The overlay's own request carries its `Referer` and keeps working, as does every request through `localhost`.
