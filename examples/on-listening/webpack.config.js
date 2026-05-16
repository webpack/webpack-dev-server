// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
import { setup } from "../util.js";

export default setup(
  {
    context: import.meta.dirname,
    entry: "./app.js",
    devServer: {
      onListening: (devServer) => {
        const { port } = devServer.server.address();
        console.log("Listening on port:", port);
      },
    },
  },
  import.meta.url,
);
