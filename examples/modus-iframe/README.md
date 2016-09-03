# Modus: iframe

```shell
node ../../bin/webpack-dev-server.js --no-inline --open
```

The app is started in an iframe. The page contains the client script to connect to webpack-dev-server.

## What should happen

It should open `http://localhost:8080/webpack-dev-server/`. In the bar at the top, the text should say `App ready.`

In `app.js`, uncomment the code that results in an error and save. The bar at the top should display `Errors while compiling. App updated with errors. No reload!` with a stack trace underneath it.

Then, in `app.js`, uncomment the code that results in a warning. The bar at the top should display `Warnings while compiling.`.
