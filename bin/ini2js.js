#!/usr/bin/env node

/* Converts .ini files to a JS script executable in a browser. */

'use strict';
const fs = require('fs');
const ini = require('ini');
const minimist = require('minimist');
const util = require('util');


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
      config[section][key] = parsed[section][key];
    }
  }
});

console.log(util.format('window.%s = %s;', namespace, JSON.stringify(config)));
