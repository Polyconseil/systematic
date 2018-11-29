Changes
=======


Version 2.3.0
------------
- Enable tree-shaking.
- Bump to babel 7.
- Fix Vue file linting.
- Add coverage on Jenkins targets.
- Support dynamic import() statements in the code.
- Switch to easygettext for all our code translations.


Version 2.2.0
------------
- Allow usage of .pug preprocessor. Fix a bug with last versions of vue-loader.

Version 2.1.8
-------------
- Allow usage of async generator functions with jest test engine.

Version 2.1.7
-------------
- Allow using Jest instead of Karma for tests
- Allow to pass arguments to `make test` when using Jest (e.g. to filter the tests being run)

Version 2.0.0
-------------
- Switch to Webpack 4, which brings in quite a lot of changes. Probably your app will need some tuning.
- Switch to the latest version of vue-loader also; deep changes for all Vue applications are possible.

Version 1.12.0
--------------
- Add a "keep_dependency" feature and document the "component" target better.

Version 1.11.0
--------------
- Fix an issue with easygettext and node10

Version 1.10.3
--------------
- Fix boolean cast for ini files


Version 1.10.1
--------------
- Fix eslint-plugin-html dependency on eslint

Version 1.10.0
--------------
- Fix a bug with source maps: use inline source maps.
- Bump every package; allow for Vue message extraction (also if template language is pug/jade)

Version 1.9.5
-------------
- Fix a regression preventing NODE_ENV to be passed to uglifyjs

Version 1.9.4
-------------
- Completely remove HardSourcePlugin

Version 1.9.3
-------------
- Keep HardSourcePlugin only for tests

Version 1.9.2
-------------
- Karma: Enable running Chrome without a sandbox

Version 1.9.1
-------------
- Karma conf: Allow CHROME_BIN as environment variable

Version 1.9.0
-------------
- Do not "build" libraries anymore. Libraries are distributed as modules.
- Speedup builds: use Chrome Headless & various optimizations
- Remove useless Babel polyfill & Karma.
- Add a non-mandatory "noParse" field in the config to not parse some huge dependencies.
- Massive dependencies update.

Version 1.7.1
-------------
- Downgrade 'file-loader' to 0.11.2. ('css-loader' is incompatible with 'file-loader' 1.0.0)

Version 1.7.0
-------------
- Add source-map-loader to import dependencie's source maps when building your application.
- Bump webpack to 3.4 and a bunch of other dependencies in the same movement.
- Fix the tests, which were broken since a long time.
- Get package-lock.json out of .gitignore now that it's correctly handled by NPM.

Version 1.5.0
-------------
- Ugrade ng-annotate-webpack to babel-plugin-angularjs-annotate (fixes angular builds)

Version 1.4.1
-------------
- Fix: include '.eslintrc' while packaging systematic (it's needed to run 'make syntax')
- Fix: (mk) includes .vue in gettext sources

Version 1.4.0
-------------
- main.mk: delete temp makemessages file
- Stopped opening a new tab on "make serve".
- Compile .vue files with vue-loader
- Use eslint on .vue files
- Fail loudly if index.html is missing

Version 1.3.1
-------------
- Fix serve host: forgot the one in the makefile

Version 1.3.0
-------------

- devtool: Use cheap-module-source-map as it's the only one that works.
- Make the default serve path be '/' unless configured otherwise.
- Use 0.0.0.0 as the default host.
- dist: Replace '--optimize-minimize' with '-p', more standard.
- Freeze dependencies wich were not frozen
- Add 'transform-runtime' to avoid standardization issues in production

Version 1.1.0
-------------

- add a new boolean option in systematic.ini (enableFileNameHashing) to disable filenames hashing if needed.
- speedup `make serve`
- update dependencies and support es2016, es2017
- remove deprecation warnings

Version 1.0.9
-------------

- ini2js now merges entries of the same section.
- Started this changelog. :-)
