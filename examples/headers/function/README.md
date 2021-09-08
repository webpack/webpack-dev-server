# headers option as a function

Adds headers to all responses.

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    headers: () => {
      return { "X-Custom-Header": ["key1=value1", "key2=value2"] };
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
4. Find `main.js`. The response headers should contain `X-Custom-Header: key1=value1` and `X-Custom-Header: key2=value2`.
