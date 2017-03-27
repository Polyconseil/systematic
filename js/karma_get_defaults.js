const path = require('path')

const systematicConfig = require('./config')


module.exports = function (basePath, _webpackConfig) {

  const webpackConfig = _webpackConfig || require('./webpack_get_defaults')(basePath)

  // Inline source maps, without columns & simple sourcemaps for loaders
  webpackConfig.devtool = 'inline-source-map'
  webpackConfig.entry = function () { return {} }  // Reset the webpack entry point, test files are added separatly by karma-webpack
  webpackConfig.externals = []  // Keep all the dependencies during the tests

  const testFiles = path.join(basePath, systematicConfig.test.file_pattern)

  const karmaConfig = {
    basePath: basePath,
    autoWatch: true, // Without this _in the config file_, plugins do not reload automatically
    browserNoActivityTimeout: 100000, // in ms, 100 seconds

    // configure karma to be able to use chromium as test launcher
    customLaunchers: {
      ChromeNoSandboxHeadless: {
        base: 'Chromium',
        flags: [
          '--no-sandbox',
          // See https://chromium.googlesource.com/chromium/src/  /lkgr/headless/README.md
          '--headless',
          '--disable-gpu',
          // Without a remote debugging port, Google Chrome exits immediately.
          ' --remote-debugging-port=9222',
        ],
      },
    },

    frameworks: ['jasmine', 'jasmine-matchers', 'phantomjs-shim'],

    files: [
      basePath + '/node_modules/babel-polyfill/dist/polyfill.js',  // polyfill if we don't include the entrypoint
      testFiles,
    ],

    plugins: [
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-jasmine-matchers',
      'karma-jasmine-html-reporter',
      'karma-junit-reporter',
      'karma-webpack-error-reporter',
      'karma-phantomjs-launcher',
      'karma-phantomjs-shim',
      'karma-sourcemap-loader',
      'karma-webpack',
    ],

    junitReporter: {
      outputFile: './reports/TEST-karma.xml',
      useBrowserName: false,
    },

    browsers: ['PhantomJS', 'ChromeNoSandboxHeadless'],
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
