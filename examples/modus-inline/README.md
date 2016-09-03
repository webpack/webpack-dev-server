# Modus: inline

```shell
node ../../bin/webpack-dev-server.js --open
```

This opens the app in `inline` modus (which is the default).

```shell
node ../../bin/webpack-dev-server.js --open --config alternative.config.js
```

This also opens the app in `inline` modus, but with a custom config.

## What should happen

The script should open `http://localhost:8080/`. It should display "It's working" with a dotted background.

In `app.js`, uncomment the code that results in an error and save. This error should be visible in the CLI and devtools.

Then, in `app.js`, uncomment the code that results in a warning. This warning should be visible in the CLI and devtools.

Also try to change something in `style.less`. The browser should refresh, and the change should be visible in the app.
