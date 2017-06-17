module.exports = {
	context: __dirname,
	entry: "./foo.js",
	output: {
		filename: "bundle.js",
		path: "/"
	},
	devServer: {
		publicPath: ["/public-1/", "/public-2/"]
	}
};
