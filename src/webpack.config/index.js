
const path = require('path')
const webpack = require('webpack')
const NpmInstallPlugin = require('npm-install-webpack-plugin')
const verbose = require('debug')('magic:webpackconfig')

// Command line arguments
module.exports = ({
  port=8080,
  proxy=false,
  https=false,
  offline=false,
  html=false,
  webpackconfig=false,
  deploy=false,
  ssr=false,
  debug=false,
  cwd="../automagical-react",
  packagejson={},
}) => {

  const options = {
    commonsChunk: deploy,
    longTermCaching: deploy,
    separateStylesheet: deploy,
    offline: offline,
    minimize: false,
    devtool: deploy ? "source-map": "cheap-module-eval-source-map",
    gzip: deploy,
    stats: deploy,
    devServer: !deploy,
    hotComponents: !deploy,
    https: https,
    debug: debug,
    serverSideRendering: ssr,
    port: port,
    proxy: !proxy ? false : {'*': {target:proxy}}, // http://webpack.github.io/docs/webpack-dev-server.html#api
    bower: true,
    packagejson: packagejson,
    cwd:cwd,
  }
  console.log(path.resolve(cwd, 'dist'))
  const baseConfig = {
    entry: {
      app: [path.resolve(cwd, 'src', 'index.js')], // app.js will be for server-side-
      libs: [],
    },

    output: {
      publicPath: '',
      path: path.resolve(cwd, 'dist'),
      filename: "[name].js",
      sourceMapFilename: path.resolve(cwd, 'build/sourcemaps/[file].map'),
      chunkFilename: "[name].js",
      libraryTarget: undefined,
      pathinfo: false
    },

    module:{
      /* don't parse minified files */
      noParse: [/(\-|\.)min.js$/],


      loaders: [{
        /* convert all source files */
        test: /\.(js|jsx)$/,
        include: [/src/,/bower_components/],
        loader: '/Volumes/more___/--auto-magical/automagical/node_modules/babel-loader',
        query: {
              presets: [
                  require.resolve('/Volumes/more___/--auto-magical/automagical/node_modules/babel-preset-es2015-webpack'),
                  require.resolve('/Volumes/more___/--auto-magical/automagical/node_modules/babel-preset-react'),
                  require.resolve('/Volumes/more___/--auto-magical/automagical/node_modules/babel-preset-stage-0')
              ]
          }
      }, {
        test: /\.(png|jpg)$/,
        loader: 'url?limit=8192',
      }, {
        /* Bundle CSS. */
        test: /\.css$/,
        exclude: /.(\-|\.)min.css$/,
        loader: 'style!css'
      }, {
        /* convert sass */
      //   test: /\.sass/,
      //   loader: 'style!css!sass?indentedSyntax=sass&includePaths[]=' + (__dirname, "./src")
      // }, {
        /* Embed Fonts */
        test: /\.(eot|woff|ttf)$/,
        loader: 'file?name=[name].[ext]&context=/'
      }, {
        /* File Exporter to include any images */
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
        loader: 'url?limit=8192?name=images/[name].[ext]'
      }, {
        /* File Exporter to include index */
        test: [/\.json/],
        loader: 'json'
      }]
    },

    target: "web",

    // resolveLoader: {
    //   root: [path.resolve(cwd, "node_modules"), path.resolve(cwd, 'src'), path.resolve(cwd, 'vendor')],
    // },
    //
    // resolve: {
    //   root: "app",
    //   extensions: ["", ".js", ".jsx"],
    //   /* allow for friendlier names to pull = require(preminimized files */
    //   alias: {
    //   },
    //   /* allow for root relative names in require */
    //   modulesDirectories: [path.resolve(cwd, 'bower_components'), path.resolve(cwd, "node_modules"), path.resolve(cwd, "src")]
    // },

    externals: [],
    plugins: [],
    // plugins: [
    //   /* "Compiler" switches and embeding versioning. Dead code stripping will remove. */
    //   new NpmInstallPlugin(),
    //   new webpack.DefinePlugin({
    //     __VERSION__: package.version,
    //     __DEV__: JSON.stringify(JSON.parse(process.env.NODE_ENV!=='production' || 'false'))
    //   }),
    // ],
    //
    devServer: {
    //   contentBase: 'dist/',
    //   proxy: null,
    //   historyApiFallback: true,
    //   stats: {
    //     cached: false,
    //     exclude: [/node_modules/,/bower_components/]
    //   }
    },

    /* settings for jshint */
    jshint: {
      "globals": { "__DEV__": true }
    },
  }

  verbose(options)
  const modules = [
    require('./build')(options),
    require('./deploy')(options),
    require('./globals')(options),
    require('./hmr')(options),
    require('./html')(options),
    require('./minify')(options),
    require('./offline')(options),
    require('./ssr')(options)
  ]

  let config = modules
    .reduce((config, cmd) => cmd(config), baseConfig)

  if (webpackconfig){
    // TODO: make this smartter. Things like the JS loader need to be matched up and overriden manually
    config = Object.assign(config, webpackconfig)
  }

  return config
}
