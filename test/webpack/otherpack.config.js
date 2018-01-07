const path = require('path');
const paths = [
  path.resolve(__dirname, "app")
  // path.resolve(__dirname, '..', '..', '..', "components"),
  // path.resolve(__dirname, '..', '..', '..', "services")
];

var out = {
  context: __dirname,
  entry: './app/coffee.coffee',
  node: {__dirname: true},
  output: {
     filename: 'js/other.bundle.js'
  },
  devtool: 'eval',
  // target: 'web',
  module: {
    loaders: [
      { test: /\.imba/, loader: 'imba/loader', paths: paths },
      { test: /\.coffee/, loader: 'coffee-loader', paths: paths }
    ]
  },
  resolveLoader: { root: path.join(__dirname, "node_modules") },
  resolve: {
  extensions: ['', '.js', '.imba', '.coffee'],
    modulesDirectories: [ 'node_modules' ]
  }
};
module.exports = out;