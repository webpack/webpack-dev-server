# General: Proxy Hot Reload

```shell
npx webpack serve --open-target
```

Enables hot reloading for proxy config. If function is provided instead of
object, dev server calls it on each request to get proxy config and replaces proxy middleware if config was changed.

## What should happen

1. The script should open `http://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
3. Navigate to `http://localhost:8080/api/users`.
4. The page should display several JSON objects.

While the server is running, open `proxy-config.js` and replace the following:

```js
module.exports = {
  target: 'http://jsonplaceholder.typicode.com/',
  pathRewrite: {
    '^/api': '',
  },
};
```

with:

```js
module.exports = {
  target: 'http://reqres.in/',
};
```

A request to `http://localhost:8080/api/users` should return a response from `http://reqres.in/`.
