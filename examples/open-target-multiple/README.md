# Open Target Option (Multiple)

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    open: {
      target: ["/example1.html", "example2.html"],
    },
  },
};
```

Usage via CLI:

```console
npx webpack serve --open-target example1.html --open-target example2.html
```

Some applications may consist of multiple pages. During development it may
be useful to directly open multiple pages at the same time. The pages to open
may be specified as the argument to the `open-target` option.

## What Should Happen

The script should open `http://localhost:8080/example1.html` and
`http://localhost:8080/example2.html` in your default browser.
You should see the text on the page itself change to read `Success!`.
