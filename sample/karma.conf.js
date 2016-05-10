const karmaDefaults = require('systematic').karma_get_defaults(__dirname)

// eventual overrides

module.exports = (karma) => karma.set(karmaDefaults)
