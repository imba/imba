## 0.9.3 (2015-08-04)

- Register 'module' as an automatic global variable, along with 'global', '__dirname', 'exports', 'console', 'process', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'. The timeout/interval are likely to be deprecated in next version.
- added support for shebangs to top of files.
  `#!/usr/bin/env imba` or similar shebangs will be kept and converted in the compiled js (to `#!/usr/bin/env node` etc)
- Improved preservation of linebreaks, and removal of parens in compiled code.
