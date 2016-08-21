# webpack-dev-server

**THIS SERVER SHOULD BE USED FOR DEVELOPMENT ONLY!**

**DO NOT USE IT IN PRODUCTION!**

It's a live reloading server for [webpack](http://webpack.github.io).

# [Documentation](http://webpack.github.io/docs/webpack-dev-server.html)

## Inspiration

This project is heavily inspired by [peerigon/nof5](https://github.com/peerigon/nof5).

## Contributing

The client scripts are built with `npm run-script prepublish`.

When making a PR, keep these goals in mind:

- The communication library (Sock.js) should not be exposed to the user.
- A user should not try to implement stuff that accesses the webpack filesystem, because this lead to bugs (the middleware does it while blocking requests until the compilation has finished, the blocking is important).
- It should be a development only tool (compiling in production is bad, one should precompile and deliver the compiled assets).
- There are hooks to add your own features, so we should not add less-common features.
- Processing options and stats display is delegated to webpack, so webpack-dev-server/middleware should not do much with it. This also helps us to keep up-to-date with webpack updates.
- The workflow should be to start webpack-dev-server as a separate process, next to the "normal" server and to request the script from this server or to proxy from dev-server to "normal" server (because webpack blocks the event queue too much while compiling which can affect "normal" server).

## License

Copyright 2012-2016 Tobias Koppers

[MIT](http://www.opensource.org/licenses/mit-license.php)
