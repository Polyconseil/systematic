# Systematic

An opinionated toolchain to package ES6 applications and libraries.

# Installation

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

* The default source folder (containing your source code and tests) is `src`. It must contain an entrypoint file named `index.js`. Example:

  ```javascript
  import './module_1'
  import './module_2'
  ```

* Define the webpack config: create a file `webpack.config.js` at the root of the projet. Example:

  ```javascript
  const webpackDefaults = require('systematic').webpack_get_defaults(__dirname)

  // optional overrides
  webpackDefaults.loader.push({ test: /\.sass$/, loaders: ['style', 'css', 'postcss-loader', 'sass?sourceMap&indentedSyntax=true'] },)

  module.exports = webpackDefaults
  ```

* Define the karma config: create a file `webpack.config.js` at the root of the projet. Example:

  ```javascript
  const karmaDefaults = require('systematic').karma_get_defaults(__dirname)

  // optional overrides
  karmaDefaults.plugins.push('my-plugin')

  module.exports = karma => karma.set(karmaDefaults)

  ```

* Systematic requires a `systematic.ini` configuration file in the root folder of your project. Find out all the available options in `systematic.example.ini`
* If the project is an app, there must be an HTML entry point named `index.html` in the source folder, containing the primary page. Example:

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
