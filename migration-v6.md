# Migration guide

This document serves as a migration guide for `webpack-dev-server@6.0.0`.

## ⚠ Breaking Changes

- Minimum supported `Node.js` version is `20.9.0`.
- Minimum supported `webpack` version is `5.101.0`.
- Support for **SockJS** in the WebSocket transport has been removed. Now, only **native WebSocket** is supported, or **custom** client and server implementations can be used.
- The options for passing to the `proxy` have changed. Please refer to the [http-proxy-middleware migration guide](https://github.com/chimurai/http-proxy-middleware/blob/master/MIGRATION.md) for details.
- Remove support for the spdy server type. Use the http2 server type instead; however, since Express does not work correctly with it, a custom server (e.g., Connect or Hono) should be used.

  v4:

  ```js
  module.exports = {
    // ...
    devServer: {
      server: "spdy",
    },
  };
  ```

  v5:

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

## Deprecations

- The static methods `internalIP` and `internalIPSync` were removed. Use `findIp` instead.

  v4:

  ```js
  const ip = Server.internalIP("v4");
  ```

  v5:

  ```js
  const ip = Server.findIp("v4", true);
  ```

- The bypass function in the proxy configuration was removed. Use the `pathFilter` and `router` for similar functionality. See the example below.

  v4:

  ```js
  module.exports = {
    // ...
    devServer: {
      proxy: [
        {
          context: "/api",
          bypass(req, res, proxyOptions) {
            if (req.url.startsWith("/api/special")) {
              return "/special.html";
            }
          },
        },
      ],
    },
  };
  ```

  v5:

  ```js
  module.exports = {
    // ...
    devServer: {
      proxy: [
        {
          pathFilter: "/api/special",
          router: () => "http://localhost:3000", // Original Server
          pathRewrite: () => "/special.html",
        },
      ],
    },
  };
  ```

  When `bypass` was used and that function returned a boolean, it would automatically result in a `404` request. This can’t be achieved in a similar way now, or, if it returned a string, you can do what was done in the example above.

  `bypass` also allowed sending data; this can no longer be done. If you really need to do it, you’d have to create a new route in the proxy that sends the same data, or alternatively create a new route on the main server and, following the example above, send the data you wanted.
