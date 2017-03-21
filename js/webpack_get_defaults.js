/* Systematic's webpack base config file */

'use strict'

const fs = require('fs')
const path = require('path')

const webpack = require('webpack')

const HtmlPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ngAnnotatePlugin = require('ng-annotate-webpack-plugin')

const config = require('./config')
const enums = require('./config_choices')

const PRODUCTION_MODE = (process.env.SYSTEMATIC_BUILD_MODE === 'PROD')

function buildPublicPath () {
  if (PRODUCTION_MODE) return `${config.build.public_path}`
  else return `http://${config.serve.host}:${config.serve.port}/`
}

function libraryTarget () {
  switch (config.build.type) {
    case enums.buildTypes.COMPONENT:
      if (PRODUCTION_MODE) {
        return 'umd'
      } else {
        return 'var'
      }
    case enums.buildTypes.LIBRARY:
      return 'umd'
    default:
      return 'var'
  }
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


function getOutputFileName () {
  let name = 'index.js'
  if (config.build.type === enums.buildTypes.APPLICATION) {
    name = 'bundle.js'
    if (PRODUCTION_MODE) {
      name = `${name}.[hash].js`
    }
  }
  return name
}

function configureHTMLPlugin () {
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
    return new HtmlPlugin(htmlPluginProperties)
  }
}

function buildBabelPresets (profile) {
  const presets = [
    ['es2015', { 'loose': true, 'modules': false }],
    'stage-3',
  ]
  switch (profile) {
    case 'react':
      presets.unshift('react')
      break
  }
  return presets
}


module.exports = function (basePath) {

  const PATHS = {
    src: path.join(basePath, config.build.src_dir),
    dist: path.join(basePath, config.build.output_dir),
  }

  const plugins = [
    new webpack.LoaderOptionsPlugin({
      debug: true,
      options: {
        context: basePath,
        babel: {
          presets: buildBabelPresets(config.build.profile),
          plugins: ['transform-strict-mode', 'transform-class-properties'],
          comments: false,
        },
      },
    }),
  ]

  const jsLoaders = [{
    loader: 'babel-loader',
    query: {
      presets: ['es2015', 'stage-3'],
      plugins: [
        'transform-strict-mode',
        // Use babel-runtime helpers to avoid code duplication
        ['transform-runtime', {
          'polyfill': false,
          'regenerator': false
        }]
    ],
  },
  }]

  const cssLoader = {
    loader: 'css-loader',
    options: {
      localIdentName: '[path][name]__[local]--[hash:base64:5]',
    },
  }
  const postCssLoader = {
    loader: 'postcss-loader',
    options: {
      plugins: function () {
        return [
          require('postcss-import')({  // This plugin enables @import rule in CSS files.
            path: [basePath],  // Use the same path for CSS and JS imports
          }),
          require('postcss-cssnext'),
        ]
      },
    },
  }
  const sassLoader = {
    loader: 'sass-loader',
    options: {
      includePaths: [
        path.join(basePath, 'node_modules'),
      ],
    },
  }

  let extractCSS = null

  switch (config.build.type) {
    case enums.buildTypes.APPLICATION:
      if (PRODUCTION_MODE) {
        extractCSS = new ExtractTextPlugin('bundle.[contenthash].css')
      } else {
        extractCSS = new ExtractTextPlugin('bundle.css')
      }
      plugins.push(extractCSS)
      plugins.push(configureHTMLPlugin())
      break

    case enums.buildTypes.COMPONENT:
      extractCSS = new ExtractTextPlugin('bundle.css')
      plugins.push(extractCSS)
      plugins.push(configureHTMLPlugin())
      break

    case enums.buildTypes.LIBRARY:
      extractCSS = new ExtractTextPlugin('bundle.css')
      plugins.push(extractCSS)
      break
  }

  switch (config.build.type) {
    case enums.buildTypes.APPLICATION:
      plugins.push(new ngAnnotatePlugin({
				es6: true,
				map: true,
      }))
			break;
	}

  return {
    context: basePath,
    entry: PATHS.src,
    output: {
      path: PATHS.dist,
      pathinfo: true,
      filename: getOutputFileName(),
      publicPath: buildPublicPath(), // Prefix for all the static urls
      libraryTarget: libraryTarget(),
    },
    externals: getExternals(),
    resolve: {
      modules: [
        path.resolve(basePath),
        path.join(basePath, 'node_modules'),
      ],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)/,
          use: jsLoaders,
          exclude: /(node_modules|bower_components)/,
          include: [PATHS.src],
        },
        {
          test: /\.css/,
          use: extractCSS.extract({
            loader: [cssLoader, postCssLoader],
            fallback: 'style-loader',
          }),
        },
        {
          test: /\.scss$/,
          use: extractCSS.extract({
            loader: [cssLoader, postCssLoader, sassLoader],
            fallback: 'style-loader',
          }),
        },
        { test: /\.json/, loader: 'json-loader' },
        { test: /\.jade$/, loader: 'jade-loader' },
        { test: /\.html$/, loader: 'html-loader' },
        { test: /\.(png|gif|jp(e)?g)$/, loader: 'url-loader?limit=50000' },
        { test: /\.(ttf|eot|svg|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=50000' },
      ],
    },
    plugins: plugins,
    devtool: 'source-map',  // A source map will be emitted.
  }
}
