# Plugin

```shell
node ../../bin/webpack-dev-server.js --open
```

```javascript
const { WebpackDevServerPlugin } = require('webpack-dev-server');

module.exports = {
	plugins: [
		new WebpackDevServerPlugin({
			hot: true
		})
	]
}
```

## What should happen

It should inject `HotModuleReplacementPlugin` if the `hot` flag is set. Other options are passed normally as you might expect.
