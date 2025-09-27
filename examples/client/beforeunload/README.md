# Beforeunload Example

**webpack.config.js**

```js
module.exports = {
  devServer: {
    hot: true,
    liveReload: true, // Both HMR and Live Reload can be affected
  },
};
```

Usage via CLI:

```console
npx webpack serve --open
```

This example demonstrates an issue where webpack-dev-server's `isUnloading` flag gets stuck after canceling the browser's "Leave site?" dialog, blocking both HMR and Live Reload updates.

## What Should Happen

The script should open `http://localhost:8080/` in your default browser.

1. Click **"Add Beforeunload Event"** button
2. Try to reload the page and click **"Cancel"** in the dialog
3. Edit `app.js` file to trigger rebuild
4. **Issue**: Page updates are blocked until manual refresh

## How to Fix

**Manually refresh the page** (F5/Ctrl+R) to restore HMR and Live Reload functionality.
