## 2.0.0-alpha.140
* Improve output from `imba create`

## 2.0.0-alpha.139
* Stop bundler from crashing when generating worker

## 2.0.0-alpha.138
* Fix incorrect sourcemap paths with esbuild 0.9.7
* Let server fail gracefully when accessing invalid asset urls

## 2.0.0-alpha.137
* Fix relative path for mac/linux

## 2.0.0-alpha.136
* Raise default browser-target from `edge16` to `edge18` due to esbuild warning
* Make `imba create` executable on mac (#550)
* Set default esbuild target to es2019 to transpile optional chaining++
* Avoid using `-ad` in generated class-names due to adblockers (#531)

## 2.0.0-alpha.135
* Minor improvements to sourcemapping
* Fixed `import type default` compilation

## 2.0.0-alpha.133
* Improved sourcemapping
* Improved support for type annotations
* Fixed crash in bundler

## 2.0.0-alpha.132
* Improve windows compatibility for bundler and `imba create`

## 2.0.0-alpha.131
* Serve hashed (cacheable) assets with `Cache-Control: max-age=31536000`
* Remove `?v=xxxxxx` suffix from asset references generated with `--no-hashing`
* Allow `"external":["builtins",...]` to externalize builtin node modules for other platforms than `node`
* Add `-H` alias for the `--no-hashing` option

## 2.0.0-alpha.130
* Upgraded esbuild to v0.9.2
* Automatically polyfill built-in node modules like buffer,stream,crypto etc when compiling for browser. Still experimental.

## 2.0.0-alpha.129
* Prevent `touchstart` event on iPad Pro in `@touch.prevent`
* Fixed text in svg `<text>` elements (#482)

## 2.0.0-alpha.128
* Fixed image asset urls in SSR
* Make bundler work with client entrypoint without any styles
* Dispatch bubbling `resized` event from ResizeObserver

## 2.0.0-alpha.127
* Overhauled `@touch` to work be more consistent on touch devices
* Add `@touch.round` event modifier

## 2.0.0-alpha.126
* Prevent `touchstart` event on iOS in `@touch.prevent`

## 2.0.0-alpha.125
* Make custom events cancelable by default
* Make `@-webkit-scrollbar-*` style selectors work
* Make core event modifiers work for `@touch` event
* Fix issue where text selection did not work after `@touch`
* Make `@touch.prevent` prevent scrolling via `touch-action:none`
* Add `@important` style modifier

## 2.0.0-alpha.124
* Update built-in colors to follow Tailwind 2.0
* Allow interpolating colors in runtime `<div[c:{mycolor}]>`
* Fix deep selector `>>>` with multiple nested children

## 2.0.0-alpha.123
* Fix router crashing when event-related runtime code is tree-shaken

## 2.0.0-alpha.122
* Fix issue with type inferencing tags in certain cases
* Add `suspend`, `unsuspend` component lifecycle methods
* Improved router interface & internals

## 2.0.0-alpha.121
* Added `imba.serve` to `index.d.ts` 
* Fix serious regression in router causing crash

## 2.0.0-alpha.120
* Parse `fn await something` correctly
* Improved router internals
* Add internal `Node#attachToParent` and `Node#detachFromParent` methods
* Preserve signed zero in output (Fixes #497)
* Make hmr reloading work with raw html assets
* Make `--no-hashing` cli option actually work
* Build html entrypoints in correct dist folder
* Add `imba create` command for creating project from template

## 2.0.0-alpha.119
* Add support for object spread syntax `{a:1, ...obj}`
* Fix regression causing crash when generating css

## 2.0.0-alpha.118
* Only call imba.commit when events are actually handled

## 2.0.0-alpha.117
* Alias `tabindex` to `tabIndex` in tag attributes.
* Fix scoping issue with css in tag trees
* Add experimental router aliases/redirects support
* Include preflight.css at root level of package


## 2.0.0-alpha.116
* Convert durations (`1s`, `150ms`, `60fps` etc) to ms-based numbers on compile-time

## 2.0.0-alpha.115
* Add `debounce` event modifier

## 2.0.0-alpha.114
* Add `no-minify` option to cli
* Always compile `html` namespaced attributes to raw `setAttribute`

## 2.0.0-alpha.113
* Add `__realname` as an unaltered alias for `__filename`
* Add support for selectors in tag tree - see [#490](https://github.com/imba/imba/issues/490)

## 2.0.0-alpha.112
* Show full version (including alpha number) in cli `imba --version`

## 2.0.0-alpha.110
* Add experimental `<tag autorender=interval>` inteface
* Add `?v=hash` to asset urls when filename hashing is turned off
* Add experimental support for `.html` entrypoints to `imba serve` and `imba build`
* Add `abs` and `rel` shorthands for `position` style property
* Fix memory leak when using `imba --watch`

## 2.0.0-alpha.109
* Support extending native tags `tag Purchase < form`
* Allow defining global tags without dash in name

## 2.0.0-alpha.108
* Fix issue with `@nth-of-type`, `@nth-child` selectors
* Improve internals of intersect event handling

## 2.0.0-alpha.107
* Add `asset.body` property for accessing raw content of assets

## 2.0.0-alpha.106
* Allow passing `rootMargin` options to intersect event
* Fix issue in router related to hash links

## 2.0.0-alpha.105
* Fix issue with css property order

## 2.0.0-alpha.102
* changelog and docs coming soon. see imba.io

## 2.0.0-alpha.60
* Add `route-to.exact` modifier to router

## 2.0.0-alpha.59
* Add support for numeric separator `100_000`
* Fix multiline regex parsing issues

## 2.0.0-alpha.58
* Allow setting innerHTML in SSR

## 2.0.0-alpha.57
* Update instantiation syntax in tests++

## 2.0.0-alpha.56
* Add `new Foo` instantiation syntax
* Deprecate `Foo.new` instantiation syntax

## 2.0.0-alpha.55
* Allow local/exportable tags (uppercased tag declarations)
* Allow interpolated tags inside strings in tag trees

## 2.0.0-alpha.54
* Allow getters and setters in object literals

## 2.0.0-alpha.53
* Allow media breakpoints in style selectors
* Added max-width breakpoints

## 2.0.0-alpha.52
* Fix issue with nested `$reference` selectors
* Allow router to work for regular links
* Add route-to.replace modifier
* Add route-to.sticky modifier

## 2.0.0-alpha.51
* No longer inheriting from CustomEvent as it is not supported in Safari
* Fix input data binding issue
* Added `before` and `after` style property modifiers
* Added `prefix` as alias for `before.content`
* Added `suffix` as alias for `after.content`

## 2.0.0-alpha.50
* Fix nested selector bug
* Fix focus-within modifier
* Add `:local` pseudo-class for only styling local children of component
* Support `$reference` in selectors for targeting local referenced elements
* Change `display` style property to accept multiple layout aliases
* Add 1-digit color aliases (blue900 -> blue9 etc)

## 2.0.0-alpha.49
* Allow border and border-(top|right|bottom|left) to accept a single color value
* Accept rgb/hsl/hex colors in text and border properties

## 2.0.0-alpha.48
* Added multi-purpose `text` style property for describing font-family, font-size, font-style, font-weight, text-decoration, text-transform, line-height, letter-spacing and color in a single property
* Added shorthand style aliases for border-* and flex-*

## 2.0.0-alpha.47
* Added x, y, z, rotate, scale, scale-x, scale-y, skew-x, skew-y custom style properties
* Extended transition property to accept colors, styles, sizes as properties and custom easings

## 2.0.0-alpha.46
* Added experimental syntax for css/styling. See [#334](https://github.com/imba/imba/pull/362)
* Broke scoped css comment blocks until further notice

## 2.0.0-alpha.45
* Fix conditional rendering bug (#334)
* Changed event syntax from `<div :click.stop.{method()}>` to `<div @click.stop=method()>`
* Allow comments inside multiline tags
* Include left/right event key modifiers
* Improve resize and intersect events
* Always bind data when using `<tag[my-data]>` syntax

## 2.0.0-alpha.44
* Improved lifecycle methods for components
* Fix sourcemapping for env-flags

## 2.0.0-alpha.43
* Add syntax for element references `<div$reference>`
* Fix problem with missing ResizeObserver in safari

## 2.0.0-alpha.42
* Fixed webpack imba/loader issues with scoped css
* Add event wrapper for ResizeObserver
* Add experimental router code
* Add basic support for setting dom classes outside of templates
* Allow calling imba.mount with a function
* Rename #context api to $context
* Rename parentContext to $parent

## 2.0.0-alpha.40
* Introduce decorators with `@decorator` syntax. See [#334](https://github.com/imba/imba/pull/334)
* Allow declaring tag attributes. See [#335](https://github.com/imba/imba/pull/335)
* Shorthand `!` for invoking parenless methods (`object.mymethod!`)
* Implicit self is back (for good)

## 2.0.0-alpha
See [#263](https://github.com/imba/imba/issues/263) for an overview of changes

## 1.5.2

* Fixed #237 (CSS comments not working in SFC)
* Fixed #240 (Build issues with font-properties in SFC)
* Fixed #239 (Module not found: Error: Can't resolve 'important[...] in SFC)

## 1.5.0
* Add support for declaring native getters and setters using `get/set` instead of `def` keyword
* Add support for compiling props to native getters and setters using `native` option (`prop name native: yes`)
* Make svg tags and non-svg tags use same class naming scheme (#230)
* Add experimental support for single-file-components

## 1.4.8
* Made splats compatible with ES6 containers like Set (#167)
* Cache compilation for node runtime when 'IMBA_CACHE_DIR' process variable is set

## 1.4.7
* Make puppeteer tests work again
* Fixed #203 (trigger data is null when supposed to be 0)

## 1.4.6
* Fix crash when packaging for webworker

## 1.4.4
* Fix bugs in analyzer returning incorrect locations for classes and methods
* Include properties in analyzer entity output

## 1.4.3
* Support for `**` and `**=` operators (#192 by @taw)
* Fix imbapack crash with newer webpack (#194 by @gdamjan)
* Fix --stdio/-s option for imbac (#178 by @shreeve)
* Make special variables in event handlers default to event methods
* Include all global attributes on Imba.Tag

## 1.4.2
* Respect empty parens in event handlers (`<div :tap.someMethod()>`)
* Allow special variables in event handlers (`<div :tap.someMethod($event,$data)>`)
* Allow all aria-* attributes
* Fixed bug where compiler could end up in faulty state
* Lookup event handlers in owner-scope

## 1.4.1
* Make Imba.setInterval automatically commit on each interval
* Compile is to === (instead of ==)
* Compile isnt to !== (instead of !=)
* Require Node >=8.0.0

## 1.4.0
* Introduce new root scope per file for more consistent self
* Fix export const
* Add `<input number=bool>` for numeric inputs
* Only prevent native click if tap was prevented
* Print out compiler warnings in imbac and webpack loader
* Pass through stdio configuration from imbapack to webpack
* Don't include comments by default in webpack loader
* Disallow cross-scope calling of root 'def' functions (breaking change)

## 1.3.3
* Don't silence input events for form elements
* Implement style.removeProperty on server
* Improve mount/unmount performance

## 1.3.2
* Fix webpack4 compatibility
* Improve svg support
* Suppress setValue for input and textarea while editing

## 1.3.1
* Fix duplicate attributes in serverside rendering
* Make popstate event notify schedulers
* Make event manager delay adding listeners until needed
* Optimize tag tree syncing

## 1.3.0
* Add support for event modifiers (e.g. `<div :keydown.enter.myHandler>`)
* Add support for form input bindings (e.g. `<input[data:myField]>`)
* Allow method definitions inside object literals
* Better error reporting from parser when running through `imba` cli
* Add automatic cache pruning for loops
* Improve performance of setText
* Improve performance of non-keyed tag lists
* Implement radically improved inline caching strategy
* Improve overall rendering performance
* Allow all attributes on svg elements
* 25% smaller library (now 57k minified, 15k gzipped)
* Remove deprecated selector-syntax
* Remove deprecated methods on Imba.Tag (object,width,height,append,prepend)
* Remove deprecated methods on Imba.Event (keychar,keycombo)
* Remove deprecated Imba.isClient and Imba.isServer

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
