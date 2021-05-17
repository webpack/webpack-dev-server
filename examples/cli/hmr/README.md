# Hot Module Reloading

Hot Module Replacement (HMR) exchanges, adds, or removes modules while an
application is running, without a full reload of the page.

To run this example, run this command in your console or terminal:

```console
npm run webpack-dev-server -- --open-target --hot
```

## What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. In your editor, open `example.js` and change any part of the `innerHTML` string.
3. Open the console in your browser's devtools.

In the devtools console you should see:

```
[WDS] App updated. Recompiling...
[WDS] App hot update...
[HMR] Checking for updates on the server...
[HMR] Updated modules:
[HMR]  - ./example.js
[HMR] App is up to date.
```

You should also see the text on the page itself change to match your edits in
`example.js`.
