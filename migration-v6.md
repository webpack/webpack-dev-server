# Migration guide

This document serves as a migration guide for `webpack-dev-server@6.0.0`.

## ⚠ BREAKING CHANGES

- Minimum supported `Node.js` version is `20.9.0`.

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
