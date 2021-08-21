# onAfterSetupMiddleware

Provides the ability to execute custom middleware after all other middleware internally within the server.

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    onAfterSetupMiddleware: (devServer) => {
      devServer.app.get("/after/some/path", (_, response) => {
        response.send("after");
      });
    },
  },
};
```

To run this example use the following command:

```console
npx webpack serve --open
```

## What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
3. Go to `http://localhost:8080/after/some/path`, you should see the text on the page itself change to read `after`.
