const path = require('path')

const systematicConfig = require('./config')
const webpackGetDefaults = require('./webpack_get_defaults')


module.exports = function(basePath) {
  const webpackConfig = webpackGetDefaults(basePath)
  // fast rebuild, see https://webpack.github.io/docs/configuration.html#devtool
  // complete source maps are very slow
  webpackConfig.devtool = 'cheap-module-eval-source-map'
  webpackConfig.entry = {}  // Reset the webpack entry point, test files are added separatly by karma-webpack

  const testFiles = path.join(systematicConfig.build.src_dir, systematicConfig.test.file_pattern)

  const karmaConfig =  {
    basePath: basePath,
    autoWatch: true, // Without this _in the config file_, plugins do not reload automatically
    browserNoActivityTimeout: 100000, // in ms, 100 seconds

    frameworks: ['jasmine', 'jasmine-matchers', 'phantomjs-shim'],

    files: [
      'node_modules/babel-polyfill/dist/polyfill.js',  // polyfill if we don't include the entrypoint
      testFiles,
    ],

    plugins: [
      'karma-coverage',
      'karma-jasmine',
      'karma-jasmine-matchers',
      'karma-jasmine-html-reporter',
      'karma-junit-reporter',
      'karma-mocha-reporter',
      'karma-phantomjs-launcher',
      'karma-phantomjs-shim',
      'karma-sourcemap-loader',
      'karma-webpack',
    ],

    // Reporter options
    coverageReporter: {
      reporters: [
        {
          type: 'text-summary',
        },
        {
          type: 'cobertura',
          dir: 'reports',
          subdir: '.',
          file: 'xmlcov.xml',
        },
      ],
    },

    junitReporter: {
      outputFile: './reports/TEST-karma.xml',
      useBrowserName: false,
    },

    mochaReporter: {
      ignoreSkipped: true,
    },

    browsers: ['PhantomJS'],
    reporters: ['junit', 'mocha', 'html', 'coverage'],

    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true,
    },
  }

  karmaConfig.preprocessors = {}
  karmaConfig.preprocessors[testFiles] = ['webpack', 'sourcemap', 'coverage']

  return karmaConfig
}
