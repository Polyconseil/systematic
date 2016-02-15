const htmlDist = require('html-dist')
const path = require('path')

module.exports = function(basePath) {
  return {
    outputFile: path.join(basePath, 'dist/index.html'),
    minify: true,
    head: {
      remove: 'script'
    },
    body: {
      appends: [
        (0, htmlDist.script)({
          src: 'bundle.js'
        }),
      ]
    }
  }
}
