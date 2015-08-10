## Dev 

- Allow `new` and `char` as varnames
- `tag#render` is called by default from `tag#build`
- Slightly improved error reporting when using `:` in control-flow (like python)
- Massively improved algorithm for reconciling dom trees (rendering for-loops etc  will now be much more efficient) - contributed by @judofyr

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
