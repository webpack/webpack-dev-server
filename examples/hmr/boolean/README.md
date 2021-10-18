# Hot Module Reloading

Hot Module Replacement (HMR) exchanges, adds, or removes modules while an application is running, without a full reload of the page.

## true

Enable webpack's [Hot Module Replacement](https://webpack.js.org/concepts/hot-module-replacement/) feature:

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    hot: true,
  },
};
```

Usage via CLI:

```console
npx webpack serve --open --hot
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
[HMR] Updated modules:
[HMR]  - ./example.js
[HMR] App is up to date.
```

You should also see the text on the page itself change to match your edits in
`example.js`.

## false

Disable webpack's [Hot Module Replacement](https://webpack.js.org/concepts/hot-module-replacement/) feature:

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    hot: false,
  },
};
```

Usage via CLI:

```console
npx webpack serve --open --no-hot
```

## What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. In your editor, open `example.js` and change any part of the `innerHTML` string.
3. text on the page shouldn't change itself to match your edits in `example.js`, without reloading the page.
