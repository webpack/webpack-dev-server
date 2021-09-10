# https

You may choose to wish to run `webpack-dev-server` on `https`.

## boolean

Use HTTPS protocol.

```js
module.exports = {
  // ...
  devServer: {
    https: true,
  },
};
```

Usage via CLI:

```console
npx webpack serve --open --https
```

## What Should Happen

1. The script should open `https://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
