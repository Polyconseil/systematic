/* Systematic's webpack base config file */

'use strict'

const fs = require('fs')
const path = require('path')

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const HtmlPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const TerserPlugin = require('terser-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const config = require('./config')
const enums = require('./config_choices')

const PRODUCTION_MODE = (process.env.NODE_ENV === 'production')

function getPackageInfo (basePath) {
  try {
    return require(path.join(basePath, 'package.json'))
  } catch (e) {
    return null
  }
}

function buildPublicPath () {
  return `${config.build.public_path}`
}

function libraryTarget () {
  switch (config.build.type) {
    case enums.buildTypes.LIBRARY:
    case enums.buildTypes.COMPONENT:
      return 'umd'
    default:
      return 'var'
  }
}

function getDevToolFilenameTemplate (basePath) {
  switch (config.build.type) {
    case enums.buildTypes.LIBRARY:
    case enums.buildTypes.COMPONENT:
      const packageJson = getPackageInfo(basePath)
      return `${packageJson.name}/[resource-path]`
    default:
      return 'webpack:///[resource-path]'
  }
}

function getDependencies (basePath) {
  const packageJson = getPackageInfo(basePath)
  if (!packageJson) return []
  return Object.keys(packageJson.dependencies)
}

function getExternals (basePath) {
  // All deps of a library or component must be installed or available in the application context.
  // This avoids duplicated deps and version conflicts
  let externals = []
  switch (config.build.type) {
    case enums.buildTypes.COMPONENT:
      if (PRODUCTION_MODE) {
        externals = getDependencies(basePath)
      } else {
        return []
      }
      break
    case enums.buildTypes.LIBRARY:
      externals = getDependencies(basePath)
      break
    default:
      return []
  }
  return externals.filter((item) => config.build.keep_dependency.indexOf(item) === -1)
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
  throw new Error('file ' + indexHtmlPath + ' not found')
}

function buildBabelPresets (profile) {
  const presets = [
    ['@babel/preset-env', {
       'modules': false,
       // see on https://browserl.ist/?q=%3E0.25%25%2C+not+ie+11%2C+not+op_mini+all
       'targets': '>0.25%, not ie 11, not op_mini all',
    }],
  ]
  switch (profile) {
    case 'react':
      presets.unshift('react')
      break
  }
  return presets
}

function getBabelPlugins () {
  return [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-syntax-dynamic-import',
  ]
}

function checkNoParse (name) {
  for (let entry of config.build.no_parse) {
    if (name.indexOf(path.join('node_modules', entry)) !== -1) {
      return true
    }
  }
  return false
}

module.exports = function (basePath) {

  const nodeModulesPath = path.join(basePath, 'node_modules')

  const PATHS = {
    src: path.join(basePath, config.build.src_dir),
    dist: path.join(basePath, config.build.output_dir),
  }

  const plugins = []

  if (config.build.analyze) {
    plugins.push(new BundleAnalyzerPlugin())
  }

  if (config.build.profile === 'vue') {
    plugins.push(new VueLoaderPlugin())
  }

  const jsLoaders = []

  if (config.build.type !== enums.buildTypes.LIBRARY && config.build.enable_babel) {
    jsLoaders.push({
      loader: 'babel-loader',
      options: {
        presets: buildBabelPresets(config.build.profile),
        plugins: getBabelPlugins(),
        comments: false,
      },
    })
  }

  const cssLoader = {
    loader: 'css-loader',
    options: {
      localIdentName: '[path][name]__[local]--[hash:base64:5]',
      importLoaders: 2, // let postcss/scss resolve @import
    },
  }
  const postCssLoader = {
    loader: 'postcss-loader',
    options: {
      ident: 'postcss',
      sourceMap: true,
      plugins: function (loader) {
        return [
          require('postcss-import')({ // This plugin enables @import rule in CSS files.
            path: [loader.resourcePath, basePath], // Use the same path for CSS and JS imports
          }),
          require('postcss-cssnext')({
            features: {
              customProperties: {
                preserve: true,
              },
            },
          }),
        ]
      },
    },
  }
  const sassLoader = {
    loader: 'sass-loader',
    options: {
      includePaths: [nodeModulesPath],
    },
  }

  let baseCssLoaders = ['style-loader']

  if (config.build.profile === 'vue') {
    baseCssLoaders = ['vue-style-loader']
  }

  if (PRODUCTION_MODE) {
    const extractCSS = new MiniCssExtractPlugin({
      filename: getOutputCssFileName(),
    })
    plugins.push(extractCSS)
    baseCssLoaders = [MiniCssExtractPlugin.loader]
  }

  switch (config.build.type) {
    case enums.buildTypes.APPLICATION:
    case enums.buildTypes.COMPONENT:
      plugins.push(configureHTMLPlugin())
      break
  }

  let optimization = {}
  if (PRODUCTION_MODE) {
    optimization.minimizer = [
      new TerserPlugin({
        parallel: true,
        cache: true,
        sourceMap: true,
        extractComments: true,
        terserOptions: {
          compress: {
            inline: false,
          },
          keep_fnames: true,
          keep_classnames: true,
        },
      }),
    ]
  }

  return {
    cache: true,
    context: basePath,
    entry: PATHS.src,
    optimization: {},
    output: {
      path: PATHS.dist,
      pathinfo: true,
      filename: getOutputFileName(),
      publicPath: buildPublicPath(), // Prefix for all the static urls
      libraryTarget: libraryTarget(),
      devtoolModuleFilenameTemplate: getDevToolFilenameTemplate(basePath),
    },
    externals: getExternals(basePath),
    resolve: {
      extensions: ['.vue', '.js'],
      modules: [
        path.resolve(basePath),
        nodeModulesPath,
      ],
    },
    module: {
      noParse: checkNoParse,
      rules: [
        {
          test: /\.(js|jsx)$/,
          use: jsLoaders,
          include: [PATHS.src],
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },
        {
          test: /\.css$/,
          use: baseCssLoaders.concat([cssLoader, postCssLoader]),
        },
        {
          test: /\.scss$/,
          use: baseCssLoaders.concat([cssLoader, postCssLoader, sassLoader]),
        },
        { test: /\.jade$/, use: 'jade-loader' },
        {
          test: /\.pug$/,
          oneOf: [
            // this applies to `<template lang="pug">` in Vue components
            {
              resourceQuery: /^\?vue/,
              use: ['pug-plain-loader'],
            },
            // this applies to pug imports inside JavaScript
            {
              use: ['raw-loader', 'pug-plain-loader'],
            },
          ],
        },
        { test: /\.html$/, use: 'html-loader' },
        { test: /\.(png|gif|jp(e)?g)$/, use: 'url-loader?limit=50000' },
        { test: /\.(ttf|eot|svg|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/, use: 'url-loader?limit=50000' },
      ],
    },
    plugins: plugins,
    devtool: PRODUCTION_MODE ? 'source-map' : 'cheap-module-inline-source-map',
    devServer: {
      disableHostCheck: true, // since webpack 2.4.3, a host check is present, remove it.
    },
  }
}
