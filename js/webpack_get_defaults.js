const path = require('path')

const HtmlPlugin = require('html-webpack-plugin')
const NgAnnotatePlugin = require('ng-annotate-webpack-plugin')
const OmitTildeWebpackPlugin = require('omit-tilde-webpack-plugin')
const webpack = require('webpack')
const combineLoaders = require('webpack-combine-loaders')

const systematicConfig = require('./config')
const buildType = require('./config_choices').buildType


const plugins = [
  new OmitTildeWebpackPlugin({include: 'package.json'}),
]
const jsLoaders = [{
  loader: 'babel',
  query: {
    presets: ['es2015'],
    plugins: ['transform-strict-mode'],
  },
}]

const PRODUCTION_MODE = (process.env.SYSTEMATIC_BUILD_MODE === 'PROD')

// css sourceMap option breaks relative url imports
// In dev, the workaround is a full URL path through the output.publicPath option
// In prod, css source maps are disabled
// FIXME(rboucher): remove when this fix is released: https://github.com/webpack/style-loader/pull/96
const cssLoader = 'css' + (PRODUCTION_MODE ? '' : '?sourceMap')
const sassLoader = 'sass' + (PRODUCTION_MODE ? '' : '?sourceMap')

function buildPublicPath() {
  if (PRODUCTION_MODE) return '/'
  else return 'http://127.0.0.1:' + systematicConfig.serve.port +'/'
}


module.exports = function(basePath) {

  const PATHS = {
    src: path.join(basePath, systematicConfig.build.src_dir),
    dist: path.join(basePath, systematicConfig.build.output_dir),
  }

  // TODO(vperron): Manage the conditions using plugins.
  if (systematicConfig.build.profile === 'angular') {
    jsLoaders.push({
      loader: 'ng-annotate',
      query: {
        es6: true,
        map: true,
      },
    })
  }
  if (systematicConfig.build.type === buildType.APPLICATION) {
    plugins.push(new HtmlPlugin({
      inject: true,
      filename: 'index.html',
      template: path.join(systematicConfig.build.src_dir, 'index.html'),
    }))
  }

  return {
    context: basePath,
    entry: PATHS.src,
    output: {
      path: PATHS.dist,
      pathinfo: true,
      filename: systematicConfig.build.type === buildType.APPLICATION ? 'bundle.js' : 'index.js',
      publicPath: buildPublicPath(), // Prefix for all the static urls
      libraryTarget: systematicConfig.build.type === buildType.LIBRARY ? 'umd' : undefined,
    },
    resolve: {
      root: [path.resolve(basePath)],
    },
    module: {
      preLoaders: [
        { test: /\.js$/, loader: 'source-map-loader' },
      ],
      loaders: [
        {
          test: /\.js/,
          loader: combineLoaders(jsLoaders),
          exclude: /(node_modules|bower_components)/,
          include: [PATHS.src],

        },
        { test: /\.css/, loaders: ['style', cssLoader, 'postcss'] },
        { test: /\.scss$/, loaders: ['style', cssLoader, 'postcss', sassLoader] },
        { test: /\.jade$/, loader: 'jade' },
        { test: /\.html$/, loader: 'html' },
        { test: /\.json$/, loader: 'json' },
        { test: /\.(png|gif|jp(e)?g)$/, loader: 'url?limit=8192' },
        { test: /\.(ttf|eot|svg|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url?limit=50000' },
      ],
    },
    plugins: plugins,
    devtool: 'source-map',  // A source map will be emitted.
    sassLoader: {
      includePaths: [path.join(basePath, "node_modules")]
    }
  }
}
