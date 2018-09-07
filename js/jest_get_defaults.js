/* Systematic's jest base config file */
// see https://facebook.github.io/jest/docs/en/configuration.html

'use strict'

const systematicConfig = require('./config')

module.exports = function (basePath) {
  return {
    moduleFileExtensions: [
      'js',
      'json',
      'vue',
    ],
    transform: {
      '.*\\.(vue)$': `${basePath}/node_modules/vue-jest`,
      '^.+\\.js$': `${basePath}/node_modules/systematic/js/babel_jest_transformer.js`,
      '^.+\\.html$': `${basePath}/node_modules/systematic/js/html_loader.js`,
    },
    transformIgnorePatterns: [
      'node_modules/(?!(cassets|vanitils)/)',
    ],
    modulePaths: [
      basePath,
    ],
    moduleNameMapper: {
      '\\.(css|less)$': 'identity-obj-proxy',
    },
    roots: [
      basePath,
    ],
    setupTestFrameworkScriptFile: systematicConfig.test.setup_script_file,
    testRegex: systematicConfig.test.file_pattern,
    globals: {
      "vue-jest": {
        babelRcFile: `${basePath}/node_modules/systematic/default_config/babelrc`,
      },
      "__TEST__": true,
    },
  }
}
