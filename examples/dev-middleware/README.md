# devMiddleware option

Provide options to [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware) which handles webpack assets.

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    devMiddleware: {
      index: true,
      headers: {
        "X-Custom-Header": "yes",
      },
    },
  },
};
```

To run this example use the following command:

```console
npx webpack serve --open
```

## What should happen

1. The script should open `http://localhost:8080/`.
2. You should see the text on the page itself change to read `Success!`.
3. Open the console in your browser's devtools and select the _Network_ tab.
4. Find `main.js`. The response headers should contain `X-Custom-Header: yes`.

Now update `webpack.config.js` with [`index: false`](https://github.com/webpack/webpack-dev-middleware#index), this will tell the server to not respond to requests to the root URL.

Now close and restart the server with:

```console
npx webpack serve --open
```

## What should happen

1. The script should open `http://localhost:8080/`.
2. You should see the `Cannot GET /` text on the page.
