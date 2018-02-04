## 1.3.0-beta.1
* Add support for event modifiers (e.g. `<div :keydown.enter.halt=...>`)
* Add support for form input bindings (e.g. `<input[data] model='myField'>`)
* Allow all attributes on svg elements
* Remove deprecated selector-syntax
* Remove deprecated methods on Imba.Tag (object,width,height,append,prepend,style,setStyle)
* Remove deprecated methods on Imba.Event (keychar,keycombo,source)
* Remove deprecated Imba.isClient and Imba.isServer
* Improve performance of setText
* Improve performance of non-keyed tag lists
* 30% smaller library (now 53k minified, 14k gzipped)

## 1.2.1
* Allow reconciler to work with tag-like objects
* Make Imba.commit notify schedulers
* Make sure schedulers are correctly activated and deactivated
* Fix issue where process.version was not parsed correctly
* Fix variable naming issue when compiling with sourceMaps
* Fix let scoping where assignment is consumed by statement
* Allow ivar-syntax in plain objects `{@ivar: value}`
* Allow direct ivar access through `object@ivar`

## 1.2.0
* Compile to native `let`,`const` and `await` unless `--es5` is specified
* Align `await` precedence with js
* Support variable shadowing
* Fix fat-arrow template parsing `<div.item => ...`

## 1.1.1
* Make `imbapack input.imba output.js` work without a config

## 1.1.0
* Introduce `module` keyword for singleton classes
* Allow aliasing imports with `import x as y from ...`
* Always escape attributes textContent when rendering on server

