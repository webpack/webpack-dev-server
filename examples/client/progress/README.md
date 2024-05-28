# client.progress Option

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    client: {
      progress: true | "linear" | "circular",
    },
  },
};
```

Usage via CLI:

```shell
npx webpack serve --open --client-progress
npx webpack serve --open --client-progress linear
npx webpack serve --open --client-progress circular
```

To disable:

```shell
npx webpack serve --open --no-client-progress
```

## What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
3. In `app.js` change the text and save.
4. You should see the compilation progress in the browser console.
