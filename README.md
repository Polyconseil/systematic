# Systematic

An opinionated, mostly framework-agnostic toolchain to package ES6 applications and libraries for the browser.

**Features :**

  * Stay lazy: the toolchain already made the good choices for you.
  * Full ES6 & PostCSS support through carefully selected & configured Webpack plugins.
  * Paranoid code linting & styling with [standard](https://github.com/feross/standard)
  * Framework-agnostic, standard (GNU gettext) translation file handling.
  * Application settings management, human-editable INI files get converted into JS.
  * Library creation, with dependencies exclusion from build
  * Pluggable: it's easy to add commands or override features


# Installation

`npm install systematic`

The file structure expected for your application or library.

```bash
├── dist                  # what gets built
│   ├── app.settings.js
│   ├── bundle.js
│   ├── bundle.js.map
│   ├── translations.json
│   ├── an_asset.png
│   └── index.html
|
├── src                   # your code
│    ├── some_module/
|    |      ├── enums.js
|    |      ├── index.js
|    |      ├── index.spec.js
|    |      └── models.js
|    |
│    ├── utils.js
│    ├── index.html       # HTML entry point (applications)
│    ├── index.spec.js    # A test spec file
│    └── index.js         # JS entry point
|
├── webpack.config.js     # Webpack config, inherits systematic's
├── karma.config.js       # Karma config, inherits systematic's
├── Makefile              # Your application's Makefile
└── systematic.ini        # systematic config
```


## Config file

* Systematic requires a `systematic.ini` configuration file in the root folder of your project.

  ```ini
  [build]
  ; Mandatory
  ; Project type, can be application or library. An app will need an HTML entry point
  type = library
  ; Optional, default: vanilla
  ; Build profile, can be angular, vue...
  profile = vanilla
  ; Optional, default: dist
  ; The relative path for the build output, defaults to dist
  output_dir = dist
  ; Optional, default: src
  ; The relative path to the source dir
  src_dir = src
  ; Optional, default: /
  ; The path where the application will be hosted in production (eg. '/app/')
  public_path = /
  ; Optional, default is blank
  ; The locales to generate translation files
  locales = en_US en_GB

  [serve]
  ; Interface to listen
  host = 127.0.0.1
  ; Optional, default: 8080
  ; The network port to access local website, if it's an app
  port = 8080

  [test]
  ; Optional, default: <YOUR_SRC_DIR>/**/*tests.js
  ; All files matching this pattern will be processed with karma
  ; It is relative to the root given to the karma config, usually the project root
  file_pattern = src/**/*tests.js
  ```

## Makefile

Systematic uses GNU `make`. Create a Makefile at the root of your project, to import systematic commands:

  ```makefile
  include node_modules/systematic/mk/main.mk

  # Your own commands
  ```


## Entry points

* The default source folder (containing your source code and tests) is `src`. It must contain an entrypoint file named `index.js`. Example:

  ```javascript
  import somelib from 'some-lib'
  import m1 from './module1'
  import m2 from './module1'

  // Bootstrap your project here
  somelib.bootstrap(m1, m2)
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


# Usage

`make help` gives a list of all commands.

## Build

`make serve` to run a local server.
`make dist` for a prod build.

## Run tests

`make test` runs all test that match the test file pattern (default `**/*tests.js`).
`make livetest` run test continuously, when a file changes.

## Translations

`make makemessages` extract translations from your HTML and JS files using [easygettext](https://github.com/Polyconseil/easygettext).
The resulting `.po` files will be in `/locale`.

`make translations` generates a JSON file from them, located at dist/translations.json`. It is automatically run with `serve`, `dist` and `test`.

You can then load them in your JS as an object:
```javascript
import translations from 'dist/translations.json'`
```

## Settings

`make settings` generates a file `dist/app.settings.js` from all INI files in `src/settings/` if your project is an application.
Settings files are processed in alphabetical order, the last one overriding the previous. It is automatically run with `serve`, `dist` and `test`.

**The generated file `dist/app.settings.js` needs to be included in your index.html, since it will not be added by Webpack.**

After the app is deployed, you might want to change the settings. This part is not handled by systematic, but we recommand to regenerate the settings from INI files.
INI files are an ideal format, as it is not error prone, ensures only settings values are changed and no javascript is added.

# Build profiles

From systematic.ini's `profile` option. For now, only the `angular` profile is supported on top of the
natural `vanilla` profile.

## Angular

Value : `angular`

Adds the [ng-annotate](https://github.com/olov/ng-annotate) loader.

## VueJS

Value : `vue`

Adds translation management with the vue translation token.

# Override Karma or Webpack config

It's possible to override the build or test config by adding config files at the root of the projet.

* For Webpack: `webpack.config.js`. Example :

  ```javascript
  // import systematic default webpack settings
  const webpackDefaults = require('systematic').webpack_get_defaults(__dirname)

  // optional overrides (an example !)
  webpackDefaults.module.loaders.push({ test: /\.file_extension_example$/, loader: 'my-loader' })

  module.exports = webpackDefaults
  ```


* For Karma: `karma.conf.js`. Example:

  ```javascript
  // import systematic default karma settings
  const karmaDefaults = require('systematic').karma_get_defaults(__dirname)

  // optional overrides example
  karmaDefaults.plugins.push('my-plugin')

  module.exports = karma => karma.set(karmaDefaults)
  ```

# Building libraries

When building a library, we don't want the dependencies included in the bundle. It can cause version conflict with other packages or duplicated library imports.

Systematic will set all dependencies as webpack "externals", which means they have to be required by the app.


# Troubleshooting

## Webpack's livereload is not working properly

You should probably allow more watchers on your machine, see how [on webpack's
doc](https://webpack.github.io/docs/troubleshooting.html#not-enough-watchers).


# License

MIT