## 1.0.1
* Made Imbapack read options using the recommended way in Webpack 3.
* Made Imba.mount schedule the target by default (fix)
* Compiler returns correct location for classes and constants
* Enable experimental native async/await behind —es6 option
* Make imbapack commands platform-safe ([GavinRay97 · pr#102](https://github.com/somebee/imba/pull/102))
* Deprecated implicit `Promise.all` wrapping of expr in `await *expr*` if expr instanceof Array

## 1.0.0
* Require 'imba' in each file - no longer depending on Imba being global
* Introduced imbapack as intelligent wrapper around webpack
* Introduced non-global tags
* Allow multiple adjacent tags inside for-loops
* Add `tag.mount` and `tag.unmount`
* Allow setting css inline `<div css:height=100>`
* Deprecated selector syntax
* Deprecated various tag helpers
* Tons of bugfixes and improvements

## 0.14.5
* `tag.initialize` can now be defined / overridden
* Dynamic flags `<div .{flag}>` works as expected
* Added more missing attributes to html elements
* Allow defining properties with reserved names
* `prop watch:` now accepts a Function
* Minor bugfixes

## 0.14.4
* Add trailing semicolon to IIFE wrapper (#67)
* Allow uppercase flags in tag (#64)
* Setters return self by default (#56)
* CLI will find index.imba, if exists within folder
* Improved serverside rendering
* Predeclare `_` in global scope

## 0.14.3
* Mixing tabs and spaces for indentation will now throw error
* Internal refactoring
* Moved internal build over to webpack
* Bugfix: source maps should work again
* Bugfix: compilation on windows finds correct path

## 0.14.1
* Fixed regression for awakening tags from client
* Add width/height getters for tags
* Add context getter for canvas
* Removed deprecated code in dom.events
* Add `Imba.Touch#tx` and `Imba.Touch#ty` for pos relative to target
* Add Imba.Touch#capture for preventing all default behaviour of events
* Handle touchcancel correctly
* Deprecate Imba.Touch#suppress
* Bugfix: right-click caused havok with mousebased Imba.Touch
* Bugfix: watched attribute would not trigger correctly

## 0.14.0
* Removed IMBA_TAGS (must use Imba.TAGS)
* Groundwork for arbitrary namespaces for tags (and local/private tags)
* Added support for SVG
* attr definitions will preserve dash in generated setAttribute
* Removed description object for plain generated properties
* Allow nested tag definitions (local to the parent scope)


## 0.13.12
* Error now includes the relevant code/lines in message - contributed by @sleewoo
* Make scheduler register for next tick before running the current ticks
* Bugfix: Regression where methods with trailing comment did not parse

## 0.13.11
* tag(domnode) will awaken domnode as native type if the custom tag is not defined
* Bugfix: Parser should not treat `]` and `)` as implicit functions (issue#34)
* Allow methods without body to parse correctly (closes issue#35) 

## 0.13.10
* Bugfix: Regression where indented return broke certain tag trees
* Bugfix: if branches without else does not return 0 when false (inside tag trees)
* Bugfix: Improved error reporting in terminal

## 0.13.9
* Documented more of the runtime/stdlib
* Adding prelim support for static analysis of tags,classes,methods++
* `imba analyze` now takes `--entities` flag to export entities
* Removed several undocumented and deprecated methods
* Cleaned up code UglifyJS warned about when minifying runtime
* Add failing test for known scoping bug (fix is underway for next release)
* Bugfix: temp vars were declared (but not used) in certain situations

## 0.13.8
* Added scheduler for an official/approved way to schedule rendering

## 0.13.7
* Reworked tag rendering to work with non-string textual nodes again

## 0.13.5
* Fixed yet another regression

## 0.13.4
* Throw error when trying to spawn undefined tag
* Fix regression with serverside rendering from 0.13.3

## 0.13.3
* Optimized rendering further
* Bugfix: native tags no longer spawn with empty class attribute
* Bugfix: wrong cachekeys in certain nested trees
* Bugfix: (cond && <sometag>) were not cached in static trees
* Bugfix: numerous edgecases with static trees

## 0.13.2 (2015-10-09)

* cache tags in for-loops by default (inside static trees) 
* call render in tag#commit by default
* Improved sourcemaps
* Tap and click events handled in more consistent manner
* Added version of compiler that can run in a WebWorker
* Various bugfixes

## 0.13.1

* Rework tag class structure

## 0.13.0 (2015-09-19)

* Bugfix: safe call `object:key?.method` parses correctly
* Added support for data-attributes through tag#dataset method

## 0.12.2 (2015-09-18)

* Bugfix: parsing tags inside object literals
* Bugfix: methods with optional arg and block arg compiles correctly
* Bugfix: tag#prepend works for empty tag
* Internal refactoring

## 0.12.1 (2015-09-04)

* Fix standalone compiler for browser
* Renamed packaged compiler from compiler.js to imbac.js
* Export standalone compiler to `Imbac` instead of `imbalang`
* Returning self from default constructors

## 0.12.0 (2015-08-24)

* Preliminary support for source maps (through `--source-map-inline` option for ̀`imba watch` and `imba compile`)

## 0.11.6 (2015-08-23)

* Added `imba export-runtime` command to export the latest imba.js runtime.
* Fix `imba watch` on Windows (issue #11)

## 0.11.5 (2015-08-20)

* Don't single children in Imba.static
* Reworked how setHandler to bind directly to outer scope
* Guard against loading the library multiple times

## 0.11.4 (2015-08-19)

* Added minified version of library and compiler
* Remove need for classList (to support ie9)

## 0.11.3 (2015-08-15)

* Now caching static attributes on tags
* More improvements to reconciler

## 0.11.2 (2015-08-14)

* Added window, document, parseInt, parseFloat as implicit global variables

## 0.11.1 (2015-08-12)

* Fixed issue in dom reconciler

## 0.11.0 (2015-08-11)

* Allow `new` and `char` as varnames
* `tag#render` is called by default from `tag#build`
* Slightly improved error reporting when using `:` in control-flow (like python)
* Massively improved algorithm for reconciling dom trees (rendering for-loops etc  will now be much more efficient) - contributed by @judofyr
* Fixed issue when requiring imba through browserify

## 0.10.0 (2015-08-05)

* Add support for guarded loops: `... for x in ary when x > 10`
* Add dynamic cachekey for tags using `<node@{mykey}>` inside loops
* Add support for if/forin as first/only argument to implicit calls
* Fixed bug where for-in could not be the first/only indented child in a tag.
* Fixed regression with multiple nested parens in !(expressions)
* Improved error reporting from terminal

## 0.9.3 (2015-08-04)

* Register 'module' as an automatic global variable, along with 'global', '__dirname', 'exports', 'console', 'process', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'. The timeout/interval are likely to be deprecated in next version.
* added support for shebangs to top of files.
  `#!/usr/bin/env imba` or similar shebangs will be kept and converted in the compiled js (to `#!/usr/bin/env node` etc)
* Improved preservation of linebreaks, and removal of parens in compiled code.
