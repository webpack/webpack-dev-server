# Modus: manual script

```shell
node ../../bin/webpack-dev-server.js --open --no-inline
```

The webpack-dev-server client is added as script tag to the html page.

```shell
node ../../bin/webpack-dev-server.js --open --no-inline --https
```

This will do the same, but connect over https.

## What should happen

Try to update app.js by uncommenting some lines. The browser should reflect your changes.

If there is a compilation error or warning, this should be displayed in the CLI and devtools.

For the `--https` variant, it should do the same. Make sure to test this when making changes to how the websocket URL is parsed.
