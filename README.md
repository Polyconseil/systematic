# Systematic

An opinionated, mostly framework-agnostic toolchain to package ES6 applications and libraries for the browser.

**Features :**

  * Stay lazy: the toolchain already made the good choices for you.
  * Full ES6/PostCSS support through carefully selected & configured Webpack plugins.
  * Paranoid code linting & styling with [standard](https://github.com/feross/standard)
  * Framework-agnostic, standard (GNU gettext) translation file handling.
  * Application settings management, human-editable INI files get converted into JS.


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


## Entry points

* The default source folder (containing your source code and tests) is `src`. It must contain an entrypoint file named `index.js`. Example:

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


## Config file

* Systematic requires a `systematic.ini` configuration file in the root folder of your project. Find out all the available options in `systematic.example.ini`

# Usage

Systematic uses a Makefile. Get all commands with `make help`.

## Build

`make serve` to run a local server.
`make dist` for a prod build.

## Run tests

`make test` runs all test that match the test file pattern (default `**/*tests.js`).
`make livetest` run test continuously, when a file changes

## Translations

`make makemessages` generates translations using [easygettext](https://github.com/Polyconseil/easygettext).
The resulting `.po` files will be in `/locale`.

`make translations` generates a JSON file from them, located at dist/translations.json`.

You can then load them in your JS as an object:
```javascript
import translations from 'dist/translations.json'`
```

## Settings

`make settings` generates a file `dist/app.settings.js` if your project is an application.

It needs to be included in your index.html, since it will not be added by Webpack.

This method allows to change the settings without redeploying the app.


# Build profiles

From systematic.ini's `profile` option. For now, only the `angular` profile is supported on top of the
natural `vanilla` profile.

## Angular

Value : `angular`

Adds the [ng-annotate](https://github.com/olov/ng-annotate) loader.

# Override Karma or Webpack config

It's possible to override the build or test config by adding config files at the root of the projet.

* For Webpack: `webpack.config.js`. Example :

  ```javascript
  // import systematic default webpack settings
  const webpackDefaults = require('systematic').webpack_get_defaults(__dirname)

  // optional overrides (an example !)
  webpackDefaults.loader.push({ test: /\.file_extension_example$/, loaders: ['my-loader'] },)

  module.exports = webpackDefaults
  ```


* For Karma: `webpack.config.js`. Example:

  ```javascript
  // import systematic default karma settings
  const karmaDefaults = require('systematic').karma_get_defaults(__dirname)

  // optional overrides example
  karmaDefaults.plugins.push('my-plugin')

  module.exports = karma => karma.set(karmaDefaults)
  ```

# License

MIT
