# historyApiFallback Option

This option enables [History API Fallback](https://github.com/bripkens/connect-history-api-fallback)
support in `webpack-dev-server`, effectively asking the server to fallback to
`index.html` in the event that a requested resource cannot be found.

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    historyApiFallback: true,
  },
};
```

Usage via CLI:

```console
npx webpack serve --open --history-api-fallback
```

## What Should Happen

1. The script should open `http://0.0.0.0:8080/` in your default browser.
2. You should see text on the page that reads `Current Path: /`.
3. Navigate to `http://localhost:8080/foo-bar`.
4. You should see text on the page that reads `Current Path: /foo-bar`.

_Note: some URLs don't work by default. For example, if the url contains a dot (`/file.txt` in this example).
Be sure to checkout the [connect-history-api-fallback](https://github.com/bripkens/connect-history-api-fallback)
options._

To allow `/file.txt` to fallback, update the `webpack.config.js` as follows:

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    historyApiFallback: {
      disableDotRule: true,
    },
  },
};
```

Use the following command to run the example:

```console
npx webpack serve --open
```

## What Should Happen

1. The script should open `http://0.0.0.0:8080/` in your default browser.
2. You should see text on the page that reads `Current Path: /`.
3. Navigate to `http://localhost:8080/file.txt`.
4. You should see text on the page that reads `Current Path: /file.txt`.
