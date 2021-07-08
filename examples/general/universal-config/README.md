# General: Webpack Universal Config

This example demonstrates using a `webpack` config containing a `target: web` config and `target:node` config.

```console
npx webpack serve --open
```

## What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `[client.js, server.js]: Success!`.
