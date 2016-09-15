var fs = require('fs');

var proxyConfig = require('./proxy-config');
var proxyOptions = {
	context: '/api',
	target: proxyConfig.target,
	pathRewrite: proxyConfig.pathRewrite,
	changeOrigin: true
};

fs.watch('./proxy-config.js', function() {
	delete require.cache[require.resolve('./proxy-config')];
	try {
		var newProxyConfig = require('./proxy-config');
		if(proxyOptions.target !== newProxyConfig.target) {
			console.log('Proxy target changed:', newProxyConfig.target);
			proxyOptions = {
				context: '/api',
				target: newProxyConfig.target,
				pathRewrite: newProxyConfig.pathRewrite,
				changeOrigin: true
			};
		}
	} catch(e) {}
});

module.exports = {
	context: __dirname,
	entry: "./app.js",
	devServer: {
		proxy: [
			function() {
				return proxyOptions;
			}
		]
	}
};
