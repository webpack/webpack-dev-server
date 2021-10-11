# proxy

Proxying some URLs can be useful when you have a separate API backend development server and you want to send API requests on the same domain.

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    proxy: {
      "/proxy": {
        target: "http://localhost:5000",
      },
    },
  },
};
```

To run this example use the following command:

```console
npx webpack serve --open
```

## What Should Happen

1. The script start a proxy server on `http://localhost:5000/` and open `http://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success! Now visit /proxy`.
3. Now visit the `/proxy` route by clicking on the `/proxy` text, you should see the text on the page itself change to read `response from proxy`.
