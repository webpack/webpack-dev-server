module.exports = {
	context: __dirname,
	entry: "./app.js",
	module: {
		rules: [
			{
				test: /\.less$/,
				use: [
					{ loader: "style-loader" },
					{ loader: "css-loader" },
					{ loader: "less-loader" }
				]
			},
			{
				test: /\.png$/,
				loader: "file-loader",
				options: { prefix: "img/" }
			}
		]
	}
}
