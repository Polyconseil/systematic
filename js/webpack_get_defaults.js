/* Systematic's webpack base config file */

'use strict'

const fs = require('fs')
const path = require('path')

const webpack = require('webpack')

const HtmlPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const config = require('./config')
const enums = require('./config_choices')

const PRODUCTION_MODE = (process.env.SYSTEMATIC_BUILD_MODE === 'PROD')

function buildPublicPath () {
  return `${config.build.public_path}`
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
    if (PRODUCTION_MODE && config.build.enable_filename_hashing) {
      name = `${name}.[hash].js`
    }
  }
  return name
}


function getOutputCssFileName () {
  if (config.build.type === enums.buildTypes.APPLICATION) {
    if (PRODUCTION_MODE && config.build.enable_filename_hashing) {
      return 'bundle.[hash].css'
    }
    return 'bundle.css'
  }
  return 'index.css'
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
    ['es2015', {'modules': false }],
    'es2016',
    'es2017',
    'stage-3',  // needed for object spread operator "..."
  ]
  switch (profile) {
    case 'react':
      presets.unshift('react')
      break
  }
  return presets
}

function getDevtool () {
  // https://github.com/webpack/webpack/issues/2145#issuecomment-294361203
  return 'cheap-module-source-map'
}

module.exports = function (basePath) {

  const PATHS = {
    src: path.join(basePath, config.build.src_dir),
    dist: path.join(basePath, config.build.output_dir),
  }

  const plugins = [
    // FIXME(vperron): Restore babel options directly within loader as soon as it's supported with webpack2
    new webpack.LoaderOptionsPlugin({
      debug: true,
      options: {
        context: basePath,
        babel: {
          presets: buildBabelPresets(config.build.profile),
          plugins: [
            'transform-strict-mode',
            ['transform-runtime', {polyfill: false}],
            'transform-class-properties'
          ],
          comments: false,
        },
      },
    }),
  ]

  const jsLoaders = [{
    loader: 'babel-loader',
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

  let cssRulesAggregator = function (loaders) {
    return ['style-loader'].concat(loaders)
  }

  if (PRODUCTION_MODE) {
    const extractCSS = new ExtractTextPlugin(getOutputCssFileName())
    plugins.push(extractCSS)
    cssRulesAggregator = function (loaders) {
      return extractCSS.extract({
        use: loaders,
      })
    }
  }

  switch (config.build.type) {
    case enums.buildTypes.APPLICATION:
    case enums.buildTypes.COMPONENT:
      plugins.push(configureHTMLPlugin())
      break
  }

  switch (config.build.type) {
    case enums.buildTypes.APPLICATION:
      switch (config.build.profile) {
        case 'angular':
          plugins.push(new require('ng-annotate-webpack-plugin')({
            es6: true,
            map: true,
          }))
      }
			break;
	}

  return {
    cache: true,
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
          use: cssRulesAggregator([cssLoader, postCssLoader]),
        },
        {
          test: /\.scss$/,
          use: cssRulesAggregator([cssLoader, postCssLoader, sassLoader]),
        },
        { test: /\.json/, use: 'json-loader' },
        { test: /\.jade$/, use: 'jade-loader' },
        { test: /\.html$/, use: 'html-loader' },
        { test: /\.(png|gif|jp(e)?g)$/, use: 'url-loader?limit=50000' },
        { test: /\.(ttf|eot|svg|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/, use: 'url-loader?limit=50000' },
      ],
    },
    plugins: plugins,
    devtool: getDevtool(),
  }
}
