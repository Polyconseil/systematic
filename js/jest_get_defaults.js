/* Systematic's jest base config file */
// see https://facebook.github.io/jest/docs/en/configuration.html

'use strict'

const path = require('path')

const systematicConfig = require('./config')
const babelDefaults = require('./babel_get_defaults.js')()

module.exports = function (basePath) {
  basePath = path.normalize(basePath)
  return {
    collectCoverageFrom: [
      '{src,lib}/**/*.{js,jsx,vue}',
    ],
    coveragePathIgnorePatterns: ['/node_modules/', 'index.js', 'spec.js', 'test.js'],
    moduleFileExtensions: [
      'js',
      'json',
      'vue',
    ],
    transform: {
      '.*\\.(vue)$': `${basePath}/node_modules/vue-jest`,
      '^.+\\.js$': `${basePath}/node_modules/systematic/js/babel_jest_transformer.js`,
      '^.+\\.html$': `${basePath}/node_modules/systematic/js/html_loader.js`,
      '^.+\\.pug$': `${basePath}/node_modules/pug-jest`,
    },
    transformIgnorePatterns: [
      'node_modules/(?!(cassets|vanitils)/)',
    ],
    modulePaths: [
      basePath,
    ],
    moduleNameMapper: {
      '\\.(sass|scss|css|less)$': 'identity-obj-proxy',
    },
    rootDir: basePath,
    setupTestFrameworkScriptFile: systematicConfig.test.setup_script_file,
    testRegex: systematicConfig.test.file_pattern,
    globals: {
      'vue-jest': {
        babelConfig: babelDefaults,
      },
      '__TEST__': true,
    },
  }
}
