# Proxy: simple

```shell
node ../../bin/webpack-dev-server.js --open
```

In `webpack.config.js` there is a very simple configuration for a proxy. Note that this only works when proxying to a direct ip address. See the proxy-advanced example if you want to proxy to a domain.

## What should happen

The script should open `http://localhost:8080/`. It should show "It's working."

Browse to `http://localhost:8080/api/hey`. Since the proxy target does not actually exist, the CLI should give the error `[HPM] PROXY ERROR: ECONNREFUSED. localhost -> http://127.0.0.1:50545/api/hey`.
