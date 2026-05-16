// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
import { setup } from "../../util.js";

export default setup(
  {
    context: import.meta.dirname,
    entry: "./app.js",
    devServer: {
      headers: [
        {
          key: "X-Foo",
          value: "value1",
        },
        {
          key: "X-Bar",
          value: "value2",
        },
      ],
    },
  },
  import.meta.url,
);
