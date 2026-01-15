# Migration guide

This document serves as a migration guide for `webpack-dev-server@6.0.0`.

## ⚠ Breaking Changes

- Support for **SockJS** in the WebSocket transport has been removed. Now, only **native WebSocket** is supported, or **custom** client and server implementations can be used.

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
