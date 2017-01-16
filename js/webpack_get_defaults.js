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


function buildJsLoaders (profile) {

  const loaders = [{
    loader: 'babel',
    query: {
      presets: ['es2015', 'stage-3'],
      plugins: ['transform-strict-mode'],
    },
  }]

  switch (profile) {
    case 'angular':
      loaders.push({
        loader: 'ng-annotate',
        query: {
          es6: true,
          map: true,
        },
      })
      break
    case 'react':
      loaders[0].query.presets.unshift('react')
      break
  }

  return loaders
}

const jsLoaders = buildJsLoaders(config.build.profile)

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

/* Differentiate plugins & loaders depending on the profile, mode, and type */
const PRODUCTION_MODE = (process.env.SYSTEMATIC_BUILD_MODE === 'PROD')

// css sourceMap option breaks relative url imports
// In dev, the workaround is a full URL path through the output.publicPath option
// In prod, css source maps are disabled
// FIXME: remove when this fix is released: https://github.com/webpack/style-loader/pull/96
if (PRODUCTION_MODE) {
  cssLoaders.forEach(function (loader) { loader.query.sourceMap = true })
  sassLoaders.forEach(function (loader) { loader.query.sourceMap = true })
}

switch (config.build.type) {
  case enums.buildTypes.APPLICATION:
  case enums.buildTypes.COMPONENT:
    // applications & components need CSS extraction, also an index page and potentially favicon.
    plugins.push(new ExtractTextPlugin('bundle.css'))
    const indexHtmlPath = path.join(config.build.src_dir, 'index.html')
    if (fs.existsSync(indexHtmlPath)) {
      const htmlPluginProperties = {
        inject: true,
        filename: 'index.html',
        template: indexHtmlPath,
      }

      const faviconPath = path.join(config.build.src_dir, 'favicon.ico')
      if (fs.existsSync(faviconPath)) {
        htmlPluginProperties.favicon = faviconPath
      }

      plugins.push(new HtmlPlugin(htmlPluginProperties))
    }
    break
  default:
    // Without the extract text plugin, we need the style loader
    cssLoaders.unshift(styleLoader)
    sassLoaders.unshift(styleLoader)
    break
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

function applyExtractText (inlinedLoaders) {
  // Extract css only for apps
  // We want to be able to import a lib with a single JS import
  switch (config.build.type) {
    case enums.buildTypes.APPLICATION:
    case enums.buildTypes.COMPONENT:
      return ExtractTextPlugin.extract(inlinedLoaders)
    default:
      return inlinedLoaders
  }
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

function getExternals () {
  // All deps of a library or component must be installed or available in the application context.
  // This avoids duplicated deps and version conflicts
  switch (config.build.type) {
    case enums.buildTypes.COMPONENT:
      if (PRODUCTION_MODE) {
        return getDependencies()
      } else {
        return []
      }
    case enums.buildTypes.LIBRARY:
      return getDependencies()
    default:
      return []
  }
}


module.exports = function (basePath) {

  const PATHS = {
    src: path.join(basePath, config.build.src_dir),
    dist: path.join(basePath, config.build.output_dir),
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
    externals: getExternals(),
    resolve: {
      root: [path.resolve(basePath), path.join(basePath, 'node_modules')],  // look for requires inside 'src' and 'node_modules'
    },
    module: {
      loaders: [
        {
          test: /\.(js|jsx)/,
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
    postcss: function () {
      return [
        require('postcss-cssnext'),
        require('postcss-import')({  // This plugin enables @import rule in CSS files.
          path: [basePath],  // Use the same path for CSS and JS imports
        }),
      ]
    },
  }
}
