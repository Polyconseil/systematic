#!/usr/bin/env node

/* Converts .ini files to a JS script executable in a browser. */

'use strict';
const fs = require('fs');
const util = require('util');

const ini = require('ini');
const minimist = require('minimist');


function cast(value) {
  try {
    return JSON.parse(value.toLowerCase());
  } catch (e) {
   return value;
  }
}

// Parameters
const argv = minimist(process.argv.slice(2));
const filenames = argv._.sort() || ['src/settings.ini'];
const namespace = argv.namespace || '__SETTINGS__';

// Merge all settings together
const config = {};
filenames.forEach(function(filename) {
  const parsed = ini.decode(fs.readFileSync(filename, 'utf-8'));
  for (var section in parsed) {
    config[section] = config[section] || {};
    for (var key in parsed[section]) {
      const strValue = parsed[section][key];
      config[section][key] = cast(strValue);
    }
  }
});

console.log(util.format('window.%s = %s;', namespace, JSON.stringify(config)));
