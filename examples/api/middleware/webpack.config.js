// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
import { setup } from "../../util.js";

export default setup(
  {
    context: import.meta.dirname,
    entry: "./app.js",
    output: {
      filename: "bundle.js",
    },
    stats: {
      colors: true,
    },
    devServer: {
      setupMiddlewares: (middlewares) => {
        middlewares.unshift((req, res, next) => {
          console.log(`Using middleware for ${req.url}`);
          next();
        });
        return middlewares;
      },
    },
  },
  import.meta.url,
);
