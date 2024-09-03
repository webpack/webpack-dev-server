# HTTP2 server

**webpack.config.js**

```js
const connect = require("connect");

module.exports = {
  // ...
  devServer: {
    server: {
      server: "http2",
      app: () => connect(),
    },
  },
};
```

## What Should Happen

1. The script should open `https://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
