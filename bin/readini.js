#!/usr/bin/env node

'use strict'

// Usage: readini group.field filename.ini --default optional_default_value

const fs = require('fs');
const ini = require('ini');
const util = require('util');

// Parameters
const argv = require('minimist')(process.argv.slice(2))
const filename = argv._.shift()
const field = argv._.shift()
const defaultValue = argv.default ? argv.default : undefined

// Read file
const fileContent = ini.parse(fs.readFileSync(filename, 'utf-8'))
let value = _.get(fileContent, field)

if (value === undefined) {
  if (defaultValue === undefined) process.exit(1)
  value = defaultValue
}

console.log(value)
