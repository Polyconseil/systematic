/* Systematic's babel base config file */
// see https://github.com/babel/babel/blob/master/babel.config.js

'use strict'
const { readFileSync } = require('fs')

module.exports = function () {
  return JSON.parse(readFileSync(__dirname + '/../default_config/babelrc'))
}
