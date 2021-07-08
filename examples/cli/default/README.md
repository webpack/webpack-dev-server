# CLI: Default State

This example demonstrates how to use `webpack-dev-server`.

```console
npx webpack serve --open
```

To run your app using an alternative config, use:

```console
npx webpack serve --open --config alternative.config.js
```

## What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
3. In `app.js` uncomment the code that results in an error and save.
4. This error should be visible in the console/terminal and in the browser's devtools.
5. In `app.js` uncomment the code that results in a warning. This warning should
   be visible in the console/terminal and in the browser's devtools.
6. Try changing something in `style.less`. The browser should refresh, and the
   change should be visible in the app.
