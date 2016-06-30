const projectPath = require('./project_path')
const karmaDefaults = require('systematic').karma_get_defaults(projectPath)

// optional overrides

module.exports = (karma) => karma.set(karmaDefaults)
