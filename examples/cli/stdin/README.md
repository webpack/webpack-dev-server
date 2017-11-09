# CLI: Stdin Option

Specifying this option instructs the server to close when `stdin` ends.

```console
npm run webpack-dev-server -- --stdin
```

## What Should Happen

1. The server should begin running.
2. Press `CTL+D` on your keyboard.
3. The server should close.

_Note: the keyboard shortcut for terminating `stdin` can vary depending on the
operating systems._
