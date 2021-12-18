# setupMiddlewares

Provides the ability to execute a custom function and apply custom middleware(s).

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error("webpack-dev-server is not defined");
      }

      devServer.app.get("/setup-middleware/some/path", (_, response) => {
        response.send("setup-middlewares option GET");
      });

      middlewares.push({
        name: "hello-world-test-one",
        // `path` is optional
        path: "/foo/bar",
        middleware: (req, res) => {
          res.send("Foo Bar!");
        },
      });

      middlewares.push((req, res) => {
        res.send("Hello World!");
      });

      return middlewares;
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
3. Go to `http://localhost:8080/setup-middleware/some/path`, you should see the text on the page itself change to read `setup-middlewares option GET`.
