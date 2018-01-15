# CLI: Lazy Option

With the `lazy` option enabled, `webpack-dev-server` does **not** watch the
bundle files, nor does it automatically recompile them or refresh the browser.
Instead, it only compiles after you manually refresh the page.

```shell
npm run webpack-dev-server -- --open --lazy --no-inline
```

## What should happen

1. The script should open `http://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
3. Change something in `app.js` and save.
4. You should not see any changes in the console/terminal output.
5. You should not see any changes in the browser.
6. Refresh the page.
7. You should see compilation in the console/terminal and changes in the browser.
