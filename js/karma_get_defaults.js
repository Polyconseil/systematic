
const webpackGetDefaults = require('./webpack_get_defaults')
const systematicConfig = require('./config')

module.exports = function(basePath) {
  const webpackConfig = webpackGetDefaults(basePath)
  webpackConfig.devtool = 'inline-source-map'

  const testFiles = systematicConfig.build.src_dir + '/**/*tests.js'

  const karmaConfig =  {
    basePath: basePath,
    // Without this _in the config file_, plugins do not reload automatically
    autoWatch: true,

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
    reporters: ['coverage', 'junit', 'mocha'],

    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true,
    },
  }

  karmaConfig.preprocessors = {}
  karmaConfig.preprocessors[testFiles] = ['webpack', 'sourcemap', 'coverage']

  return karmaConfig
}
