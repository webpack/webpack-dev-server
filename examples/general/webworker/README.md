# General: WebWorker

This example demonstrates using a WebWorker within an app run by `webpack-dev-server`.

```console
npx webpack serve
```

## What should happen

1. The main thread sends a message to the Worker.
2. The worker outputs the message in the console.
3. The worker sends a message back to the main thread.
4. The main thread posts the message in the console.

No error, warning or other log traces should be in the console.
