import { setup } from "../util.js";

export default setup(
  {
    entry: "./app.js",
    devServer: {
      allowedOrigins: ["http://app.localhost:3000"],
    },
  },
  import.meta.url,
);
