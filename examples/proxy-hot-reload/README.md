# Proxy: hot reload

```shell
node ../../bin/webpack-dev-server.js --open
```

Enables hot reloading for proxy config. If function is provided instead of
object, dev server calls it on each request to get proxy config and replaces proxy middleware if config was changed.

## What should happen

The script should open `http://localhost:8080/`. It should show "It's working."

Go to `http://localhost:8080/api/users`. It should show a couple of JSON objects.

While dev server is running, open `proxy-config.js` and replace
```js
module.exports = {
    target: 'http://jsonplaceholder.typicode.com/',
    pathRewrite: {
        '^/api': ''
    }
};
```
with
```js
module.exports = {
    target: 'http://reqres.in/'
};
```

Now `http://localhost:8080/api/users` should return a response from `http://reqres.in/`.
