const projectPath = require('./project_path')
const fs = require('fs')
const webpackConfigDefaultPath = projectPath + '/webpack.config.js'
let webpackConfig = null
if (fs.existsSync(webpackConfigDefaultPath)) {
  webpackConfig = require(webpackConfigDefaultPath)
}
const karmaDefaults = require('systematic').karma_get_defaults(projectPath, webpackConfig)

// optional overrides

module.exports = (karma) => karma.set(karmaDefaults)
