# Watch Content Base

## Watching a single directory

```shell
node ../../bin/webpack-dev-server.js --content-base assets --watch-content-base --open
```

### What should happen

The script should open `http://localhost:8080/`. In the app you should see "Does it work?"

In your editor, edit `assets/index.html`, and save your changes. The app should reload.


## Watching an array of directories

```javascript
// webpack.conf.js
module.exports = {
	/* ... */
	devServer: {
		contentBase: [
			"assets",
			"css",
		]
	}
}
```

```shell
node ../../bin/webpack-dev-server.js --watch-content-base --open
```

### What should happen

The script should open `http://localhost:8080/`. In the app you should see "Does it work?"

In your editor, edit `assets/index.html`, and save your changes. The app should reload.

In your editor, edit `css/styles.css`, and save your changes. The app should reload.
