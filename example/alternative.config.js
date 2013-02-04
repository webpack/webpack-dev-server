module.exports = {
	module: {
		loaders: [
			{ test: /\.less$/, loader: "style!css!less" }
		]
	},
	optimize: {
		minimize: true
	}
}