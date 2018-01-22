module.exports = {
  context: __dirname,
  entry: ['./app.js', '../../client/index.js?http://localhost:8080/&sockPath=subapp/sockjs-node'],
  output: {
    filename: 'bundle.js',
    publicPath: '/subapp/'
  }
};
