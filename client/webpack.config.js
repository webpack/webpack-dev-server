module.exports = {
	module: {
		rules: [
			{
				test: /\.pug$/,
				use: [
					"pug",
				]
			},
			{
				test: /\.css$/,
				use: [
					"style",
					"css"
				],
			}
		]
	}
};
