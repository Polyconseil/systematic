Changes
=======
Next version (not yet released)
-------------------------------

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
