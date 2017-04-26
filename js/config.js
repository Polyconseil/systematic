const fs = require('fs')

const _ = require('lodash')
const ini = require('ini')


const systematic = ini.parse(fs.readFileSync('./systematic.ini', 'utf-8'))

_.defaultsDeep(systematic, {
  build: {
    src_dir: 'src',
    output_dir: 'dist',
    public_path: '/',
    enable_filename_hashing: true,
  },
  serve: {
    host: '0.0.0.0',  // default of python server. No clear arguments why should be 127.0.0.1.
    port: 8080,
  },
})

_.defaultsDeep(systematic, {
  test: {
    file_pattern: systematic.build.src_dir + '/**/*tests.js'
  },
})

module.exports = systematic
