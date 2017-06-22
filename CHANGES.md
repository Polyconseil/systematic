Changes
=======

Next version (not yet released)
-------------------------------

- Stopped opening a new tab on "make serve".
- Compile .vue files with vue-loader

Version 1.3.0
-------------
- devtool: Use cheap-module-source-map as it's the only one that works. (by Victor Perron 14 hours ago)
- Make the default serve path be '/' unless configured otherwise. (by Victor Perron 14 hours ago)
- Use 0.0.0.0 as the default host. (by Victor Perron 14 hours ago)
- dist: Replace '--optimize-minimize' with '-p', more standard. (by Victor Perron 2 weeks ago)
- Freeze dependencies wich were not frozen (by Victor Perron 3 weeks ago)
- Add 'transform-runtime' to avoid standardization issues in production (by Victor Perron 3 weeks ago)

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
