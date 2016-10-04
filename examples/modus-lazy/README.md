# Modus: lazy

```shell
node ../../bin/webpack-dev-server.js --open --lazy --no-inline
```

With the `lazy` modus, webpack-dev-server does **not** watch the files, automatically recompile them or refresh the browser. Instead, it only compiles after you manually refresh the page.

## What should happen

The script should open `http://localhost:8080/`. You should see "It's working."

Change something in `app.js` and save. Check that in the CLI, nothing changed. Also check that in the browser, the old content is still displayed.

Now refresh the app. The CLI should now compile. In the app you should now see the new content.
