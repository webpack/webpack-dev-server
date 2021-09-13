# http2 option

Serve over HTTP/2 using [spdy](https://www.npmjs.com/package/spdy). This option is ignored for Node 15.0.0 and above, as `spdy` is broken for those versions.

## HTTP/2 with a self-signed certificate:

```js
module.exports = {
  // ...
  devServer: {
    http2: true,
  },
};
```

Usage via CLI:

```console
npx webpack serve --open --http2
```

### What Should Happen

1. The script should open `https://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
