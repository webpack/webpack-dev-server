// cspell:words keyout Acreateserial extfile
import { execFileSync } from "node:child_process";
import { createHash, X509Certificate } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  copyFile,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import https from "node:https";

export async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), "webpack-http3-"));
  const app = path.join(root, "app");
  await mkdir(app);
  const openssl = (...args) =>
    execFileSync("openssl", args, { cwd: root, stdio: "ignore" });
  openssl(
    "req",
    "-x509",
    "-newkey",
    "rsa:2048",
    "-nodes",
    "-keyout",
    "ca.key",
    "-out",
    "ca.pem",
    "-days",
    "1",
    "-subj",
    "/CN=webpack HTTP3 test CA",
  );
  openssl(
    "req",
    "-newkey",
    "rsa:2048",
    "-nodes",
    "-keyout",
    "server.key",
    "-out",
    "server.csr",
    "-subj",
    "/CN=localhost",
  );
  await writeFile(
    path.join(root, "extensions"),
    "subjectAltName=DNS:localhost,IP:127.0.0.1\nbasicConstraints=CA:FALSE\nkeyUsage=digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\n",
  );
  openssl(
    "x509",
    "-req",
    "-in",
    "server.csr",
    "-CA",
    "ca.pem",
    "-CAkey",
    "ca.key",
    "-CAcreateserial",
    "-out",
    "server.pem",
    "-days",
    "1",
    "-extfile",
    "extensions",
  );
  for (const name of ["app.js", "message.js", "index.html"]) {
    await copyFile(
      new URL(`../${name}`, import.meta.url),
      path.join(app, name),
    );
  }
  const tls = {
    key: await readFile(path.join(root, "server.key")),
    cert: await readFile(path.join(root, "server.pem")),
    ca: await readFile(path.join(root, "ca.pem")),
  };
  const spki = createHash("sha256")
    .update(
      new X509Certificate(tls.cert).publicKey.export({
        type: "spki",
        format: "der",
      }),
    )
    .digest("base64");
  return {
    root,
    app,
    tls,
    spki,
    config: {
      mode: "development",
      context: app,
      entry: "./app.js",
      devtool: false,
      output: {
        path: path.join(root, "dist"),
        filename: "main.js",
        publicPath: "/",
      },
      infrastructureLogging: { level: "error" },
      watchOptions: { aggregateTimeout: 20 },
    },
    cleanup: () => rm(root, { recursive: true, force: true }),
  };
}

export function http1(port, ca, pathname = "/") {
  return new Promise((resolve, reject) => {
    const request = https.get(
      {
        hostname: "127.0.0.1",
        servername: "localhost",
        port,
        path: pathname,
        ca,
        rejectUnauthorized: true,
        agent: false,
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.once("end", () =>
          resolve({
            headers: response.headers,
            status: response.statusCode,
            body: Buffer.concat(chunks),
            protocol: response.httpVersion,
          }),
        );
        response.once("error", reject);
      },
    );
    request.setTimeout(5000, () =>
      request.destroy(new Error("HTTP/1 request timed out")),
    );
    request.once("error", reject);
  });
}

export async function collect(stream, body) {
  return await new Promise((resolve, reject) => {
    let headers;
    const chunks = [];
    const timer = setTimeout(
      () => stream.destroy(new Error("Request timed out")),
      5000,
    );
    stream.once("response", (value) => {
      headers = value;
    });
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    stream.once("end", () => {
      clearTimeout(timer);
      resolve({ headers, body: Buffer.concat(chunks) });
    });
    stream.end(body);
  });
}
