# webpack-dev-server

**THIS SERVER SHOULD ONLY USED FOR DEVELOPMENT!**

**DO NOT USE IT IN PRODUCTION!**

## What is it?

It's a little server using [webpack-dev-middleware](/webpack/webpack-dev-middleware) to serve a webpack app.

It also uses socket.io to update the browser if the bundle has changed (and to display compilation errors).

You need to pass webpack's options, and you can also pass a html page to display and webpack options.

## Inspiration

This project is heavily inspirated by [peerigon/nof5](/peerigon/nof5).

## Usage (command line)

Like webpack, but you omit the output filename.

Additional options:

`--port <number>` Change the port (default: 8080)

`--content-base` Serve HTML content from this directory or URL (default: current directory)

`--noinfo` Less console output

`--quiet` No console output

**Reverse Proxy:**
If you want to use the reverse proxy, please provide both parameters `--proxy-from` and `--proxy-target`

`--proxy-from relativePath` From where the content should be forwarded. Ex. /api/

`--proxy-to target` Full URL for the target of the proxy. Ex. http://localhost:3000

## Usage (javascript)

``` javascript
var Server = require("webpack-dev-server");
var options = {
	contentBase: __dirname + "/directory",
	// A directory, file or URL
	// It will be served as content

	hot: true,
	// Enable special support for Hot Module Replacement
	// Page is no longer updated, but a "webpackHotUpdate" message is send to the content

	// ...
	// webpack-dev-middleware options
	// you can use all options of the middleware
};
new Server(webpack(/*... webpack options ...*/), options).listen(port[, host]);
```

## Contributing

The client scripts are build with `npm run-script prepublish`.

## Lisence

Copyright 2012-2013 Tobias Koppers

[MIT](http://www.opensource.org/licenses/mit-license.php)
