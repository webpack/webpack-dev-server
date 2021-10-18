# Hot Module Reloading

Hot Module Replacement (HMR) exchanges, adds, or removes modules while an application is running, without a full reload of the page.

## only

Enables Hot Module Replacement without page refresh as a fallback in case of build failures.

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    hot: "only",
  },
};
```

Usage via CLI:

```console
npx webpack serve --open --hot only
```

## What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. In your editor, open `example.js` and change any part of the `innerHTML` string.
3. Open the console in your browser's devtools.

In the devtools console you should see:

```
[webpack-dev-server] App updated. Recompiling...
[webpack-dev-server] App hot update...
[HMR] Checking for updates on the server...
 ⚠️ Ignored an update to unaccepted module ./example.js -> ./app.js
[HMR] Nothing hot Updated.
[HMR] App is up to date.
```

5. Refresh the page and see the text on the page itself change to match your edits in `example.js`.
