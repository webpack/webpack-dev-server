# Magic HTML

Enables/Disables magic HTML routes (enabled by default).

## true

Setting it to `true` will enable magic HTML route (`/main`):

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    magicHtml: true,
  },
};
```

Usage via CLI:

```console
npx webpack serve --magic-html --open
```

### What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. Go to `http://localhost:8080/main`, you should see the text on the page itself change to read `You are viewing the magic HTML route!`.

## false

Setting it to `false` will disable magic HTML route (`/main`):

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    magicHtml: false,
  },
};
```

Usage via CLI:

```console
npx webpack serve --no-magic-html --open
```

### What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. Go to `http://localhost:8080/main`, you should see the text on the page itself change to read `Cannot GET /main` as it is not accessible.
