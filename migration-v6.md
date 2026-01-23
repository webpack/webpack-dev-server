# Migration guide

This document serves as a migration guide for `webpack-dev-server@6.0.0`.

## ⚠ Breaking Changes

- Minimum supported `Node.js` version is `20.9.0`.
- Support for **SockJS** in the WebSocket transport has been removed. Now, only **native WebSocket** is supported, or **custom** client and server implementations can be used.
- The options for passing to the `proxy` have changed. Please refer to the [http-proxy-middleware migration guide](https://github.com/chimurai/http-proxy-middleware/blob/master/MIGRATION.md) for details.

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
