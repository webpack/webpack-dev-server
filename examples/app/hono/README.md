# `app` Option

Serve using [`hono`](https://github.com/honojs/hono) as an application.

**webpack.config.js**

```js
import { createAdaptorServer } from "@hono/node-server";
import { Hono } from "hono";
import wdm from "webpack-dev-middleware";

export default {
  // ...
  devServer: {
    app: () => new Hono(),
    server: (_, app) => createAdaptorServer({ fetch: app.fetch }),
    setupMiddlewares: (_, devServer) => {
      const hostCheck = async (context, next) => {
        const headers = context.env.incoming.headers;
        const headerName = headers[":authority"] ? ":authority" : "host";

        if (!devServer.isValidHost(headers, headerName)) {
          return context.text("Invalid Host header", 403);
        }

        await next();
      };
      const crossOriginCheck = async (context, next) => {
        const headers = context.env.incoming.headers;
        const headerName = headers[":authority"] ? ":authority" : "host";

        if (
          !devServer.isValidHost(headers, headerName, false) &&
          headers["sec-fetch-mode"] === "no-cors" &&
          headers["sec-fetch-site"] === "cross-site"
        ) {
          return context.text("Cross-Origin request blocked", 403);
        }

        if (
          devServer.options.allowedHosts !== "all" &&
          !devServer.isUserCORSWildcardEnabled()
        ) {
          context.header("Cross-Origin-Resource-Policy", "same-origin");
        }

        await next();
      };

      return [
        { middleware: hostCheck },
        { middleware: crossOriginCheck },
        { middleware: wdm.honoWrapper(devServer.compiler) },
      ];
    },
  },
};
```

Custom applications replace the default middleware stack, so they must provide
equivalent host and cross-origin protections.

## What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
