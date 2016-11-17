/* Systematic's webpack base config file */

'use strict'

const fs = require('fs')
const path = require('path')

// TODO(vperron): Terrible to require this for the 5 lines this plugin is.
const combineLoaders = require('webpack-combine-loaders')
const HtmlPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const config = require('./config')
const enums = require('./config_choices')

/* Global plugins collection, will be filled according to the profile */
const plugins = []

/* Pre-configure loaders */
const jsLoaders = [{
  loader: 'babel',
  query: {
    presets: ['es2015', 'stage-3'],
    plugins: ['transform-strict-mode'],
  },
}]

const cssLoader = {
  loader: 'css',
  query: {
    localIdentName: '[path][name]__[local]__[hash:base64:5]',
  },
}
const postcssLoader = { loader: 'postcss', query: {} }
const sassLoader = { loader: 'sass', query: {} }
const styleLoader = { loader: 'style', query: {} }

const cssLoaders = [cssLoader, postcssLoader]
const sassLoaders = [cssLoader, postcssLoader, sassLoader]

if (config.build.type === enums.buildTypes.APPLICATION) {
  plugins.push(new ExtractTextPlugin('bundle.css'))
} else {
  // Without the extract text plugin, we need the style loader
  cssLoaders.unshift(styleLoader)
  sassLoaders.unshift(styleLoader)
}

const PRODUCTION_MODE = (process.env.SYSTEMATIC_BUILD_MODE === 'PROD')

// css sourceMap option breaks relative url imports
// In dev, the workaround is a full URL path through the output.publicPath option
// In prod, css source maps are disabled
// FIXME: remove when this fix is released: https://github.com/webpack/style-loader/pull/96
if (PRODUCTION_MODE) {
  cssLoaders.forEach(function (loader) { loader.query.sourceMap = true })
  sassLoaders.forEach(function (loader) { loader.query.sourceMap = true })
}

function buildPublicPath () {
  if (PRODUCTION_MODE) return `${config.build.public_path}`
  else return `http://${config.serve.host}:${config.serve.port}/`
}

function getDependencies () {
  let packageJson
  try {
    packageJson = require('package.json')
  } catch (e) {
    return []
  }
  return Object.keys(packageJson.dependencies)
}

function applyExtractText (inlinedLoaders) {
  // Extract css only for apps
  // We want to be able to import a lib with a single JS import
  if (config.build.type === enums.buildTypes.APPLICATION) {
    return ExtractTextPlugin.extract(inlinedLoaders)
  } else {
    return inlinedLoaders
  }
}


module.exports = function (basePath) {

  const PATHS = {
    src: path.join(basePath, config.build.src_dir),
    dist: path.join(basePath, config.build.output_dir),
  }

  // TODO: Manage the conditions using plugins.
  if (config.build.profile === 'angular') {
    jsLoaders.push({
      loader: 'ng-annotate',
      query: {
        es6: true,
        map: true,
      },
    })
  }
  if (config.build.type === enums.buildTypes.APPLICATION) {
    const indexHtmlPath = path.join(config.build.src_dir, 'index.html')
    if (fs.existsSync(indexHtmlPath)) {
      plugins.push(new HtmlPlugin({
        inject: true,
        filename: 'index.html',
        template: indexHtmlPath,
      }))
    }
  }

  return {
    context: basePath,
    entry: PATHS.src,
    output: {
      path: PATHS.dist,
      pathinfo: true,
      filename: config.build.type === enums.buildTypes.APPLICATION ? 'bundle.js' : 'index.js',
      publicPath: buildPublicPath(), // Prefix for all the static urls
      libraryTarget: config.build.type === enums.buildTypes.LIBRARY ? 'umd' : 'var',
    },
    // All deps of a library must be installed by the application
    // This avoids duplicated deps and version conflicts
    externals: config.build.type === enums.buildTypes.LIBRARY ? getDependencies() : [],
    resolve: {
      // Go look for requires inside 'src' and 'node_modules'
      root: [path.resolve(basePath), path.join(basePath, 'node_modules')],
    },
    module: {
      loaders: [
        {
          test: /\.js/,
          loader: combineLoaders(jsLoaders),
          exclude: /(node_modules|bower_components)/,
          include: [PATHS.src],
        },
        { test: /\.css/, loader: applyExtractText(combineLoaders(cssLoaders)) },
        { test: /\.scss$/, loader: applyExtractText(combineLoaders(sassLoaders)) },
        { test: /\.jade$/, loader: 'jade' },
        { test: /\.html$/, loader: 'html' },
        { test: /\.json$/, loader: 'json' },
        { test: /\.(png|gif|jp(e)?g)$/, loader: 'url?limit=50000' },
        { test: /\.(ttf|eot|svg|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url?limit=50000' },
      ],
    },
    plugins: plugins,
    devtool: 'source-map',  // A source map will be emitted.
    sassLoader: {
      includePaths: [path.join(basePath, 'node_modules')],
    },
  }
}
