const server = require('./server/')
const generateconfig = require('./webpack.config/')
const args = require('./webpack.config/cmd')
const debug = require('debug')('magic:index')

const TARGET = process.env.npm_lifecycle_event;
process.env.BABEL_ENV = TARGET

module.exports = (() => {

  const settings = args() || {}
  const webpackconfig = generateconfig(settings)

  debug(webpackconfig)

  server(webpackconfig, settings.port || 8081)
})()
