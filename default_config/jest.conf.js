const projectPath = require('./project_path')
const jestDefaults = require('systematic').jest_get_defaults(projectPath)

// optional overrides

module.exports = jestDefaults
