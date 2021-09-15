# headers option as an object

Adds headers to all responses.

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    headers: [
      {
        key: "X-Foo",
        value: "value1",
      },
      {
        key: "X-Bar",
        value: "value2",
      },
    ],
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
4. Find `main.js`. The response headers should contain `X-Foo: value1` and `X-Bar: value2`.
