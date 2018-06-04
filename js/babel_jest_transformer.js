const babelDefaults = require('systematic').babel_get_defaults()

module.exports = require('babel-jest').createTransformer(babelDefaults);
