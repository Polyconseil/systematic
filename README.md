# Systematic

An opinionated toolchain to package ES6 applications and libraries.

**Features :**

  * Import all kind of file and output a bundle thanks to Webpack
  * Full es6 support
  * Code style and linting with [standard](https://github.com/feross/standard)
  * Translations management
  * Settings management


# Installation

`npm install systematic`

Your file structure:

```
├── dist                  # result of the build
│   └── bundle.js
│   └── index.html
├── src
│    ├── module_1         # your modules
│    ├── module_2
│    ├── index.html       # HTML entry point, only for an application
│    └── index.js         # JS entry point
└── systematic.ini        # systematic config
```


## Entry point

* The default source folder (containing your source code and tests) is `src`. It must contain an entrypoint file named `index.js`. Example:

  ```javascript
  import './module_1'
  import './module_2'
  ```

* If your project is an application, there must be an HTML entry point named `index.html` in the source folder, containing the primary page. Your JS entry point will be automatically added.
Example:

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

* Systematic requires a `systematic.ini` configuration file in the root folder of your project. Find out all the available options in `systematic.example.ini`

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

`make translations` generates a JSON file from them, located at <YOUR_DIST_FOLDER>/translations.json`.

You can then load them in your JS as an object:
```javascript
import translations from 'dist/translations.json'`
```

## Settings

`make settings` generates a file `<YOUR_DIST_FOLDER>/app.settings.js` if your project is an application.

It needs to be included in your index.html, since it will not be added by Webpack.

This method allows to change the settings without redeploying the app.


# Build profiles

From systematic.ini's `profile` option. For now, only the `angular` profile is supported on top of the
natural `vanilla` profile.

## Angular

Value : `angular`

Adds the [ng-annotate](https://github.com/olov/ng-annotate) loader.


# TODO

## Add a sample project on Github.

## Source Maps issue

Source maps does not seem to work very well on `make dist`. We tried:

 * This issue only happen when the flag `--optimize-minimize` is given
 * Use `webpack.optimize.UglifyJsPlugin` instead of `--optimize-minimize`
 * There is a warning in bluetils-js with ui-router source map missing, but is does not seem to be the root of the problem.


# License

MIT
