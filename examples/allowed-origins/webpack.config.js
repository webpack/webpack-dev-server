import { setup } from "../util.js";

export default setup(
  {
    entry: "./app.js",
    devServer: {
      allowedHosts: ["localhost"],
      allowedOrigins: ["http://localhost:3000"],
      client: {
        webSocketURL: "ws://localhost:8080/ws",
      },
    },
  },
  import.meta.url,
);
