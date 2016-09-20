module.exports = {
	context: __dirname,
	entry: "./app.js",
	devServer: {
		proxy: {
			"/api": {
				target: "http://jsonplaceholder.typicode.com/",
				changeOrigin: true,
				pathRewrite: {
					"^/api": ""
				},
				bypass: function(req) {
					if(req.url === "/api/nope") {
						return "/bypass.html";
					}
				}
			}
		}
	}
}
