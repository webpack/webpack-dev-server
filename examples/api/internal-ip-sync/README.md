# internalIPSync(family: "v4" | "v6")

Returns the internal IP address synchronously.

```js
const WebpackDevServer = require("webpack-dev-server");

const localIPv4 = WebpackDevServer.internalIPSync("v4");
const localIPv6 = WebpackDevServer.internalIPSync("v6");

console.log("Local IPv4 address:", localIPv4);
console.log("Local IPv6 address:", localIPv6);
```

Use the following command to run this example:

```console
node app.js
```

## What Should Happen

- The script should log your local IPv4 and IPv6 address.
