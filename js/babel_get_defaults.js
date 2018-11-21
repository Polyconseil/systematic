/* Systematic's babel base config file */
// see https://github.com/babel/babel/blob/master/babel.config.js

'use strict'

module.exports = function () {
  return {
    'plugins': [
      '@babel/plugin-transform-runtime'
    ],
    'env': {
      'test': {
        'plugins': [
          'dynamic-import-node'
        ],
        'presets': [
          ['@babel/preset-env', {'targets': { 'node': 'current' }}]
        ]
      },
    },
  }
}
