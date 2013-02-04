# example

Try one of these commands and open `http://localhost:8080`.

``` text
webpack-dev-server ./app.js --colors
```

The app should display "It's working" with a dotted background.

``` text
webpack-dev-server ./app.js --colors --content-page index.html
```

The app should display "It's working" with a green background.


``` text
webpack-dev-server ./app.js --colors --config alternative.config.js
```

The app should be minimized.

``` text
webpack-dev-server ./app.js --colors --content-page index.html --config alternative.config.js
```

Combined.

## Reloading

Try to update app.js, by uncommenting some lines.

The browser should reflect your changes.

You may also update the css file or any other file used by the app.
