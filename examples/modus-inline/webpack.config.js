module.exports = {
	context: __dirname,
	entry: "./app.js",
	module: {
		rules: [
			{
				test: /\.less$/,
				use: [
					"style",
					"css-loader",
					"less-loader"
				]
			},
			{
				test: /\.png$/,
				use: "file",
				options: { prefix: "img/" }
			}
		]
	}
}
