const path = require('path')

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
        { test: /\.css/, loaders: ['style', 'css'] },
        { test: /\.(png|gif|jp(e)?g)$/, loader: 'url-loader?limit=8192' },
        { test: /\.(ttf|eot|svg|woff(2))(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=50000' },
      ],
    },
    devtool: 'source-map',  // A source map will be emitted.
  }
}
