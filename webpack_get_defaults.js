const _ = require('lodash')
const path = require('path')
const ini = require('ini')
const fs = require('fs')

const HtmlPlugin = require('html-webpack-plugin')
const NgAnnotatePlugin = require('ng-annotate-webpack-plugin')
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const webpack = require('webpack')

const systematic = ini.parse(fs.readFileSync('./systematic.ini', 'utf-8'))
const plugins = []
const jadeLoaders = ['html', 'jade-html']


_.defaultsDeep(systematic, {
  build: {
    src_dir: 'src',
    output_dir: 'dist',
  },
  serve: {
    port: 8080,
  }
})


module.exports = function(basePath) {

  const PATHS = {
    src: path.join(basePath, systematic.build.src_dir),
    dist: path.join(basePath, systematic.build.output_dir),
  }

  if (systematic.build.profile === 'angular') {
    plugins.push(new NgAnnotatePlugin({add: true}))
    jadeLoaders.unshift('ngtemplate')
  }
  if (systematic.build.type === 'app') {
    plugins.push(new HtmlPlugin({
      inject: true,
      filename: 'index.html',
      template: path.join(systematic.build.src_dir, 'index.html'),
    }))
    plugins.push(new OpenBrowserPlugin({ url: PATHS.dist }))
  }

  return {
    context: basePath,
    entry: PATHS.src,
    output: {
      path: PATHS.dist,
      filename: systematic.build.type === 'app' ? 'bundle.js' : 'index.js',
      publicPath: '/', // Prefix for all the static urls
      libraryTarget: systematic.build.type === 'lib' ? 'umd' : undefined,
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
          include: PATHS.src,
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
