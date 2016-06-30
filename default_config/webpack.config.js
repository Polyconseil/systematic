const projectPath = require('./project_path')
const webpackDefaults = require('systematic').webpack_get_defaults(projectPath)

// optional overrides

module.exports = webpackDefaults
