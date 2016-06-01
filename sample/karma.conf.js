const karmaDefaults = require('systematic').karma_get_defaults(__dirname)

// optional overrides

module.exports = (karma) => karma.set(karmaDefaults)
