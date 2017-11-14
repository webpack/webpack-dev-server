# CLI: Inline Iframe

The `--no-inline` option instructs `webpack-dev-server` to open the app in an
iframe. The page then contains the client script to connect to the server.

```shell
npm run webpack-dev-server -- --no-inline --open
```

## What Should Happen

1. The script should open `http://localhost:8080/webpack-dev-server/` in your
default browser.
2. There should be a bar at the top of the page that reads `App ready`.
3. In `app.js`, uncomment the code that results in an error and save.
4. The bar at the top should read `Errors while compiling. App updated with errors.
No reload!` along with a stack trace.
5. In `app.js`, uncomment the code that results in a warning. The bar at the top
should read `Warnings while compiling`.
