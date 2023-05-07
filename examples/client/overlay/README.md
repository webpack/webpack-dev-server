# client.overlay option

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    client: {
      overlay: true,
    },
  },
};
```

Usage via CLI:

```shell
npx webpack serve --open --client-overlay
```

To disable:

```shell
npx webpack serve --open --no-client-overlay
```

## What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. You should see an overlay in browser for compilation errors.
3. Update `entry` in webpack.config.js to `app.js` and save.
4. You should see the text on the page itself change to read `Success!`.

## Additional Configurations

### Filter errors by function

**webpack.config.js**

```js
module.exports = {
  devServer: {
    client: {
      overlay: {
        runtimeErrors: (msg) => {
          if (msg) {
            if (msg instanceof DOMException && msg.name === "AbortError") {
              return false;
            }

            let msgString;

            if (msg instanceof Error) {
              msgString = msg.message;
            } else if (typeof msg === "string") {
              msgString = msg;
            }

            if (msgString) {
              return !/something/i.test(msgString);
            }
          }

          return true;
        },
      },
    },
  },
};
```

Run the command:

```shell
npx webpack serve --open
```

What should happens:

1. When you click the "Click to throw error" button, the overlay should appears.
1. When you click the "Click to throw ignored error" button, the overlay should not appear but you should see an error is logged in console (default browser behavior).
1. When you click the "Click to throw unhandled promise rejection" button, the overlay should appears.
1. When you click the "Click to throw ignored promise rejection" button, the overlay should not appear but you should see an error is logged in console (default browser behavior).
