const path = require('path')
const ngAnnotatePlugin = require('ng-annotate-webpack-plugin')
const htmlPlugin = require('html-webpack-plugin')


const plugins = []
const jadeLoaders = ['html', 'jade-html']

if (process.argv['--systematic-profile'] === 'angular') {
  plugins.push(new ngAnnotatePlugin({add: true}))
  jadeLoaders.unshift('ngtemplate')
}
if (process.argv['--systematic-app'] === 'yes') {
  plugins.push(new htmlPlugin({
    inject: true,
    filename: 'index.html',
    template: 'src/index.html',
  }))
}


module.exports = function(basePath) {

  const PATHS = {
    app: path.join(basePath, 'src'),
    dist: path.join(basePath, 'dist'),
  }

  return {
    context: basePath,
    entry: PATHS.app,
    output: {
      path: PATHS.dist,
      filename: 'bundle.js',
      publicPath: 'http://127.0.0.1:3341/dist/',
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
        // TODO fix css source maps (add 'css?sourceMaps') breaking url attribute
        { test: /\.scss$/, loaders: ['style', 'css?sourceMap', 'postcss-loader', 'sass?sourceMap'] },
        { test: /\.jade$/, loaders: jadeLoaders },
        { test: /\.(png|gif|jp(e)?g)$/, loader: 'url-loader?limit=8192' },
        { test: /\.(ttf|eot|svg|woff(2))(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=50000' },
      ],
    },
    devtool: 'source-map',  // A source map will be emitted.
    plugins: plugins,
  }
}
