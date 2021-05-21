# CLI: Multi Compiler

`webpack-dev-server` should be able to compile multiple webpack configs.

```shell
npx webpack serve --open-target
```

## What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
3. In `app.js` write code containing a syntax error and save the file.
4. The page should now refresh and show a full screen error overlay, displaying
   the syntax error.
