# onBeforeSetupMiddleware

Provides the ability to execute custom middleware prior to all other middleware internally within the server.

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    onBeforeSetupMiddleware: (devServer) => {
      devServer.app.get("/before/some/path", (_, response) => {
        response.send("before");
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
3. Go to `http://localhost:8080/before/some/path`, you should see the text on the page itself change to read `before`.
