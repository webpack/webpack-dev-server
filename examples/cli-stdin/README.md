# CLI - stdin

```shell
node ../../bin/webpack-dev-server.js --stdin
```

When stdin ends, we want to close the webpack-dev-server.

## What should happen

The script should start up. When `ctrl+D` is pressed, the server should quit. Note that the shortcut can differ on operating systems, but the point is to signify the end of input.
