/* Systematic's jest base config file */
// see https://facebook.github.io/jest/docs/en/configuration.html

'use strict'

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
    },
    transformIgnorePatterns: [
      'node_modules/(?!(cassets|vanitils)/)',
    ],
    modulePaths: [
      basePath,
    ],
    moduleNameMapper: {
      '\\.(html|css|less)$': 'identity-obj-proxy',
    },
    roots: [
      basePath,
    ],
    testRegex: '.spec.js',
    globals: {
      "vue-jest": {
        babelRcFile: `${basePath}/node_modules/systematic/default_config/babelrc`,
      },
    },
  }
}
