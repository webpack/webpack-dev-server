# CLI: Open Page Option

```console
npm run webpack-dev-server -- --open --open-page example.html#page1
```

Some applications may consist of multiple pages. During development it may
be useful to directly open a particular page. The page to open may be specified
as the argument to the `open-page` option.

## What Should Happen

The script should open `http://localhost:8080/example.html#page1` in your
default browser. You should see the text on the page itself change to read `Success!`.
