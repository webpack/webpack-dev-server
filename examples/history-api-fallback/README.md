# History API fallback

```shell
node ../../bin/webpack-dev-server.js --open --history-api-fallback
```

Enables support for history API fallback, which means that a request will fallback to `/index.html` if no resource can be found.

Note that by default, some URLs don't work. For example, if the url contains a dot. Be sure to checkout the [connect-history-api-fallback](https://github.com/bripkens/connect-history-api-fallback) options.

## What should happen

The script should open `http://localhost:8080/`, and you should see "It's working from path /".

Go to `http://localhost:8080/foo/bar`. You should see "It's working from path /foo/bar".
