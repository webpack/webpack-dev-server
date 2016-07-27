const fs = require('fs')
const path = require('path')

const debug = require('debug')('magic:cmd')
const verbose = require('debug')('magic-verbose:cmd')

const defaults = {
  port:8080,
  proxy:false,
  https:false,
  offline:false,
  html:false,
  webpackconfig:false,
  deploy:false,
  ssr:false,
  cwd:"../automagical-react",
  packagejson:{version:'0', devDependecies:[], dependencies:[], name:''}
}

module.exports = () => {
  var cwd = cwd || path.resolve('./')
  var args = process.argv.slice(',')

  while(args.length !== 0 && (args[0] || '').indexOf('--') === -1) {
    args.shift()
  }
  args = (args || []).reduce((obj, val) => {
    let vals = val.slice(2).split('=')
    return Object.assign(obj, {[vals[0]]:(vals[1] || true)})
  }, {})

  debug(`cwd: ${cwd}`)

  if (fs.existsSync(`${cwd}/package.json`)) {
    packagejson = require(`${cwd}/package.json`)
  } else {
    debug(`no package found at ${cwd}/package.json`)
  }

  let config = Object.assign(defaults, args, {packagejson, "cwd":cwd})

  console.log(`args: ${JSON.stringify(config, undefined, 2)}`)
  return config
}
