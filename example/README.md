# example

``` text
webpack-dev-server --colors
http://localhost:8080/webpack-dev-server/bundle
```

The app should display "It's working" with a dotted background.

There is no file named `bundle` in this directory. The dev server creates a simple html that executes a javascript file: `bundle.js` (`<path>.js`)

``` text
webpack-dev-server --colors
http://localhost:8080/webpack-dev-server/index.html
```

The app should display "It's working" with a green background.

There is a file named `index.html` in this directory. This file is served as content


``` text
webpack-dev-server --colors --config alternative.config.js
http://localhost:8080/webpack-dev-server/bundle
http://localhost:8080/webpack-dev-server/index.html
```

The app should be minimized and the image is included with a Data Url.

## Inlined mode

``` text
webpack-dev-server --colors --config inlined.config.js
http://localhost:8080/index.html
```

The app without a webpack-dev-server frame. Console displays status messages.

The webpack-dev-server client is added to the entry point.


``` text
webpack-dev-server --colors
http://localhost:8080/inlined.html
```

The app without a webpack-dev-server frame. Console displays status messages.

The webpack-dev-server client is added as script tag to the html page.




## Reloading

Try to update app.js, by uncommenting some lines.

The browser should reflect your changes.

You may also update the css file or any other file used by the app.
