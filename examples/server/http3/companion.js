// cspell:words currentspace
import https from "node:https";
import { createSecureServer } from "@currentspace/http3";

// HTTP/1 connection-specific headers cannot be forwarded over HTTP/2 or HTTP/3.
function endToEndHeaders(headers) {
  const excluded = new Set([
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    ...String(headers.connection || "")
      .toLowerCase()
      .split(",")
      .map((x) => x.trim()),
  ]);
  return Object.fromEntries(
    Object.entries(headers).filter(
      ([name, value]) =>
        !name.startsWith(":") &&
        !excluded.has(name.toLowerCase()) &&
        value !== undefined,
    ),
  );
}

// Use a real HTTP request boundary so Express/Connect and webpack middleware
// keep their native IncomingMessage/ServerResponse objects and security checks.
// The only destination is the existing, certificate-verified loopback server.
export async function startCompanion({
  key,
  cert,
  ca,
  upstreamPort,
  port = 0,
  runtimeMode = "portable",
}) {
  const agent = new https.Agent({ keepAlive: true, maxSockets: 64 });
  const requests = new Set();
  const server = createSecureServer({ key, cert, runtimeMode });
  let closing;

  server.on("stream", (stream, headers, flags) => {
    if (headers[":method"] === "CONNECT") {
      stream.respond({ ":status": "405" });
      stream.end();
      return;
    }
    const forwarded = endToEndHeaders(headers);
    forwarded.host = headers[":authority"];
    let response;
    const request = https.request(
      {
        hostname: "127.0.0.1",
        port: upstreamPort,
        servername: "localhost",
        ca: ca || cert,
        rejectUnauthorized: true,
        method: headers[":method"],
        path: headers[":path"],
        headers: forwarded,
        agent,
      },
      (incoming) => {
        response = incoming;
        if (stream.destroyed) {
          incoming.destroy();
          return;
        }
        stream.respond({
          ":status": String(incoming.statusCode),
          ...endToEndHeaders(incoming.headers),
        });
        // node:https preserves compressed bytes; fetch() would decompress them.
        incoming.on("error", () => stream.close(0x0102));
        incoming.pipe(stream);
      },
    );
    requests.add(request);
    request.once("close", () => requests.delete(request));
    request.on("error", () => {
      if (stream.destroyed) return;
      if (!response) {
        stream.respond({ ":status": "502" });
        stream.end("Development server unavailable");
      } else {
        stream.close(0x0102);
      }
    });
    stream.on("error", () => request.destroy());
    stream.once("close", () => {
      request.destroy();
      response?.destroy();
    });
    if (flags.endStream) request.end();
    else stream.pipe(request);
  });

  const close = () =>
    (closing ||= (async () => {
      for (const request of requests) request.destroy();
      agent.destroy();
      await server.close();
    })());
  try {
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.once("listening", () => {
        server.off("error", reject);
        resolve();
      });
      server.listen(port, "127.0.0.1");
    });
  } catch (error) {
    await close();
    throw error;
  }
  server.on("error", (error) => {
    console.error("HTTP/3 companion stopped:", error);
    close().catch((closeError) =>
      console.error("HTTP/3 shutdown failed:", closeError),
    );
  });
  return { server, port: server.address().port, close };
}
