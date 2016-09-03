# Hot Module Reloading

```shell
node ../../bin/webpack-dev-server.js --open --hot
```

With Hot Module Reloading we want to apply updates to the page without fully refreshing it.

## What should happen

The script should open `http://localhost:8080/`. In the app you should see "Does it work?"

In your editor, go to `example.js`, and change "Does it work?" to "It works!"

Open the devtools for the app, and you should see:

```
[WDS] App updated. Recompiling...
[WDS] App hot update...
[HMR] Checking for updates on the server...
[HMR] Updated modules:
[HMR]  - ./example.js
[HMR]  - ./hmr.js
[HMR] App is up to date.
```

Also verify that the text actually in the app actually changed to "It works!"
