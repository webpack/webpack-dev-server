module.exports = {
	context: __dirname,
	entry: "./app.js",
	module: {
		rules: [
			{
				test: /\.less$/,
				use: [
					"style-loader",
					"css-loader",
					"less-loader"
				]
			},
			{
				test: /\.png$/,
				use: "file-loader",
				options: { prefix: "img/" }
			}
		]
	}
}
