const webpack = require("webpack");
const parseOptions = require("./parseOptions");

class WebpackDevServerPlugin {
	constructor(options) {
		this.options = parseOptions(options);
	}
	apply(compiler) {
		if(this.options.hot) {
			const HotModuleReplacementPlugin = new webpack.HotModuleReplacementPlugin();

			if(compiler.options.plugins) {
				compiler.options.plugins.push(HotModuleReplacementPlugin);
			} else {
				compiler.options.plugins = [HotModuleReplacementPlugin];
			}
		}

		compiler.options.devServer = this.options;
	}
}

module.exports = WebpackDevServerPlugin;
