# client.overlay option

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    client: {
      overlay: true,
    },
  },
};
```

Usage via CLI:

```shell
npx webpack serve --open --client-overlay
```

To disable:

```shell
npx webpack serve --open --no-client-overlay
```

## What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. You should see an overlay in browser for compilation errors.
3. Update `entry` in webpack.config.js to `app.js` and save.
4. You should see the text on the page itself change to read `Success!`.
