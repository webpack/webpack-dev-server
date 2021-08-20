# onListening

Provides the ability to execute a custom function when webpack-dev-server starts listening for connections on a port.

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    onListening: (devServer) => {
      const port = devServer.server.address().port;
      console.log("Listening on port:", port);
    },
  },
};
```

To run this example use the following command:

```console
npx webpack serve --open
```

## What Should Happen

1. The script should open `https://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
3. Check the terminal output, you should see `Listening on port: 8080` in the output.
