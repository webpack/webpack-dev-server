import connect from "connect";
import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import { startCompanion } from "./companion.js";

export async function startExample({
  key,
  cert,
  ca,
  config,
  port = 0,
  quicPort = 0,
  runtimeMode = "portable",
  setupMiddlewares,
}) {
  let companion;
  let closing;
  const compiler = webpack(config);
  const devServer = new WebpackDevServer(
    {
      host: "127.0.0.1",
      port,
      server: { type: "http2", options: { key, cert, ca } },
      app: () => connect(),
      allowedHosts: ["localhost", "127.0.0.1"],
      static: { directory: config.context },
      hot: true,
      liveReload: false,
      open: false,
      setupExitSignals: false,
      headers: () => {
        if (!companion) return {};
        return {
          "Alt-Svc": companion.server.address()
            ? `h3=":${companion.port}"; ma=60`
            : "clear",
        };
      },
      setupMiddlewares,
      devMiddleware: { stats: "errors-warnings" },
    },
    compiler,
  );
  const close = () =>
    (closing ||= (async () => {
      try {
        await companion?.close();
      } finally {
        await devServer.stop();
      }
    })());
  try {
    await devServer.start();
    const upstreamPort = devServer.server.address().port;
    companion = await startCompanion({
      key,
      cert,
      ca,
      upstreamPort,
      port: quicPort,
      runtimeMode,
    });
    return {
      devServer,
      companion,
      port: upstreamPort,
      url: `https://localhost:${upstreamPort}`,
      close,
    };
  } catch (error) {
    await close();
    throw error;
  }
}
