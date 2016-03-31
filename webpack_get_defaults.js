const path = require('path')
const ini = require('ini')
const fs = require('fs')

const webpack = require('webpack')
const ngAnnotatePlugin = require('ng-annotate-webpack-plugin')
const htmlPlugin = require('html-webpack-plugin')

const systematic = ini.parse(fs.readFileSync('./systematic.ini', 'utf-8'))
const plugins = []
const jadeLoaders = ['html', 'jade-html']

if (systematic.build.profile === 'angular') {
  plugins.push(new ngAnnotatePlugin({add: true}))
  jadeLoaders.unshift('ngtemplate')
}
if (systematic.build.type === 'app') {
  plugins.push(new htmlPlugin({
    inject: true,
    filename: 'index.html',
    template: 'src/index.html',
  }))
  plugins.push(new webpack.optimize.UglifyJsPlugin())
}

const distFolder = 'dist'

module.exports = function(basePath) {

  const servePort = systematic.serve ? systematic.serve.port : 'no-port'
  const PATHS = {
    app: path.join(basePath, 'src'),
    dist: path.join(basePath, distFolder),
  }


  return {
    context: basePath,
    entry: PATHS.app,
    output: {
      path: PATHS.dist,
      filename: systematic.build.type === 'app' ? 'bundle.js' : 'index.js',
      publicPath: 'http://127.0.0.1:' + servePort + '/' + distFolder + '/',
    },
    resolve: {
      root: [path.resolve(basePath)],
    },
    module: {
      loaders: [
        {
          test: /\.js/,
          loader: 'babel',
          exclude: /(node_modules|bower_components)/,
          include: path.join(basePath, '/src'),
          query: {
            presets: ['es2015'],
          },
        },
        { test: /\.css/, loaders: ['style', 'css', 'postcss-loader'] },
        // FIXME css source maps (add 'css?sourceMaps') breaking url attribute
        { test: /\.scss$/, loaders: ['style', 'css?sourceMap', 'postcss', 'sass?sourceMap'] },
        { test: /\.jade$/, loaders: jadeLoaders },
        { test: /\.json$/, loader: 'json' },
        { test: /\.(png|gif|jp(e)?g)$/, loader: 'url-loader?limit=8192' },
        { test: /\.(ttf|eot|svg|woff(2))(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=50000' },
      ],
    },
    devtool: 'source-map',  // A source map will be emitted.
    plugins: plugins,
  }
}
