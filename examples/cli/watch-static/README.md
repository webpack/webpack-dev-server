# CLI: Static

## Watching a single directory

```console
npm run webpack-dev-server -- --static assets --open-target
```

### What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
3. In your editor, edit `assets/index.html` and save your changes.
4. The app should reload in the browser.

## Watching an Array of Directories

```js
// webpack.conf.js
module.exports = {
  /* ... */
  devServer: {
    static: ['assets', 'css'],
  },
};
```

```console
npm run webpack-dev-server -- --open-target
```

or via CLI only:

```console
npm run webpack-dev-server -- --static assets --static css --open-target
```

### What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
3. In your editor, edit `assets/index.html` and save your changes.
4. The app should reload.
5. In your editor, edit `css/styles.css` and save your changes.
6. The app should reload.
