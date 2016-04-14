# Systematic

An opinionated toolchain to package ES6 applications and libraries.

# Installation

`npm install systematic`

Your file structure:

```
├── dist
│   └── bundle.js         # result of the build
├── src
│    ├── module_1         # your modules
│    ├── module_2
│    ├── index.html       # only for an application
│    └── index.js         # JS entry point
└── systematic.ini        # systematic config
```

## Entry point

* The default source folder (containing your source code and tests) is `src`. It must contain an entrypoint file named `index.js`. Example:

  ```javascript
  import './module_1'
  import './module_2'
  ```

* If your project is an application, there must be an HTML entry point named `index.html` in the source folder, containing the primary page. Example:

  ```html
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Your website</title>
    </head>
    <body>
      <!-- Some application bootstrap !-->
    </body>
  </html>
  ```

## Config files

* Define the webpack config: create a file `webpack.config.js` at the root of the projet. Example:

  ```javascript
  // import systematic default webpack settings
  const webpackDefaults = require('systematic').webpack_get_defaults(__dirname)

  // optional overrides example
  webpackDefaults.loader.push({ test: /\.file_extension_example$/, loaders: ['my-loader'] },)

  module.exports = webpackDefaults
  ```


* Define the karma config: create a file `webpack.config.js` at the root of the projet. Example:

  ```javascript
  // import systematic default karma settings
  const karmaDefaults = require('systematic').karma_get_defaults(__dirname)

  // optional overrides example
  karmaDefaults.plugins.push('my-plugin')

  module.exports = karma => karma.set(karmaDefaults)
  ```

* Systematic requires a `systematic.ini` configuration file in the root folder of your project. Find out all the available options in `systematic.example.ini`


# Usage

Systematic uses a makefile, get all commands with `make help`.

## Build

`make serve` to run a local server.
`make dist` for a prod build.

## Run tests

`make test` runs all test that match the test file pattern (default `**/*tests.js`).
`make livetest` run test continuously, when a file changes

## Translations

`make makemessages` generates translations using [easygettext](https://github.com/Polyconseil/easygettext).
The resulting `.po` files will be in `/locale`.
`make translations` generates a JSON file from them, located at <YOUR_SOURCE_FOLDER>/translations.json`.


# Profiles

## Angular

The angular profile add the ng-annotate loader.
FIXME(rboucher)
`ng-annotate` **does not support arrow functions** for now.


# Source map issue

FIXME(rboucher,vperron)
Source maps does not seem to work very well on `make dist`. We tried:

 * This issue only happen when the flag `--optimize-minimize` is given
 * Use `webpack.optimize.UglifyJsPlugin` instead of `--optimize-minimize`
 * There is a warning in bluetils-js with ui-router source map missing, but is does not seem to be the root of the problem.
