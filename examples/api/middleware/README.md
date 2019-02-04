# API: Custom Middleware

While it's recommended to run `webpack-dev-server` via the CLI, you may also
choose to start a server via the API. This example demonstrates using one of the
few custom middleware options; `before`.

```console
node server.js
```

## What Should Happen

1. Open `http://localhost:8080/` in your preferred browser.
2. You should see the text on the page itself change to read `Success!`.
3. In the console/terminal, you should see the following for each refresh in
   the browser:

```
Using middleware for /
Using middleware for /bundle.js
```
