const fs = require('fs')

const defaultsDeep = require('lodash.defaultsdeep')
const ini = require('ini')


const systematic = ini.parse(fs.readFileSync('./systematic.ini', 'utf-8'))

defaultsDeep(systematic, {
  build: {
    src_dir: 'src',
    output_dir: 'dist',
    public_path: '/',
    enable_filename_hashing: true,
    enable_babel: true,
    es_libs: [],
  },
  serve: {
    // FIXME(vperron): This configuration comes in double with the one from the makefile.
    host: '0.0.0.0',
    port: 8080,
  },
})

defaultsDeep(systematic, {
  test: {
    file_pattern: systematic.build.src_dir + '/**/*tests.js',
  },
})

module.exports = systematic
