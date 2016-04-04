const fs = require('fs')

const _ = require('lodash')
const ini = require('ini')


const systematic = ini.parse(fs.readFileSync('./systematic.ini', 'utf-8'))

_.defaultsDeep(systematic, {
  build: {
    src_dir: 'src',
    output_dir: 'dist',
  },
  serve: {
    port: 8080,
  }
})

module.exports = systematic
