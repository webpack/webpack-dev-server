import { readFileSync } from "node:fs";
import { startExample } from "./start.js";
import config from "./webpack.config.js";

if (
  !process.env.HTTP3_KEY ||
  !process.env.HTTP3_CERT ||
  !process.env.HTTP3_CA
) {
  throw new Error(
    "Set HTTP3_KEY, HTTP3_CERT and HTTP3_CA to your local key, certificate and CA files",
  );
}
const server = await startExample({
  key: readFileSync(process.env.HTTP3_KEY),
  cert: readFileSync(process.env.HTTP3_CERT),
  ca: readFileSync(process.env.HTTP3_CA),
  port: Number(process.env.PORT || 8443),
  runtimeMode: process.env.HTTP3_RUNTIME || "portable",
  config,
});
console.log(
  `Open ${server.url}; HTTP/3 alternative uses UDP ${server.companion.port}`,
);
console.log(
  "Edit message.js to test hot updates. WebSocket HMR stays on the HTTPS TCP listener.",
);
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () =>
    server.close().catch((error) => {
      console.error(error);
      process.exitCode = 1;
    }),
  );
}
