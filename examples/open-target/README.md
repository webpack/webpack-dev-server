# Open Target Option

## Open default generated URL in browser:

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    open: {
      target: "<url>",
    },
  },
};
```

Usage via CLI:

```
npx webpack serve --open-target <url>
```

## Open specific page in browser:

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    open: {
      target: "/example.html#page1",
    },
  },
};
```

Usage via CLI:

```
npx webpack serve --open-target /example.html#page1
```

## Open specific browser:

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    open: {
      app: "firefox",
    },
  },
};
```

Usage via CLI:

```
npx webpack serve --open-app-name firefox
```

## Open specific page in specific browser:

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    open: {
      target: "/example.html#page1",
      app: "firefox",
    },
  },
};
```

Usage via CLI:

```
npx webpack serve --open-target example.html#page1 --open-app-name firefox
```

Some applications may consist of multiple pages. During development it may
be useful to directly open a particular page. The page to open may be specified
as the argument to the `open-target` option.

## What Should Happen

The script should open `http://localhost:8080/example.html#page1` in your
default/specified browser. You should see the text on the page itself change to read `Success!`.
