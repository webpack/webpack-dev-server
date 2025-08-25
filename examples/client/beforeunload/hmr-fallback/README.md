# client.beforeunload Example

This example reproduces a bug where the `isUnloading` flag gets stuck after canceling the "Leave site?" dialog, blocking HMR/Live Reload.

## Bug Description

When a user cancels the native confirmation dialog triggered by a `beforeunload` event listener, webpack-dev-server's internal `isUnloading` state remains `true`. This causes all subsequent HMR and live reloads to be ignored until manual refresh.

## Configuration

```js
module.exports = {
  devServer: {
    hot: true,
    liveReload: false, // Intentionally configured to cause HMR fallback
  },
};
```

## How to Reproduce the Bug

### Prerequisites

- Enable "Slow 3G" in browser DevTools Network tab (to make the issue more visible)
- Open browser console to see webpack-dev-server logs

### Steps

1. Run `npx webpack serve` and open `http://localhost:8080/`
2. Click **"Add Beforeunload Event"** button
3. Click **"Reload Page"** button (or press F5/Ctrl+R)
4. When "Leave site?" dialog appears, click **"Cancel"**
5. Edit `app.js` file (make any change to trigger rebuild)
6. **Bug**: Page does not update despite file changes

### Expected vs Actual Behavior

**Expected**: After canceling dialog, file changes should still trigger page updates  
**Actual**: Page updates are completely blocked until manual refresh
