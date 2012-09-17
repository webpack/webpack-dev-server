# webpack-dev-server

**THIS SERVER SHOULD ONLY USED FOR DEVELOPMENT!**

**DO NOT USE IT IN PRODUCTION!**

## What is it?

It's a little server using [webpack-dev-middleware](/webpack/webpack-dev-middleware) to serve a webpack app.

It also uses socket.io to update the browser if the bundle has changed (and to display compilation errors).

You need to pass a web app entry point, and you can also pass a html page to display and webpack options.

## Inspiration

This project is heavily inspirated by [peerigon/nof5](/peerigon/nof5).

## Usage (command line)

``` text
webpack-dev-server <webpack entry point>

Options:
  --content-page  A html page to load  [string]
  --options       webpack options      [string]
```

## Usage (javascript)

``` javascript
var Server = require("webpack-dev-server");
var options = {
	content: absoluteFilenameToContentHtmlPage, // it will default to a simple page
	webpack: {
		// webpack options
		// ...
		watch: true // recommended

		/* defaults:
		output: "bundle.js",
		debug: true,
		filenames: true,
		watch: true
		*/
	}
};
new Server(entryPoint, options).listen(port[, host]);
```

entryPoint should be an absolute path. It may be prefixed with loaders.

## Contributing

The client scripts are build with `npm run-script postinstall`.

## Lisence

Copyright 2012 Tobias Koppers

[MIT](http://www.opensource.org/licenses/mit-license.php)