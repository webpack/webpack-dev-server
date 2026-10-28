<!-- cspell:words currentspace backpressure QUIC SPKI noout pkey pubin outform dgst -->

# Optional HTTP/3 companion

This standalone example adds HTTP/3 asset requests to webpack-dev-server using
[`@currentspace/http3`](https://github.com/currentspace/http3). The normal server
continues to handle HTTP/2, HTTP/1.1, middleware and WebSocket hot updates.
The example installs its dependencies separately; it does not add HTTP/3 to
webpack-dev-server's defaults or change the package's Node requirement.

This is a protocol-development example, not a performance optimization. HTTP/3
requests make an additional local HTTPS request through webpack's middleware.

## Run

Use Node 24 or later. From this directory:

```sh
npm ci --ignore-scripts
HTTP3_KEY=/path/outside/the/example/localhost-key.pem \
HTTP3_CERT=/path/outside/the/example/localhost.pem \
HTTP3_CA=/path/outside/the/example/local-ca.pem \
npm start
```

Use a certificate valid for `localhost` and `127.0.0.1`, signed by the supplied
CA. Keep private keys outside the example directory, which is served as static
content. The proxy verifies the upstream server certificate; it never sets
`rejectUnauthorized: false`.

Open the printed `https://localhost:8443` URL. `PORT` changes this primary TCP
port. A second, automatically assigned port is printed for the HTTP/3 companion.
The companion binds both UDP and TCP on that port, as required by the library's
HTTP/3 and HTTP/2 listener. Both servers bind only to IPv4 loopback.

The primary server advertises the companion with an `Alt-Svc` header. The URL
and origin remain those of the primary server when the browser selects HTTP/3.
HTTP/3 requests are forwarded to a fixed loopback destination with their original
Host header, so webpack's middleware and host validation still run. Request and
response streams use Node backpressure; compressed response bytes and repeated
Set-Cookie headers are preserved. Redirects are returned without being followed.

Edit `message.js`. Its text should update without a page reload. WebSocket HMR
uses the primary TLS/TCP listener; hot-update assets may use HTTP/3. Stopping
the example closes the companion, proxy connections and webpack watcher.

## Local browser certificates

An HTTPS page loading successfully does **not** establish that it used HTTP/3.
Check the Network panel's Protocol column for `h3`; `h2` is the working fallback.
Chromium applies additional restrictions to QUIC certificates issued by a local
CA. See [Chromium's QUIC guide](https://www.chromium.org/quic/playing-with-quic/).

For an isolated Chromium test, compute the leaf certificate's public-key pin:

```sh
SPKI=$(openssl x509 -in "$HTTP3_CERT" -pubkey -noout |
  openssl pkey -pubin -outform DER |
  openssl dgst -sha256 -binary | openssl base64 -A)
```

Launch Chromium with a dedicated profile and the printed companion port:

```sh
chromium --user-data-dir="$PWD/.http3-chromium-profile" \
  --enable-quic \
  --host-resolver-rules="MAP localhost 127.0.0.1" \
  --ignore-certificate-errors-spki-list="$SPKI" \
  --origin-to-force-quic-on="localhost:COMPANION_PORT" \
  https://localhost:8443
```

Set the shell's `HTTP3_CERT` variable before computing the pin. Replace
`COMPANION_PORT` with the printed UDP port and `chromium` with your browser's
executable. These flags are for the isolated test profile: the certificate pin
permits this test certificate, and the QUIC-origin flag permits its local root
for that hostname. The primary origin is not forced to use QUIC, so it can
discover the alternative and fall back to HTTP/2. No OS trust settings are
changed by this example or its tests.

## Validation

The protocol tests require OpenSSL. Browser tests additionally require
Playwright's Chromium:

```sh
npm test
npx playwright install chromium
npm run test:browser
```

Tests generate temporary certificates and applications, then remove them. They
exercise native and WASM HTTP/3, HTTP/2 and HTTP/1.1 fallback, generated assets,
binary uploads, compression, cookies, HEAD, redirects, host rejection, TLS
verification failure, cancelled streams, startup rollback and TCP/UDP port
reuse. The browser test checks actual `h3` responses, WSS hot updates without a
document reload, and HTTP/2 fallback after the companion stops.

The 25-request loopback timing sample printed by the protocol tests is diagnostic
only. It compares direct HTTP/2 with HTTP/3 plus the loopback proxy, and is not
evidence of a general HTTP/3 performance improvement.

## Scope

- The example is pinned to webpack-dev-server 6.1.0 and http3 0.9.3.
- Node 24+ is required by the optional HTTP/3 library. Its root package is about
  46.8 MB compressed and 151.9 MB unpacked because it bundles native binaries.
- Native prebuilds cover macOS ARM64 and glibc Linux ARM64/x64. Set
  `HTTP3_RUNTIME=wasm` to exercise the Node WASM server. This example has been
  tested on macOS ARM64; Windows and other platforms are not qualified here.
- HTTP/3 WebSockets, WebTransport, CONNECT tunnels, trailers, dynamic SNI
  certificates and LAN/public deployment are outside this example's scope.
- Chromium's isolated test configuration is not a promise that ordinary
  Chromium, Firefox or Safari profiles will select HTTP/3 with a local CA.
- There is no change to webpack-dev-server core, its package dependencies or
  its existing HTTPS configuration.
