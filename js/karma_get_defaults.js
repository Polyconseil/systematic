const path = require('path')

const systematicConfig = require('./config')

process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = function (basePath, _webpackConfig) {

  const webpackConfig = _webpackConfig || require('./webpack_get_defaults')(basePath)

  webpackConfig.devtool = 'eval'  // fastest source map ever
  webpackConfig.entry = function(){return {}}  // Reset the webpack entry point, test files are added separatly by karma-webpack
  webpackConfig.externals = []  // Keep all the dependencies during the tests

  const testFiles = path.join(basePath, systematicConfig.test.file_pattern)

  const karmaConfig = {
    basePath: basePath,
    autoWatch: true, // Without this _in the config file_, plugins do not reload automatically
    browserNoActivityTimeout: 100000, // in ms, 100 seconds

    frameworks: ['jasmine', 'jasmine-matchers'],

    files: [
      basePath + '/node_modules/babel-polyfill/dist/polyfill.js',  // polyfill if we don't include the entrypoint
      testFiles,
    ],

    plugins: [
      'karma-jasmine',
      'karma-jasmine-matchers',
      'karma-jasmine-html-reporter',
      'karma-junit-reporter',
      'karma-webpack-error-reporter',
      'karma-chrome-launcher',
      'karma-sourcemap-loader',
      'karma-webpack',
    ],

    junitReporter: {
      outputFile: './reports/TEST-karma.xml',
      useBrowserName: false,
    },

    browsers: ['ChromeHeadless'],
    reporters: ['webpack-error'],

    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true,
      stats: 'errors-only',
    },
  }

  karmaConfig.preprocessors = {}
  karmaConfig.preprocessors[testFiles] = ['webpack', 'sourcemap']

  return karmaConfig
}
