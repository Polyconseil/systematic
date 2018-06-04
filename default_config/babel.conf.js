const babelDefaults = require('systematic').babel_get_defaults()

// optional overrides

module.exports = (babel) => babel.set(babelDefaults)
