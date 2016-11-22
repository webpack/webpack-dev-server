# example

``` text
webpack-dev-server
http://localhost:8080/webpack-dev-server/bundle
```

The app should display "It's working" with a dotted background.

There is no file named `bundle` in this directory. The dev server creates a simple html that executes a javascript file: `bundle.js` (`<path>.js`)

``` text
webpack-dev-server
http://localhost:8080/webpack-dev-server/index.html
```

The app should display "It's working" with a dotted background and a SVG image.

There is a file named `index.html` in this directory. This file is served as content


``` text
webpack-dev-server --config alternative.config.js
http://localhost:8080/webpack-dev-server/bundle
http://localhost:8080/webpack-dev-server/index.html
```

The app should be minimized and the image is included with a Data Url.

## Inlined mode

``` text
webpack-dev-server --inline
http://localhost:8080/index.html
```

The app without a webpack-dev-server frame. Console displays status messages.

The webpack-dev-server client is added to the entry point.


``` text
webpack-dev-server
http://localhost:8080/inlined.html
```

The app without a webpack-dev-server frame. Console displays status messages.

The webpack-dev-server client is added as script tag to the html page.

## Reloading

Try to update app.js, by uncommenting some lines.

The browser should reflect your changes.

You may also update the css file or any other file used by the app.

## History API Fallback

``` text
webpack-dev-server --inline --history-api-fallback --output-public-path /
http://localhost:8080/some/url/from/spa
```

The contents of /index.html is served.

## Watching `devServer.contentBase`

``` text
webpack-dev-server --inline --content-base assets --watch-content-base
http://localhost:8080/
```

Try to update `assets/index.html`.

The browser should reflect your changes.
