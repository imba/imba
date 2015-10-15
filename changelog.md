## 0.13.3
- Optimized rendering further
- Bugfix: native tags no longer spawn with empty class attribute
- Bugfix: wrong cachekeys in certain nested trees
- Bugfix: (cond && <sometag>) were not cached in static trees
- Bugfix: numerous edgecases with static trees

## 0.13.2 (2015-10-09)

- cache tags in for-loops by default (inside static trees) 
- call render in tag#commit by default
- Improved sourcemaps
- Tap and click events handled in more consistent manner
- Added version of compiler that can run in a WebWorker
- Various bugfixes

## 0.13.1

- Rework tag class structure

## 0.13.0 (2015-09-19)

- Bugfix: safe call `object:key?.method` parses correctly
- Added support for data-attributes through tag#dataset method

## 0.12.2 (2015-09-18)

- Bugfix: parsing tags inside object literals
- Bugfix: methods with optional arg and block arg compiles correctly
- Bugfix: tag#prepend works for empty tag
- Internal refactoring

## 0.12.1 (2015-09-04)

- Fix standalone compiler for browser
- Renamed packaged compiler from compiler.js to imbac.js
- Export standalone compiler to `Imbac` instead of `imbalang`
- Returning self from default constructors

## 0.12.0 (2015-08-24)

- Preliminary support for source maps (through `--source-map-inline` option for ̀`imba watch` and `imba compile`)

## 0.11.6 (2015-08-23)

- Added `imba export-runtime` command to export the latest imba.js runtime.
- Fix `imba watch` on Windows (issue #11)

## 0.11.5 (2015-08-20)

- Don't single children in Imba.static
- Reworked how setHandler to bind directly to outer scope
- Guard against loading the library multiple times

## 0.11.4 (2015-08-19)

- Added minified version of library and compiler
- Remove need for classList (to support ie9)

## 0.11.3 (2015-08-15)

- Now caching static attributes on tags
- More improvements to reconciler

## 0.11.2 (2015-08-14)

- Added window, document, parseInt, parseFloat as implicit global variables

## 0.11.1 (2015-08-12)

- Fixed issue in dom reconciler

## 0.11.0 (2015-08-11)

- Allow `new` and `char` as varnames
- `tag#render` is called by default from `tag#build`
- Slightly improved error reporting when using `:` in control-flow (like python)
- Massively improved algorithm for reconciling dom trees (rendering for-loops etc  will now be much more efficient) - contributed by @judofyr
- Fixed issue when requiring imba through browserify

## 0.10.0 (2015-08-05)

- Add support for guarded loops: `... for x in ary when x > 10`
- Add dynamic cachekey for tags using `<node@{mykey}>` inside loops
- Add support for if/forin as first/only argument to implicit calls
- Fixed bug where for-in could not be the first/only indented child in a tag.
- Fixed regression with multiple nested parens in !(expressions)
- Improved error reporting from terminal

## 0.9.3 (2015-08-04)

- Register 'module' as an automatic global variable, along with 'global', '__dirname', 'exports', 'console', 'process', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'. The timeout/interval are likely to be deprecated in next version.
- added support for shebangs to top of files.
  `#!/usr/bin/env imba` or similar shebangs will be kept and converted in the compiled js (to `#!/usr/bin/env node` etc)
- Improved preservation of linebreaks, and removal of parens in compiled code.
