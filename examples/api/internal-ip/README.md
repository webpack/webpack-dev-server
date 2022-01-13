# internalIP(family: "v4" | "v6")

Returns the internal IP address asynchronously.

```js
const WebpackDevServer = require("webpack-dev-server");

const logInternalIPs = async () => {
  const localIPv4 = await WebpackDevServer.internalIP("v4");
  const localIPv6 = await WebpackDevServer.internalIP("v6");

  console.log("Local IPv4 address:", localIPv4);
  console.log("Local IPv6 address:", localIPv6);
};

logInternalIPs();
```

Use the following command to run this example:

```console
node app.js
```

## What Should Happen

- The script should log your local IPv4 and IPv6 address.
