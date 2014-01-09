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

## Usage (javascript)

``` javascript
var Server = require("webpack-dev-server");
var options = {
	content: absoluteFilenameToContentHtmlPage,
	// Content page to display
	// it will default to a simple page

	contentUrl: "http://...",
	// if set it will load this URL as content page
	// it will default to undefined

	// webpack-dev-middleware options
	// you can use all options of the middleware
};
new Server(webpack(/*...*/), options).listen(port[, host]);
```

## Contributing

The client scripts are build with `npm run-script prepublish`.

## Lisence

Copyright 2012-2013 Tobias Koppers

[MIT](http://www.opensource.org/licenses/mit-license.php)
