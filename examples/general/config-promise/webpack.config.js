// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
import { setup } from "../../util.js";

export default new Promise((resolve) => {
  resolve(
    setup(
      {
        context: import.meta.dirname,
        entry: "./app.js",
        devServer: {},
      },
      import.meta.url,
    ),
  );
});
