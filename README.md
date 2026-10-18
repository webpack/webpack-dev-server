<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200" src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
</div>

[![npm][npm]][npm-url]
[![node][node]][node-url]
[![tests][tests]][tests-url]
[![coverage][cover]][cover-url]
[![discussion][discussion]][discussion-url]
[![downloads][downloads]][npm-url]
[![contributors][contributors]][contributors-url]

# webpack-dev-server

Use [webpack](https://webpack.js.org) with a development server that provides
live reloading. This should be used for **development only**.

It uses [webpack-dev-middleware][middleware-url] under the hood, which provides
fast in-memory access to the webpack assets.

## Table of Contents

- [Getting Started](#getting-started)
- [Usage](#usage)
  - [With the CLI](#with-the-cli)
  - [With NPM Scripts](#with-npm-scripts)
  - [With the API](#with-the-api)
  - [With TypeScript](#with-typescript)
  - [The Result](#the-result)
- [Security](#security)
  - [allowedOrigins](#allowedorigins)
  - [static.deny](#staticdeny)
- [Browser Support](#browser-support)
- [Support](#support)
- [Contributing](#contributing)
- [Attribution](#attribution)
- [License](#license)

## Getting Started

First things first, install the module:

```console
npm install webpack-dev-server --save-dev
```

or

```console
yarn add -D webpack-dev-server
```

or

```console
pnpm add -D webpack-dev-server
```

_Note: While you can install and run webpack-dev-server globally, we recommend
installing it locally. webpack-dev-server will always use a local installation
over a global one._

## Usage

There are two main, recommended methods of using the module:

### With the CLI

The easiest way to use it is with the [webpack CLI](https://webpack.js.org/api/cli/). In the directory where your
`webpack.config.js` is, run:

```console
npx webpack serve
```

Following options are available with `webpack serve`:

```
Usage: webpack serve|server|s [entries...] [options]

Run the webpack dev server.

Options:
  -c, --config <value...>                             Provide path to a webpack configuration file e.g. ./webpack.config.js.
  --config-name <value...>                            Name of the configuration to use.
  -m, --merge                                         Merge two or more configurations using 'webpack-merge'.
  --disable-interpret                                 Disable interpret for loading the config file.
  --env <value...>                                    Environment passed to the configuration when it is a function.
  --node-env <value>                                  Sets process.env.NODE_ENV to the specified value.
  --define-process-env-node-env <value>               Sets process.env.NODE_ENV to the specified value. (Currently an alias for `--node-env`)
  --analyze                                           It invokes webpack-bundle-analyzer plugin to get bundle information.
  --progress [value]                                  Print compilation progress during build.
  -j, --json [value]                                  Prints result as JSON or store it in a file.
  --fail-on-warnings                                  Stop webpack-cli process with non-zero exit code on warnings from webpack
  -d, --devtool <value>                               A developer tool to enhance debugging (false | eval | [inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map).
  --no-devtool                                        Negative 'devtool' option.
  --entry <value...>                                  A module that is loaded upon startup. Only the last one is exported.
  --mode <value>                                      Enable production optimizations or development hints.
  --name <value>                                      Name of the configuration. Used when loading multiple configurations.
  -o, --output-path <value>                           The output directory as **absolute path** (required).
  --stats [value]                                     Stats options object or preset name.
  --no-stats                                          Negative 'stats' option.
  -t, --target <value...>                             Specific environment, runtime, or syntax. Environment to build for. An array of environments to build for all of them when possible.
  --no-target                                         Negative 'target' option.
  --watch-options-stdin                               Stop watching when stdin stream has ended.
  --no-watch-options-stdin                            Negative 'watch-options-stdin' option.
  --allowed-hosts <value...>                          Allows to enumerate the hosts from which access to the dev server are allowed (useful when you are proxying dev server, by default is 'auto').
  --allowed-hosts-reset                               Clear all items provided in 'allowedHosts' configuration. Allows to enumerate the hosts from which access to the dev server are allowed (useful when you are proxying dev server, by default is 'auto').
  --allowed-origins <value...>                        Which origins may use the dev server: its HTTP endpoints, the hot module replacement connection and proxied WebSockets. 'auto' (the default) keeps the rules derived from 'allowedHosts'. A list of HTTP(S) origins allows those plus the page's own hostname, on any port, independently of 'allowedHosts'. 'all' allows every origin without turning off the 'Host' check.
  --allowed-origins-reset                             Clear all items provided in 'allowedOrigins' configuration. Which origins may use the dev server: its HTTP endpoints, the hot module replacement connection and proxied WebSockets. 'auto' (the default) keeps the rules derived from 'allowedHosts'. A list of HTTP(S) origins allows those plus the page's own hostname, on any port, independently of 'allowedHosts'. 'all' allows every origin without turning off the 'Host' check.
  --bonjour                                           Allows to broadcasts dev server via ZeroConf networking on start.
  --no-bonjour                                        Disallows to broadcasts dev server via ZeroConf networking on start.
  --no-client                                         Disables client script.
  --client-logging <value>                            Allows to set log level in the browser.
  --client-overlay                                    Enables a full-screen overlay in the browser when there are compiler errors or warnings.
  --no-client-overlay                                 Disables the full-screen overlay in the browser when there are compiler errors or warnings.
  --client-overlay-errors                             Enables a full-screen overlay in the browser when there are compiler errors.
  --no-client-overlay-errors                          Disables the full-screen overlay in the browser when there are compiler errors.
  --client-overlay-warnings                           Enables a full-screen overlay in the browser when there are compiler warnings.
  --no-client-overlay-warnings                        Disables the full-screen overlay in the browser when there are compiler warnings.
  --client-overlay-runtime-errors                     Enables a full-screen overlay in the browser when there are uncaught runtime errors.
  --no-client-overlay-runtime-errors                  Disables the full-screen overlay in the browser when there are uncaught runtime errors.
  --client-overlay-trusted-types-policy-name <value>  The name of a Trusted Types policy for the overlay. Defaults to 'webpack-dev-server#overlay'.
  --client-progress                                   Prints compilation progress in percentage in the browser.
  --no-client-progress                                Does not print compilation progress in percentage in the browser.
  --client-reconnect [value]                          Tells dev-server the number of times it should try to reconnect the client.
  --no-client-reconnect                               Tells dev-server to not to try to reconnect the client.
  --client-web-socket-transport <value>               Allows to set custom web socket transport to communicate with dev server.
  --client-web-socket-url <value>                     Allows to specify URL to web socket server (useful when you're proxying dev server and client script does not always know where to connect to).
  --client-web-socket-url-hostname <value>            Tells clients connected to devServer to use the provided hostname.
  --client-web-socket-url-pathname <value>            Tells clients connected to devServer to use the provided path to connect.
  --client-web-socket-url-password <value>            Tells clients connected to devServer to use the provided password to authenticate.
  --client-web-socket-url-port <value>                Tells clients connected to devServer to use the provided port.
  --client-web-socket-url-protocol <value>            Tells clients connected to devServer to use the provided protocol.
  --client-web-socket-url-username <value>            Tells clients connected to devServer to use the provided username to authenticate.
  --compress                                          Enables gzip compression for everything served.
  --no-compress                                       Disables gzip compression for everything served.
  --history-api-fallback                              Allows to proxy requests through a specified index page (by default 'index.html'), useful for Single Page Applications that utilise the HTML5 History API.
  --no-history-api-fallback                           Disallows to proxy requests through a specified index page.
  --host <value>                                      Allows to specify a hostname to use.
  --hot [value]                                       Enables Hot Module Replacement.
  --no-hot                                            Disables Hot Module Replacement.
  --ipc [value]                                       Listen to a unix socket.
  --live-reload                                       Enables reload/refresh the page(s) when file changes are detected (enabled by default).
  --no-live-reload                                    Disables reload/refresh the page(s) when file changes are detected (enabled by default).
  --open [value...]                                   Allows to configure dev server to open the browser(s) and page(s) after server had been started (set it to true to open your default browser).
  --no-open                                           Does not open the default browser.
  --open-target <value...>                            Opens specified page in browser.
  --open-app-name <value...>                          Open specified browser.
  --open-reset                                        Clear all items provided in 'open' configuration. Allows to configure dev server to open the browser(s) and page(s) after server had been started (set it to true to open your default browser).
  --open-target-reset                                 Clear all items provided in 'open.target' configuration. Opens specified page in browser.
  --open-app-name-reset                               Clear all items provided in 'open.app.name' configuration. Open specified browser.
  --port <value>                                      Allows to specify a port to use.
  --server-type <value>                               Allows to set server and options (by default 'http').
  --server-options-passphrase <value>                 Passphrase for a pfx file.
  --server-options-request-cert                       Request for an SSL certificate.
  --no-server-options-request-cert                    Does not request for an SSL certificate.
  --server-options-ca <value...>                      Path to an SSL CA certificate or content of an SSL CA certificate.
  --server-options-ca-reset                           Clear all items provided in 'server.options.ca' configuration. Path to an SSL CA certificate or content of an SSL CA certificate.
  --server-options-cert <value...>                    Path to an SSL certificate or content of an SSL certificate.
  --server-options-cert-reset                         Clear all items provided in 'server.options.cert' configuration. Path to an SSL certificate or content of an SSL certificate.
  --server-options-crl <value...>                     Path to PEM formatted CRLs (Certificate Revocation Lists) or content of PEM formatted CRLs (Certificate Revocation Lists).
  --server-options-crl-reset                          Clear all items provided in 'server.options.crl' configuration. Path to PEM formatted CRLs (Certificate Revocation Lists) or content of PEM formatted CRLs (Certificate Revocation Lists).
  --server-options-key <value...>                     Path to an SSL key or content of an SSL key.
  --server-options-key-reset                          Clear all items provided in 'server.options.key' configuration. Path to an SSL key or content of an SSL key.
  --server-options-pfx <value...>                     Path to an SSL pfx file or content of an SSL pfx file.
  --server-options-pfx-reset                          Clear all items provided in 'server.options.pfx' configuration. Path to an SSL pfx file or content of an SSL pfx file.
  --static [value...]                                 Allows to configure options for serving static files from directory (by default 'public' directory).
  --no-static                                         Disallows to configure options for serving static files from directory.
  --static-directory <value...>                       Directory for static contents.
  --static-public-path <value...>                     The static files will be available in the browser under this public path.
  --static-serve-index                                Tells dev server to use serveIndex middleware when enabled.
  --no-static-serve-index                             Does not tell dev server to use serveIndex middleware.
  --static-watch                                      Watches for files in static content directory.
  --no-static-watch                                   Does not watch for files in static content directory.
  --static-deny [value...]                            Files never to serve from the static content directory, matched against each segment of the path: 'true' for the default list of secrets ('.env', '.env.*', keys and certificates, '.npmrc', '.yarnrc.yml', '.git'), or patterns of your own, with '*', '?' and '{a,b}'.
  --no-static-deny                                    Serves every file in the static content directory.
  --static-reset                                      Clear all items provided in 'static' configuration. Allows to configure options for serving static files from directory (by default 'public' directory).
  --static-public-path-reset                          Clear all items provided in 'static.publicPath' configuration. The static files will be available in the browser under this public path.
  --static-deny-reset                                 Clear all items provided in 'static.deny' configuration. Files never to serve from the static content directory, matched against each segment of the path: 'true' for the default list of secrets ('.env', '.env.*', keys and certificates, '.npmrc', '.yarnrc.yml', '.git'), or patterns of your own, with '*', '?' and '{a,b}'.
  --watch-files <value...>                            Allows to configure list of globs/directories/files to watch for file changes.
  --watch-files-reset                                 Clear all items provided in 'watchFiles' configuration. Allows to configure list of globs/directories/files to watch for file changes.
  --no-web-socket-server                              Disallows to set web socket server and options.
  --web-socket-server-type <value>                    Allows to set web socket server and options (by default 'ws').

Global options:
  --color                                             Enable colors on console.
  --no-color                                          Disable colors on console.
  -v, --version                                       Output the version number of 'webpack', 'webpack-cli' and 'webpack-dev-server' and commands.
  -h, --help [verbose]                                Display help for commands and options.

To see list of all supported commands and options run 'webpack --help=verbose'.

Webpack documentation: https://webpack.js.org/.
CLI documentation: https://webpack.js.org/api/cli/.
Made with ♥ by the webpack team.
```

> [!NOTE]
>
> _Detailed documentation for above options is available on this [link](https://webpack.js.org/configuration/dev-server/)._

### With NPM Scripts

NPM package.json scripts are a convenient and useful means to run locally installed
binaries without having to be concerned about their full paths. Simply define a
script as such:

```json
{
  "scripts": {
    "serve": "webpack serve"
  }
}
```

And run the following in your terminal/console:

```console
npm run serve
```

NPM will automatically refer to the the binary in `node_modules` for you, and
execute the file or command.

### With the API

While it's recommended to run webpack-dev-server via the CLI, you may also choose to start a server via the API.

See the related [API documentation for `webpack-dev-server`](https://webpack.js.org/api/webpack-dev-server/).

### With TypeScript

If you use TypeScript in the webpack config, you'll need to properly type `devServer` property in order to avoid TS errors (e.g. `'devServer' does not exist in type 'Configuration'`). For that use either:

```ts
/// <reference path="node_modules/webpack-dev-server/types/lib/Server.d.ts"/>
import { type Configuration } from "webpack";

// Your logic
```

Or you can import the type from `webpack-dev-server`, i.e.

```ts
import { type Configuration } from "webpack";
import { type Configuration as DevServerConfiguration } from "webpack-dev-server";

const devServer: DevServerConfiguration = {};
const config: Configuration = { devServer };

// module.exports
export default config;
```

### The Result

Either method will start a server instance and begin listening for connections
from `localhost` on port `8080`.

webpack-dev-server is configured by default to support live-reload of files as
you edit your assets while the server is running.

See [**the documentation**][docs-url] for more use cases and options.

## Security

The dev server is for development and is not meant to be reachable by anyone but
you. It checks two different things, with two options:

- **`allowedHosts`** checks the `Host` header, so a website cannot reach the server
  through a DNS name it points at your machine (DNS rebinding).
- **`allowedOrigins`** checks which pages may use the server — read its bundles,
  connect for hot module replacement, open proxied WebSockets, and call its
  internal endpoints — so a website you have open cannot read your source.

### allowedOrigins

Type: `"auto" | "all" | string | string[]`
Default: `"auto"`

- `"auto"` keeps the rules this server has always applied: the page's own
  hostname, on any port, with `localhost`, `127.0.0.1` and `[::1]` counted as one;
  `file:` and browser-extension pages; and whatever `allowedHosts` allows. With
  `"auto"`, `allowedHosts: "all"` and an `Access-Control-Allow-Origin: *` entry in
  `headers` still open the server to every origin — both are **deprecated** and
  will stop doing so in the next major release, so set `allowedOrigins` instead.
- A list of HTTP(S) origins allows those, plus the page's own hostname — on any
  port, with `localhost`, `127.0.0.1` and `[::1]` counted as one, as with `"auto"`
  — and `file:` and browser-extension pages, whatever `allowedHosts` says. A
  listed origin's scheme, hostname and port must match. An empty list allows only
  the page's own hostname, so another page on `localhost`, on any port, can still
  use a server on `localhost`.
- `"all"` allows every origin. It does not turn off the `Host` check.

```js
module.exports = {
  devServer: {
    // a tunnel or a container: stop checking `Host`...
    allowedHosts: "all",
    // ...and still allow only your frontend to use the server
    allowedOrigins: ["https://app.example.com"],
  },
};
```

With a list, a listed origin's requests are answered with
`Access-Control-Allow-Origin`, and a plain `<script>` or `<img>` it loads (one
without `crossorigin`) is allowed by the page's `Referer`. Other origins are
refused with `403`. A page with `Referrer-Policy: no-referrer` has to load the
bundle with `crossorigin` (and `output.crossOriginLoading: "anonymous"`) instead.
See the [allowed origins example](examples/allowed-origins/README.md).

With a webpack-dev-middleware that supports it, the injected client is also
handed a token that is new on every run. A hot client that carries it may
connect from an origin the server does not know, such as a proxy's, as long as
its `Host` is allowed. With an older one there is no token, so list the proxy's
origin in `allowedOrigins` for hot module replacement to connect through it.

### static.deny

Type: `boolean | string[]`
Default: `false`

Files never to serve from a [`static`](https://webpack.js.org/configuration/dev-server/#devserverstatic)
directory, matched against each segment of the request path, case-insensitively.
`true` refuses `.env`, `.env.*`, keys and certificates (`*.{crt,pem,key,p12,pfx,cer,der}`),
`.npmrc`, `.yarnrc.yml` and `.git` with `403`, and leaves them out of directory
listings; a list of patterns (with `*`, `?` and `{a,b}`) refuses those instead.
It will be `true` by default in the next major release.

```js
module.exports = {
  devServer: {
    static: { directory: "public", deny: true },
  },
};
```

## Browser Support

The browser runtime is [webpack-dev-middleware]'s, which ships as ES5 and uses
no built-in newer than ES5 beyond `Promise`, the transport in use and what hot
module replacement itself needs. As before, the project only officially
supports the _last two versions of major browsers_. We simply don't have the
resources to support every whacky browser out there.

[webpack-dev-middleware]: https://github.com/webpack/webpack-dev-middleware#client-options

If you find a bug with an obscure / old browser, we would actively welcome a
Pull Request to resolve the bug.

## Support

We do our best to keep issues in the repository focused on bugs, features, and
needed modifications to the code for the module. Because of that, we ask users
with general support, "how-to", or "why isn't this working" questions to try one
of the other support channels that are available.

Your first-stop-shop for support for webpack-dev-server should be the excellent
[documentation][docs-url] for the module. If you see an opportunity for improvement
of those docs, please head over to the [webpack.js.org repo][wjo-url] and open a
pull request.

From there, we encourage users to visit the [webpack discussions][discussion-url] and
talk to the fine folks there. If your quest for answers comes up dry in chat,
head over to [StackOverflow][stack-url] and do a quick search or open a new
question. Remember; It's always much easier to answer questions that include your
`webpack.config.js` and relevant files!

If you're twitter-savvy you can tweet [#webpack][hash-url] with your question
and someone should be able to reach out and lend a hand.

If you have discovered a :bug:, have a feature suggestion, or would like to see
a modification, please feel free to create an issue on Github. _Note: The issue
template isn't optional, so please be sure not to remove it, and please fill it
out completely._

## Contributing

We welcome your contributions! Please have a read of [CONTRIBUTING.md](CONTRIBUTING.md) for more information on how to get involved.

## Attribution

This project is heavily inspired by [peerigon/nof5](https://github.com/peerigon/nof5).

## License

#### [MIT](./LICENSE)

[npm]: https://img.shields.io/npm/v/webpack-dev-server.svg
[npm-url]: https://npmjs.com/package/webpack-dev-server
[node]: https://img.shields.io/node/v/webpack-dev-server.svg
[node-url]: https://nodejs.org
[tests]: https://github.com/webpack/webpack-dev-server/workflows/webpack-dev-server/badge.svg
[tests-url]: https://github.com/webpack/webpack-dev-server/actions?query=workflow%3Awebpack-dev-server
[cover]: https://codecov.io/gh/webpack/webpack-dev-server/graph/badge.svg
[cover-url]: https://codecov.io/gh/webpack/webpack-dev-server
[discussion]: https://img.shields.io/github/discussions/webpack/webpack
[discussion-url]: https://github.com/webpack/webpack/discussions
[docs-url]: https://webpack.js.org/configuration/dev-server/#devserver
[hash-url]: https://twitter.com/search?q=webpack
[middleware-url]: https://github.com/webpack/webpack-dev-middleware
[stack-url]: https://stackoverflow.com/questions/tagged/webpack-dev-server
[uglify-url]: https://github.com/webpack-contrib/uglifyjs-webpack-plugin
[wjo-url]: https://github.com/webpack/webpack.js.org
[downloads]: https://img.shields.io/npm/dm/webpack-dev-server.svg
[contributors-url]: https://github.com/webpack/webpack-dev-server/graphs/contributors
[contributors]: https://img.shields.io/github/contributors/webpack/webpack-dev-server.svg
