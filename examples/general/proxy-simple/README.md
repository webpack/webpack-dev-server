# General: Simple Proxy

```console
npx webpack serve --open
```

In `webpack.config.js` there is a very simple configuration for a proxy. Note that this only works when proxying to a direct ip address. See the proxy-advanced example if you want to proxy to a domain.

## What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
3. Navigate to `http://localhost:8080/api/hey`.
4. Since the proxy target does not actually exist, the console/terminal should
   display an error that reads
   `[HPM] PROXY ERROR: ECONNREFUSED. localhost -> http://127.0.0.1:50545/api/hey`.
