# Changelog

## Unreleased

* Strip import assertions from unrecognized `import()` expressions ([#2036](https://github.com/evanw/esbuild/issues/2036))

    The new "import assertions" JavaScript language feature adds an optional second argument to dynamic `import()` expressions, which esbuild does support. However, this optional argument must be stripped when targeting older JavaScript environments for which this second argument would be a syntax error. Previously esbuild failed to strip this second argument in cases when the first argument to `import()` wasn't a string literal. This problem is now fixed:

    ```js
    // Original code
    console.log(import(foo, { assert: { type: 'json' } }))

    // Old output (with --target=es6)
    console.log(import(foo, { assert: { type: "json" } }));

    // New output (with --target=es6)
    console.log(import(foo));
    ```

## 0.14.23

* Update feature database to indicate that node 16.14+ supports import assertions ([#2030](https://github.com/evanw/esbuild/issues/2030))

    Node versions 16.14 and above now support import assertions according to [these release notes](https://github.com/nodejs/node/blob/6db686710ee1579452b2908a7a41b91cb729b944/doc/changelogs/CHANGELOG_V16.md#16.14.0). This release updates esbuild's internal feature compatibility database with this information, so esbuild no longer strips import assertions with `--target=node16.14`:

    ```js
    // Original code
    import data from './package.json' assert { type: 'json' }
    console.log(data)

    // Old output (with --target=node16.14)
    import data from "./package.json";
    console.log(data);

    // New output (with --target=node16.14)
    import data from "./package.json" assert { type: "json" };
    console.log(data);
    ```

* Basic support for CSS `@layer` rules ([#2027](https://github.com/evanw/esbuild/issues/2027))

    This adds basic parsing support for a new CSS feature called `@layer` that changes how the CSS cascade works. Adding parsing support for this rule to esbuild means esbuild can now minify the contents of `@layer` rules:

    ```css
    /* Original code */
    @layer a {
      @layer b {
        div {
          color: yellow;
          margin: 0.0px;
        }
      }
    }

    /* Old output (with --minify) */
    @layer a{@layer b {div {color: yellow; margin: 0px;}}}

    /* New output (with --minify) */
    @layer a.b{div{color:#ff0;margin:0}}
    ```

    You can read more about `@layer` here:

    * Documentation: https://developer.mozilla.org/en-US/docs/Web/CSS/@layer
    * Motivation: https://developer.chrome.com/blog/cascade-layers/

    Note that the support added in this release is only for parsing and printing `@layer` rules. The bundler does not yet know about these rules and bundling with `@layer` may result in behavior changes since these new rules have unusual ordering constraints that behave differently than all other CSS rules. Specifically the order is derived from the _first_ instance while with every other CSS rule, the order is derived from the _last_ instance.

## 0.14.22

* Preserve whitespace for token lists that look like CSS variable declarations ([#2020](https://github.com/evanw/esbuild/issues/2020))

    Previously esbuild removed the whitespace after the CSS variable declaration in the following CSS:

    ```css
    /* Original input */
    @supports (--foo: ){html{background:green}}

    /* Previous output */
    @supports (--foo:){html{background:green}}
    ```

    However, that broke rendering in Chrome as it caused Chrome to ignore the entire rule. This did not break rendering in Firefox and Safari, so there's a browser bug either with Chrome or with both Firefox and Safari. In any case, esbuild now preserves whitespace after the CSS variable declaration in this case.

* Ignore legal comments when merging adjacent duplicate CSS rules ([#2016](https://github.com/evanw/esbuild/issues/2016))

    This release now generates more compact minified CSS when there are legal comments in between two adjacent rules with identical content:

    ```css
    /* Original code */
    a { color: red }
    /* @preserve */
    b { color: red }

    /* Old output (with --minify) */
    a{color:red}/* @preserve */b{color:red}

    /* New output (with --minify) */
    a,b{color:red}/* @preserve */
    ```

* Block `onResolve` and `onLoad` until `onStart` ends ([#1967](https://github.com/evanw/esbuild/issues/1967))

    This release changes the semantics of the `onStart` callback. All `onStart` callbacks from all plugins are run concurrently so that a slow plugin doesn't hold up the entire build. That's still the case. However, previously the only thing waiting for the `onStart` callbacks to finish was the end of the build. This meant that `onResolve` and/or `onLoad` callbacks could sometimes run before `onStart` had finished. This was by design but violated user expectations. With this release, all `onStart` callbacks must finish before any `onResolve` and/or `onLoad` callbacks are run.

* Add a self-referential `default` export to the JS API ([#1897](https://github.com/evanw/esbuild/issues/1897))

    Some people try to use esbuild's API using `import esbuild from 'esbuild'` instead of `import * as esbuild from 'esbuild'` (i.e. using a default import instead of a namespace import). There is no `default` export so that wasn't ever intended to work. But it would work sometimes depending on which tools you used and how they were configured so some people still wrote code this way. This release tries to make that work by adding a self-referential `default` export that is equal to esbuild's module namespace object.

    More detail: The published package for esbuild's JS API is in CommonJS format, although the source code for esbuild's JS API is in ESM format. The original ESM code for esbuild's JS API has no export named `default` so using a default import like this doesn't work with Babel-compatible toolchains (since they respect the semantics of the original ESM code). However, it happens to work with node-compatible toolchains because node's implementation of importing CommonJS from ESM broke compatibility with existing conventions and automatically creates a `default` export which is set to `module.exports`. This is an unfortunate compatibility headache because it means the `default` import only works sometimes. This release tries to fix this by explicitly creating a self-referential `default` export. It now doesn't matter if you do `esbuild.build()`, `esbuild.default.build()`, or `esbuild.default.default.build()` because they should all do the same thing. Hopefully this means people don't have to deal with this problem anymore.

* Handle `write` errors when esbuild's child process is killed ([#2007](https://github.com/evanw/esbuild/issues/2007))

    If you type Ctrl+C in a terminal when a script that uses esbuild's JS library is running, esbuild's child process may be killed before the parent process. In that case calls to the `write()` syscall may fail with an `EPIPE` error. Previously this resulted in an uncaught exception because esbuild didn't handle this case. Starting with this release, esbuild should now catch these errors and redirect them into a general `The service was stopped` error which should be returned from whatever top-level API calls were in progress.

* Better error message when browser WASM bugs are present ([#1863](https://github.com/evanw/esbuild/issues/1863))

    Safari's WebAssembly implementation appears to be broken somehow, at least when running esbuild. Sometimes this manifests as a stack overflow and sometimes as a Go panic. Previously a Go panic resulted in the error message `Can't find variable: fs` but this should now result in the Go panic being printed to the console. Using esbuild's WebAssembly library in Safari is still broken but now there's a more helpful error message.

    More detail: When Go panics, it prints a stack trace to stderr (i.e. file descriptor 2). Go's WebAssembly shim calls out to node's `fs.writeSync()` function to do this, and it converts calls to `fs.writeSync()` into calls to `console.log()` in the browser by providing a shim for `fs`. However, Go's shim code stores the shim on `window.fs` in the browser. This is undesirable because it pollutes the global scope and leads to brittle code that can break if other code also uses `window.fs`. To avoid this, esbuild shadows the global object by wrapping Go's shim. But that broke bare references to `fs` since the shim is no longer stored on `window.fs`. This release now stores the shim in a local variable named `fs` so that bare references to `fs` work correctly.

* Undo incorrect dead-code elimination with destructuring ([#1183](https://github.com/evanw/esbuild/issues/1183))

    Previously esbuild eliminated these statements as dead code if tree-shaking was enabled:

    ```js
    let [a] = {}
    let { b } = null
    ```

    This is incorrect because both of these lines will throw an error when evaluated. With this release, esbuild now preserves these statements even when tree shaking is enabled.

* Update to Go 1.17.7

    The version of the Go compiler used to compile esbuild has been upgraded from Go 1.17.6 to Go 1.17.7, which contains a few [compiler and security bug fixes](https://github.com/golang/go/issues?q=milestone%3AGo1.17.7+label%3ACherryPickApproved).

## 0.14.21

* Handle an additional `browser` map edge case ([#2001](https://github.com/evanw/esbuild/pull/2001), [#2002](https://github.com/evanw/esbuild/issues/2002))

    There is a community convention around the `browser` field in `package.json` that allows remapping import paths within a package when the package is bundled for use within a browser. There isn't a rigorous definition of how it's supposed to work and every bundler implements it differently. The approach esbuild uses is to try to be "maximally compatible" in that if at least one bundler exhibits a particular behavior regarding the `browser` map that allows a mapping to work, then esbuild also attempts to make that work.

    I have a collection of test cases for this going here: https://github.com/evanw/package-json-browser-tests. However, I was missing test coverage for the edge case where a package path import in a subdirectory of the package could potentially match a remapping. The "maximally compatible" approach means replicating bugs in Browserify's implementation of the feature where package paths are mistaken for relative paths and are still remapped. Here's a specific example of an edge case that's now handled:

    * `entry.js`:

        ```js
        require('pkg/sub')
        ```

    * `node_modules/pkg/package.json`:

        ```json
        {
          "browser": {
            "./sub": "./sub/foo.js",
            "./sub/sub": "./sub/bar.js"
          }
        }
        ```

    * `node_modules/pkg/sub/foo.js`:

        ```js
        require('sub')
        ```

    * `node_modules/pkg/sub/bar.js`:

        ```js
        console.log('works')
        ```

    The import path `sub` in `require('sub')` is mistaken for a relative path by Browserify due to a bug in Browserify, so Browserify treats it as if it were `./sub` instead. This is a Browserify-specific behavior and currently doesn't happen in any other bundler (except for esbuild, which attempts to replicate Browserify's bug).

    Previously esbuild was incorrectly resolving `./sub` relative to the top-level package directory instead of to the subdirectory in this case, which meant `./sub` was incorrectly matching `"./sub": "./sub/foo.js"` instead of `"./sub/sub": "./sub/bar.js"`. This has been fixed so esbuild can now emulate Browserify's bug correctly in this edge case.

* Support for esbuild with Linux on RISC-V 64bit ([#2000](https://github.com/evanw/esbuild/pull/2000))

    With this release, esbuild now has a published binary executable for the RISC-V 64bit architecture in the [`esbuild-linux-riscv64`](https://www.npmjs.com/package/esbuild-linux-riscv64) npm package. This change was contributed by [@piggynl](https://github.com/piggynl).

## 0.14.20

* Fix property mangling and keyword properties ([#1998](https://github.com/evanw/esbuild/issues/1998))

    Previously enabling property mangling with `--mangle-props=` failed to add a space before property names after a keyword. This bug has been fixed:

    ```js
    // Original code
    class Foo {
      static foo = {
        get bar() {}
      }
    }

    // Old output (with --minify --mangle-props=.)
    class Foo{statics={gett(){}}}

    // New output (with --minify --mangle-props=.)
    class Foo{static s={get t(){}}}
    ```

## 0.14.19

* Special-case `const` inlining at the top of a scope ([#1317](https://github.com/evanw/esbuild/issues/1317), [#1981](https://github.com/evanw/esbuild/issues/1981))

    The minifier now inlines `const` variables (even across modules during bundling) if a certain set of specific requirements are met:

    * All `const` variables to be inlined are at the top of their scope
    * That scope doesn't contain any `import` or `export` statements with paths
    * All constants to be inlined are `null`, `undefined`, `true`, `false`, an integer, or a short real number
    * Any expression outside of a small list of allowed ones stops constant identification

    Practically speaking this basically means that you can trigger this optimization by just putting the constants you want inlined into a separate file (e.g. `constants.js`) and bundling everything together.

    These specific conditions are present to avoid esbuild unintentionally causing any behavior changes by inlining constants when the variable reference could potentially be evaluated before being declared. It's possible to identify more cases where constants can be inlined but doing so may require complex call graph analysis so it has not been implemented. Although these specific heuristics may change over time, this general approach to constant inlining should continue to work going forward.

    Here's an example:

    ```js
    // Original code
    const bold = 1 << 0;
    const italic = 1 << 1;
    const underline = 1 << 2;
    const font = bold | italic | underline;
    console.log(font);

    // Old output (with --minify --bundle)
    (()=>{var o=1<<0,n=1<<1,c=1<<2,t=o|n|c;console.log(t);})();

    // New output (with --minify --bundle)
    (()=>{console.log(7);})();
    ```

## 0.14.18

* Add the `--mangle-cache=` feature ([#1977](https://github.com/evanw/esbuild/issues/1977))

    This release adds a cache API for the newly-released `--mangle-props=` feature. When enabled, all mangled property renamings are recorded in the cache during the initial build. Subsequent builds reuse the renamings stored in the cache and add additional renamings for any newly-added properties. This has a few consequences:

    * You can customize what mangled properties are renamed to by editing the cache before passing it to esbuild (the cache is a map of the original name to the mangled name).

    * The cache serves as a list of all properties that were mangled. You can easily scan it to see if there are any unexpected property renamings.

    * You can disable mangling for individual properties by setting the renamed value to `false` instead of to a string. This is similar to the `--reserve-props=` setting but on a per-property basis.

    * You can ensure consistent renaming between builds (e.g. a main-thread file and a web worker, or a library and a plugin). Without this feature, each build would do an independent renaming operation and the mangled property names likely wouldn't be consistent.

    Here's how to use it:

    * CLI

        ```sh
        $ esbuild example.ts --mangle-props=_$ --mangle-cache=cache.json
        ```

    * JS API

        ```js
        let result = await esbuild.build({
          entryPoints: ['example.ts'],
          mangleProps: /_$/,
          mangleCache: {
            customRenaming_: '__c',
            disabledRenaming_: false,
          },
        })
        let updatedMangleCache = result.mangleCache
        ```

    * Go API

        ```go
        result := api.Build(api.BuildOptions{
          EntryPoints: []string{"example.ts"},
          MangleProps: "_$",
          MangleCache: map[string]interface{}{
            "customRenaming_":   "__c",
            "disabledRenaming_": false,
          },
        })
        updatedMangleCache := result.MangleCache
        ```

    The above code would do something like the following:

    ```js
    // Original code
    x = {
      customRenaming_: 1,
      disabledRenaming_: 2,
      otherProp_: 3,
    }

    // Generated code
    x = {
      __c: 1,
      disabledRenaming_: 2,
      a: 3
    };

    // Updated mangle cache
    {
      "customRenaming_": "__c",
      "disabledRenaming_": false,
      "otherProp_": "a"
    }
    ```

* Add `opera` and `ie` as possible target environments

    You can now target [Opera](https://www.opera.com/) and/or [Internet Explorer](https://www.microsoft.com/en-us/download/internet-explorer.aspx) using the `--target=` setting. For example, `--target=opera45,ie9` targets Opera 45 and Internet Explorer 9. This change does not add any additional features to esbuild's code transformation pipeline to transform newer syntax so that it works in Internet Explorer. It just adds information about what features are supported in these browsers to esbuild's internal feature compatibility table.

* Minify `typeof x !== 'undefined'` to `typeof x < 'u'`

    This release introduces a small improvement for code that does a lot of `typeof` checks against `undefined`:

    ```js
    // Original code
    y = typeof x !== 'undefined';

    // Old output (with --minify)
    y=typeof x!="undefined";

    // New output (with --minify)
    y=typeof x<"u";
    ```

    This transformation is only active when minification is enabled, and is disabled if the language target is set lower than ES2020 or if Internet Explorer is set as a target environment. Before ES2020, implementations were allowed to return non-standard values from the `typeof` operator for a few objects. Internet Explorer took advantage of this to sometimes return the string `'unknown'` instead of `'undefined'`. But this has been removed from the specification and Internet Explorer was the only engine to do this, so this minification is valid for code that does not need to target Internet Explorer.

## 0.14.17

* Attempt to fix an install script issue on Ubuntu Linux ([#1711](https://github.com/evanw/esbuild/issues/1711))

    There have been some reports of esbuild failing to install on Ubuntu Linux for a while now. I haven't been able to reproduce this myself due to lack of reproduction instructions until today, when I learned that the issue only happens when you install node from the [Snap Store](https://snapcraft.io/) instead of downloading the [official version of node](https://nodejs.org/dist/).

    The problem appears to be that when node is installed from the Snap Store, install scripts are run with stderr not being writable? This then appears to cause a problem for esbuild's install script when it uses `execFileSync` to validate that the esbuild binary is working correctly. This throws the error `EACCES: permission denied, write` even though this particular command never writes to stderr.

    Node's documentation says that stderr for `execFileSync` defaults to that of the parent process. Forcing it to `'pipe'` instead appears to fix the issue, although I still don't fully understand what's happening or why. I'm publishing this small change regardless to see if it fixes this install script edge case.

* Avoid a syntax error due to `--mangle-props=.` and `super()` ([#1976](https://github.com/evanw/esbuild/issues/1976))

    This release fixes an issue where passing `--mangle-props=.` (i.e. telling esbuild to mangle every single property) caused a syntax error with code like this:

    ```js
    class Foo {}
    class Bar extends Foo {
      constructor() {
        super();
      }
    }
    ```

    The problem was that `constructor` was being renamed to another method, which then made it no longer a constructor, which meant that `super()` was now a syntax error. I have added a workaround that avoids renaming any property named `constructor` so that esbuild doesn't generate a syntax error here.

    Despite this fix, I highly recommend not using `--mangle-props=.` because your code will almost certainly be broken. You will have to manually add every single property that you don't want mangled to `--reserve-props=` which is an excessive maintenance burden (e.g. reserve `parse` to use `JSON.parse`). Instead I recommend using a common pattern for all properties you intend to be mangled that is unlikely to appear in the APIs you use such as "ends in an underscore." This is an opt-in approach instead of an opt-out approach. It also makes it obvious when reading the code which properties will be mangled and which ones won't be.

## 0.14.16

* Support property name mangling with some TypeScript syntax features

    The newly-released `--mangle-props=` feature previously only affected JavaScript syntax features. This release adds support for using mangle props with certain TypeScript syntax features:

    * **TypeScript parameter properties**

        Parameter properties are a TypeScript-only shorthand way of initializing a class field directly from the constructor argument list. Previously parameter properties were not treated as properties to be mangled. They should now be handled correctly:

        ```ts
        // Original code
        class Foo {
          constructor(public foo_) {}
        }
        new Foo().foo_;

        // Old output (with --minify --mangle-props=_)
        class Foo{constructor(c){this.foo_=c}}new Foo().o;

        // New output (with --minify --mangle-props=_)
        class Foo{constructor(o){this.c=o}}new Foo().c;
        ```

    * **TypeScript namespaces**

        Namespaces are a TypeScript-only way to add properties to an object. Previously exported namespace members were not treated as properties to be mangled. They should now be handled correctly:

        ```ts
        // Original code
        namespace ns {
          export let foo_ = 1;
          export function bar_(x) {}
        }
        ns.bar_(ns.foo_);

        // Old output (with --minify --mangle-props=_)
        var ns;(e=>{e.foo_=1;function t(a){}e.bar_=t})(ns||={}),ns.e(ns.o);

        // New output (with --minify --mangle-props=_)
        var ns;(e=>{e.e=1;function o(p){}e.t=o})(ns||={}),ns.t(ns.e);
        ```

* Fix property name mangling for lowered class fields

    This release fixes a compiler crash with `--mangle-props=` and class fields that need to be transformed to older versions of JavaScript. The problem was that doing this is an unusual case where the mangled property name must be represented as a string instead of as a property name, which previously wasn't implemented. This case should now work correctly:

    ```js
    // Original code
    class Foo {
      static foo_;
    }
    Foo.foo_ = 0;

    // New output (with --mangle-props=_ --target=es6)
    class Foo {
    }
    __publicField(Foo, "a");
    Foo.a = 0;
    ```

## 0.14.15

* Add property name mangling with `--mangle-props=` ([#218](https://github.com/evanw/esbuild/issues/218))

    ⚠️ **Using this feature can break your code in subtle ways.** Do not use this feature unless you know what you are doing, and you know exactly how it will affect both your code and all of your dependencies. ⚠️

    This release introduces property name mangling, which is similar to an existing feature from the popular [UglifyJS](github.com/mishoo/uglifyjs) and [Terser](github.com/terser/terser) JavaScript minifiers. This setting lets you pass a regular expression to esbuild to tell esbuild to automatically rename all properties that match this regular expression. It's useful when you want to minify certain property names in your code either to make the generated code smaller or to somewhat obfuscate your code's intent.

    Here's an example that uses the regular expression `_$` to mangle all properties ending in an underscore, such as `foo_`:

    ```
    $ echo 'console.log({ foo_: 0 }.foo_)' | esbuild --mangle-props=_$
    console.log({ a: 0 }.a);
    ```

    Only mangling properties that end in an underscore is a reasonable heuristic because normal JS code doesn't typically contain identifiers like that. Browser APIs also don't use this naming convention so this also avoids conflicts with browser APIs. If you want to avoid mangling names such as [`__defineGetter__`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/__defineGetter__) you could consider using a more complex regular expression such as `[^_]_$` (i.e. must end in a non-underscore followed by an underscore).

    This is a separate setting instead of being part of the minify setting because it's an unsafe transformation that does not work on arbitrary JavaScript code. It only works if the provided regular expression matches all of the properties that you want mangled and does not match any of the properties that you don't want mangled. It also only works if you do not under any circumstances reference a property name to be mangled as a string. For example, it means you can't use `Object.defineProperty(obj, 'prop', ...)` or `obj['prop']` with a mangled property. Specifically the following syntax constructs are the only ones eligible for property mangling:

    | Syntax                          | Example                 |
    |---------------------------------|-------------------------|
    | Dot property access             | `x.foo_`                |
    | Dot optional chain              | `x?.foo_`               |
    | Object properties               | `x = { foo_: y }`       |
    | Object methods                  | `x = { foo_() {} }`     |
    | Class fields                    | `class x { foo_ = y }`  |
    | Class methods                   | `class x { foo_() {} }` |
    | Object destructuring binding    | `let { foo_: x } = y`   |
    | Object destructuring assignment | `({ foo_: x } = y)`     |
    | JSX element names               | `<X.foo_></X.foo_>`     |
    | JSX attribute names             | `<X foo_={y} />`        |

    You can avoid property mangling for an individual property by quoting it as a string. However, you must consistently use quotes or no quotes for a given property everywhere for this to work. For example, `print({ foo_: 0 }.foo_)` will be mangled into `print({ a: 0 }.a)` while `print({ 'foo_': 0 }['foo_'])` will not be mangled.

    When using this feature, keep in mind that property names are only consistently mangled within a single esbuild API call but not across esbuild API calls. Each esbuild API call does an independent property mangling operation so output files generated by two different API calls may mangle the same property to two different names, which could cause the resulting code to behave incorrectly.

    If you would like to exclude certain properties from mangling, you can reserve them with the `--reserve-props=` setting. For example, this uses the regular expression `^__.*__$` to reserve all properties that start and end with two underscores, such as `__foo__`:

    ```
    $ echo 'console.log({ __foo__: 0 }.__foo__)' | esbuild --mangle-props=_$
    console.log({ a: 0 }.a);

    $ echo 'console.log({ __foo__: 0 }.__foo__)' | esbuild --mangle-props=_$ "--reserve-props=^__.*__$"
    console.log({ __foo__: 0 }.__foo__);
    ```

* Mark esbuild as supporting node v12+ ([#1970](https://github.com/evanw/esbuild/issues/1970))

    Someone requested that esbuild populate the `engines.node` field in `package.json`. This release adds the following to each `package.json` file that esbuild publishes:

    ```json
    "engines": {
      "node": ">=12"
    },
    ```

    This was chosen because it's the oldest version of node that's currently still receiving support from the node team, and so is the oldest version of node that esbuild supports: https://nodejs.org/en/about/releases/.

* Remove error recovery for invalid `//` comments in CSS ([#1965](https://github.com/evanw/esbuild/issues/1965))

    Previously esbuild treated `//` as a comment in CSS and generated a warning, even though comments in CSS use `/* ... */` instead. This allowed you to run esbuild on CSS intended for certain CSS preprocessors that support single-line comments.

    However, some people are changing from another build tool to esbuild and have a code base that relies on `//` being preserved even though it's nonsense CSS and causes the entire surrounding rule to be discarded by the browser. Presumably this nonsense CSS ended up there at some point due to an incorrectly-configured build pipeline and the site now relies on that entire rule being discarded. If esbuild interprets `//` as a comment, it could cause the rule to no longer be discarded or even cause something else to happen.

    With this release, esbuild no longer treats `//` as a comment in CSS. It still warns about it but now passes it through unmodified. This means it's no longer possible to run esbuild on CSS code containing single-line comments but it means that esbuild's behavior regarding these nonsensical CSS rules more accurately represents what happens in a browser.

## 0.14.14

* Fix bug with filename hashes and the `file` loader ([#1957](https://github.com/evanw/esbuild/issues/1957))

    This release fixes a bug where if a file name template has the `[hash]` placeholder (either `--entry-names=` or `--chunk-names=`), the hash that esbuild generates didn't include the content of the string generated by the `file` loader. Importing a file with the `file` loader causes the imported file to be copied to the output directory and causes the imported value to be the relative path from the output JS file to that copied file. This bug meant that if the `--asset-names=` setting also contained `[hash]` and the file loaded with the `file` loader was changed, the hash in the copied file name would change but the hash of the JS file would not change, which could potentially result in a stale JS file being loaded. Now the hash of the JS file will be changed too which fixes the reload issue.

* Prefer the `import` condition for entry points ([#1956](https://github.com/evanw/esbuild/issues/1956))

    The `exports` field in `package.json` maps package subpaths to file paths. The mapping can be conditional, which lets it vary in different situations. For example, you can have an `import` condition that applies when the subpath originated from a JS import statement, and a `require` condition that applies when the subpath originated from a JS require call. These are supposed to be mutually exclusive according to the specification: https://nodejs.org/api/packages.html#conditional-exports.

    However, there's a situation with esbuild where it's not immediately obvious which one should be applied: when a package name is specified as an entry point. For example, this can happen if you do `esbuild --bundle some-pkg` on the command line. In this situation `some-pkg` does not originate from either a JS import statement or a JS require call. Previously esbuild just didn't apply the `import` or `require` conditions. But that could result in path resolution failure if the package doesn't provide a back-up `default` condition, as is the case with the `is-plain-object` package.

    Starting with this release, esbuild will now use the `import` condition in this case. This appears to be how Webpack and Rollup handle this situation so this change makes esbuild consistent with other tools in the ecosystem. Parcel (the other major bundler) just doesn't handle this case at all so esbuild's behavior is not at odds with Parcel's behavior here.

* Make parsing of invalid `@keyframes` rules more robust ([#1959](https://github.com/evanw/esbuild/issues/1959))

    This improves esbuild's parsing of certain malformed `@keyframes` rules to avoid them affecting the following rule. This fix only affects invalid CSS files, and does not change any behavior for files containing valid CSS. Here's an example of the fix:

    ```css
    /* Original code */
    @keyframes x { . }
    @keyframes y { 1% { a: b; } }

    /* Old output (with --minify) */
    @keyframes x{y{1% {a: b;}}}

    /* New output (with --minify) */
    @keyframes x{.}@keyframes y{1%{a:b}}
    ```

## 0.14.13

* Be more consistent about external paths ([#619](https://github.com/evanw/esbuild/issues/619))

    The rules for marking paths as external using `--external:` grew over time as more special-cases were added. This release reworks the internal representation to be more straightforward and robust. A side effect is that wildcard patterns can now match post-resolve paths in addition to pre-resolve paths. Specifically you can now do `--external:./node_modules/*` to mark all files in the `./node_modules/` directory as external.

    This is the updated logic:

    * Before path resolution begins, import paths are checked against everything passed via an `--external:` flag. In addition, if something looks like a package path (i.e. doesn't start with `/` or `./` or `../`), import paths are checked to see if they have that package path as a path prefix (so `--external:@foo/bar` matches the import path `@foo/bar/baz`).

    * After path resolution ends, the absolute paths are checked against everything passed via `--external:` that doesn't look like a package path (i.e. that starts with `/` or `./` or `../`). But before checking, the pattern is transformed to be relative to the current working directory.

* Attempt to explain why esbuild can't run ([#1819](https://github.com/evanw/esbuild/issues/1819))

    People sometimes try to install esbuild on one OS and then copy the `node_modules` directory over to another OS without reinstalling. This works with JavaScript code but doesn't work with esbuild because esbuild is a native binary executable. This release attempts to offer a helpful error message when this happens. It looks like this:

    ```
    $ ./node_modules/.bin/esbuild
    ./node_modules/esbuild/bin/esbuild:106
              throw new Error(`
              ^

    Error:
    You installed esbuild on another platform than the one you're currently using.
    This won't work because esbuild is written with native code and needs to
    install a platform-specific binary executable.

    Specifically the "esbuild-linux-arm64" package is present but this platform
    needs the "esbuild-darwin-arm64" package instead. People often get into this
    situation by installing esbuild on Windows or macOS and copying "node_modules"
    into a Docker image that runs Linux, or by copying "node_modules" between
    Windows and WSL environments.

    If you are installing with npm, you can try not copying the "node_modules"
    directory when you copy the files over, and running "npm ci" or "npm install"
    on the destination platform after the copy. Or you could consider using yarn
    instead which has built-in support for installing a package on multiple
    platforms simultaneously.

    If you are installing with yarn, you can try listing both this platform and the
    other platform in your ".yarnrc.yml" file using the "supportedArchitectures"
    feature: https://yarnpkg.com/configuration/yarnrc/#supportedArchitectures
    Keep in mind that this means multiple copies of esbuild will be present.

    Another alternative is to use the "esbuild-wasm" package instead, which works
    the same way on all platforms. But it comes with a heavy performance cost and
    can sometimes be 10x slower than the "esbuild" package, so you may also not
    want to do that.

        at generateBinPath (./node_modules/esbuild/bin/esbuild:106:17)
        at Object.<anonymous> (./node_modules/esbuild/bin/esbuild:161:39)
        at Module._compile (node:internal/modules/cjs/loader:1101:14)
        at Object.Module._extensions..js (node:internal/modules/cjs/loader:1153:10)
        at Module.load (node:internal/modules/cjs/loader:981:32)
        at Function.Module._load (node:internal/modules/cjs/loader:822:12)
        at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)
        at node:internal/main/run_main_module:17:47
    ```

## 0.14.12

* Ignore invalid `@import` rules in CSS ([#1946](https://github.com/evanw/esbuild/issues/1946))

    In CSS, `@import` rules must come first before any other kind of rule (except for `@charset` rules). Previously esbuild would warn about incorrectly ordered `@import` rules and then hoist them to the top of the file. This broke people who wrote invalid `@import` rules in the middle of their files and then relied on them being ignored. With this release, esbuild will now ignore invalid `@import` rules and pass them through unmodified. This more accurately follows the CSS specification. Note that this behavior differs from other tools like Parcel, which does hoist CSS `@import` rules.

* Print invalid CSS differently ([#1947](https://github.com/evanw/esbuild/issues/1947))

    This changes how esbuild prints nested `@import` statements that are missing a trailing `;`, which is invalid CSS. The result is still partially invalid CSS, but now printed in a better-looking way:

    ```css
    /* Original code */
    .bad { @import url("other") }
    .red { background: red; }

    /* Old output (with --minify) */
    .bad{@import url(other) } .red{background: red;}}

    /* New output (with --minify) */
    .bad{@import url(other);}.red{background:red}
    ```

* Warn about CSS nesting syntax ([#1945](https://github.com/evanw/esbuild/issues/1945))

    There's a proposed [CSS syntax for nesting rules](https://drafts.csswg.org/css-nesting/) using the `&` selector, but it's not currently implemented in any browser. Previously esbuild silently passed the syntax through untransformed. With this release, esbuild will now warn when you use nesting syntax with a `--target=` setting that includes a browser.

* Warn about `}` and `>` inside JSX elements

    The `}` and `>` characters are invalid inside JSX elements according to [the JSX specification](https://facebook.github.io/jsx/) because they commonly result from typos like these that are hard to catch in code reviews:

    ```jsx
    function F() {
      return <div>></div>;
    }
    function G() {
      return <div>{1}}</div>;
    }
    ```

    The TypeScript compiler already [treats this as an error](https://github.com/microsoft/TypeScript/issues/36341), so esbuild now treats this as an error in TypeScript files too. That looks like this:

    ```
    ✘ [ERROR] The character ">" is not valid inside a JSX element

        example.tsx:2:14:
          2 │   return <div>></div>;
            │               ^
            ╵               {'>'}

      Did you mean to escape it as "{'>'}" instead?

    ✘ [ERROR] The character "}" is not valid inside a JSX element

        example.tsx:5:17:
          5 │   return <div>{1}}</div>;
            │                  ^
            ╵                  {'}'}

      Did you mean to escape it as "{'}'}" instead?
    ```

    Babel doesn't yet treat this as an error, so esbuild only warns about these characters in JavaScript files for now. Babel 8 [treats this as an error](https://github.com/babel/babel/issues/11042) but Babel 8 [hasn't been released yet](https://github.com/babel/babel/issues/10746). If you see this warning, I recommend fixing the invalid JSX syntax because it will become an error in the future.

* Warn about basic CSS property typos

    This release now generates a warning if you use a CSS property that is one character off from a known CSS property:

    ```
    ▲ [WARNING] "marign-left" is not a known CSS property

        example.css:2:2:
          2 │   marign-left: 12px;
            │   ~~~~~~~~~~~
            ╵   margin-left

      Did you mean "margin-left" instead?
    ```

## 0.14.11

* Fix a bug with enum inlining ([#1903](https://github.com/evanw/esbuild/issues/1903))

    The new TypeScript enum inlining behavior had a bug where it worked correctly if you used `export enum Foo` but not if you used `enum Foo` and then later `export { Foo }`. This release fixes the bug so enum inlining now works correctly in this case.

* Warn about `module.exports.foo = ...` in ESM ([#1907](https://github.com/evanw/esbuild/issues/1907))

    The `module` variable is treated as a global variable reference instead of as a CommonJS module reference in ESM code, which can cause problems for people that try to use both CommonJS and ESM exports in the same file. There has been a warning about this since version 0.14.9. However, the warning only covered cases like `exports.foo = bar` and `module.exports = bar` but not `module.exports.foo = bar`. This last case is now handled;

    ```
    ▲ [WARNING] The CommonJS "module" variable is treated as a global variable in an ECMAScript module and may not work as expected

        example.ts:2:0:
          2 │ module.exports.b = 1
            ╵ ~~~~~~

      This file is considered to be an ECMAScript module because of the "export" keyword here:

        example.ts:1:0:
          1 │ export let a = 1
            ╵ ~~~~~~
    ```

* Enable esbuild's CLI with Deno ([#1913](https://github.com/evanw/esbuild/issues/1913))

    This release allows you to use Deno as an esbuild installer, without also needing to use esbuild's JavaScript API. You can now use esbuild's CLI with Deno:

    ```
    deno run --allow-all "https://deno.land/x/esbuild@v0.14.11/mod.js" --version
    ```

## 0.14.10

* Enable tree shaking of classes with lowered static fields ([#175](https://github.com/evanw/esbuild/issues/175))

    If the configured target environment doesn't support static class fields, they are converted into a call to esbuild's `__publicField` function instead. However, esbuild's tree-shaking pass treated this call as a side effect, which meant that all classes with static fields were ineligible for tree shaking. This release fixes the problem by explicitly ignoring calls to the `__publicField` function during tree shaking side-effect determination. Tree shaking is now enabled for these classes:

    ```js
    // Original code
    class Foo { static foo = 'foo' }
    class Bar { static bar = 'bar' }
    new Bar()

    // Old output (with --tree-shaking=true --target=es6)
    class Foo {
    }
    __publicField(Foo, "foo", "foo");
    class Bar {
    }
    __publicField(Bar, "bar", "bar");
    new Bar();

    // New output (with --tree-shaking=true --target=es6)
    class Bar {
    }
    __publicField(Bar, "bar", "bar");
    new Bar();
    ```

* Treat `--define:foo=undefined` as an undefined literal instead of an identifier ([#1407](https://github.com/evanw/esbuild/issues/1407))

    References to the global variable `undefined` are automatically replaced with the literal value for undefined, which appears as `void 0` when printed. This allows for additional optimizations such as collapsing `undefined ?? bar` into just `bar`. However, this substitution was not done for values specified via `--define:`. As a result, esbuild could potentially miss out on certain optimizations in these cases. With this release, it's now possible to use `--define:` to substitute something with an undefined literal:

    ```js
    // Original code
    let win = typeof window !== 'undefined' ? window : {}

    // Old output (with --define:window=undefined --minify)
    let win=typeof undefined!="undefined"?undefined:{};

    // New output (with --define:window=undefined --minify)
    let win={};
    ```

* Add the `--drop:debugger` flag ([#1809](https://github.com/evanw/esbuild/issues/1809))

    Passing this flag causes all [`debugger;` statements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger) to be removed from the output. This is similar to the `drop_debugger: true` flag available in the popular UglifyJS and Terser JavaScript minifiers.

* Add the `--drop:console` flag ([#28](https://github.com/evanw/esbuild/issues/28))

    Passing this flag causes all [`console.xyz()` API calls](https://developer.mozilla.org/en-US/docs/Web/API/console#methods) to be removed from the output. This is similar to the `drop_console: true` flag available in the popular UglifyJS and Terser JavaScript minifiers.

    WARNING: Using this flag can introduce bugs into your code! This flag removes the entire call expression including all call arguments. If any of those arguments had important side effects, using this flag will change the behavior of your code. Be very careful when using this flag. If you want to remove console API calls without removing arguments with side effects (which does not introduce bugs), you should mark the relevant API calls as pure instead like this: `--pure:console.log --minify`.

* Inline calls to certain no-op functions when minifying ([#290](https://github.com/evanw/esbuild/issues/290), [#907](https://github.com/evanw/esbuild/issues/907))

    This release makes esbuild inline two types of no-op functions: empty functions and identity functions. These most commonly arise when most of the function body is eliminated as dead code. In the examples below, this happens because we use `--define:window.DEBUG=false` to cause dead code elimination inside the function body of the resulting `if (false)` statement. This inlining is a small code size and performance win but, more importantly, it allows for people to use these features to add useful abstractions that improve the development experience without needing to worry about the run-time performance impact.

    An identity function is a function that just returns its argument. Here's an example of inlining an identity function:

    ```js
    // Original code
    function logCalls(fn) {
      if (window.DEBUG) return function(...args) {
        console.log('calling', fn.name, 'with', args)
        return fn.apply(this, args)
      }
      return fn
    }
    export const foo = logCalls(function foo() {})

    // Old output (with --minify --define:window.DEBUG=false --tree-shaking=true)
    function o(n){return n}export const foo=o(function(){});

    // New output (with --minify --define:window.DEBUG=false --tree-shaking=true)
    export const foo=function(){};
    ```

    An empty function is a function with an empty body. Here's an example of inlining an empty function:

    ```ts
    // Original code
    function assertNotNull(val: Object | null): asserts val is Object {
      if (window.DEBUG && val === null) throw new Error('null assertion failed');
    }
    export const val = getFoo();
    assertNotNull(val);
    console.log(val.bar);

    // Old output (with --minify --define:window.DEBUG=false --tree-shaking=true)
    function l(o){}export const val=getFoo();l(val);console.log(val.bar);

    // New output (with --minify --define:window.DEBUG=false --tree-shaking=true)
    export const val=getFoo();console.log(val.bar);
    ```

    To get this behavior you'll need to use the `function` keyword to define your function since that causes the definition to be hoisted, which eliminates concerns around initialization order. These features also work across modules, so functions are still inlined even if the definition of the function is in a separate module from the call to the function. To get cross-module function inlining to work, you'll need to have bundling enabled and use the `import` and `export` keywords to access the function so that esbuild can see which functions are called. And all of this has been added without an observable impact to compile times.

    I previously wasn't able to add this to esbuild easily because of esbuild's low-pass compilation approach. The compiler only does three full passes over the data for speed. The passes are roughly for parsing, binding, and printing. It's only possible to inline something after binding but it needs to be inlined before printing. Also the way module linking was done made it difficult to roll back uses of symbols that were inlined, so the symbol definitions were not tree shaken even when they became unused due to inlining.

    The linking issue was somewhat resolved when I fixed #128 in the previous release. To implement cross-module inlining of TypeScript enums, I came up with a hack to defer certain symbol uses until the linking phase, which happens after binding but before printing. Another hack is that inlining of TypeScript enums is done directly in the printer to avoid needing another pass.

    The possibility of these two hacks has unblocked these simple function inlining use cases that are now handled. This isn't a fully general approach because optimal inlining is recursive. Inlining something may open up further inlining opportunities, which either requires multiple iterations or a worklist algorithm, both of which don't work when doing late-stage inlining in the printer. But the function inlining that esbuild now implements is still useful even though it's one level deep, and so I believe it's still worth adding.

## 0.14.9

* Implement cross-module tree shaking of TypeScript enum values ([#128](https://github.com/evanw/esbuild/issues/128))

    If your bundle uses TypeScript enums across multiple files, esbuild is able to inline the enum values as long as you export and import the enum using the ES module `export` and `import` keywords. However, this previously still left the definition of the enum in the bundle even when it wasn't used anymore. This was because esbuild's tree shaking (i.e. dead code elimination) is based on information recorded during parsing, and at that point we don't know which imported symbols are inlined enum values and which aren't.

    With this release, esbuild will now remove enum definitions that become unused due to cross-module enum value inlining. Property accesses off of imported symbols are now tracked separately during parsing and then resolved during linking once all inlined enum values are known. This behavior change means esbuild's support for cross-module inlining of TypeScript enums is now finally complete. Here's an example:

    ```js
    // entry.ts
    import { Foo } from './enum'
    console.log(Foo.Bar)

    // enum.ts
    export enum Foo { Bar }
    ```

    Bundling the example code above now results in the enum definition being completely removed from the bundle:

    ```js
    // Old output (with --bundle --minify --format=esm)
    var r=(o=>(o[o.Bar=0]="Bar",o))(r||{});console.log(0);

    // New output (with --bundle --minify --format=esm)
    console.log(0);
    ```

* Fix a regression with `export {} from` and CommonJS ([#1890](https://github.com/evanw/esbuild/issues/1890))

    This release fixes a regression that was introduced by the change in 0.14.7 that avoids calling the `__toESM` wrapper for import statements that are converted to `require` calls and that don't use the `default` or `__esModule` export names. The previous change was correct for the `import {} from` syntax but not for the `export {} from` syntax, which meant that in certain cases with re-exported values, the value of the `default` import could be different than expected. This release fixes the regression.

* Warn about using `module` or `exports` in ESM code ([#1887](https://github.com/evanw/esbuild/issues/1887))

    CommonJS export variables cannot be referenced in ESM code. If you do this, they are treated as global variables instead. This release includes a warning for people that try to use both CommonJS and ES module export styles in the same file. Here's an example:

    ```ts
    export enum Something {
      a,
      b,
    }
    module.exports = { a: 1, b: 2 }
    ```

    Running esbuild on that code now generates a warning that looks like this:

    ```
    ▲ [WARNING] The CommonJS "module" variable is treated as a global variable in an ECMAScript module and may not work as expected

        example.ts:5:0:
          5 │ module.exports = { a: 1, b: 2 }
            ╵ ~~~~~~

      This file is considered to be an ECMAScript module because of the "export" keyword here:

        example.ts:1:0:
          1 │ export enum Something {
            ╵ ~~~~~~
    ```

## 0.14.8

* Add a `resolve` API for plugins ([#641](https://github.com/evanw/esbuild/issues/641), [#1652](https://github.com/evanw/esbuild/issues/1652))

    Plugins now have access to a new API called `resolve` that runs esbuild's path resolution logic and returns the result to the caller. This lets you write plugins that can reuse esbuild's complex built-in path resolution logic to change the inputs and/or adjust the outputs. Here's an example:

    ```js
    let examplePlugin = {
      name: 'example',
      setup(build) {
        build.onResolve({ filter: /^example$/ }, async () => {
          const result = await build.resolve('./foo', { resolveDir: '/bar' })
          if (result.errors.length > 0) return result
          return { ...result, external: true }
        })
      },
    }
    ```

    This plugin intercepts imports to the path `example`, tells esbuild to resolve the import `./foo` in the directory `/bar`, and then forces whatever path esbuild returns to be considered external. Here are some additional details:

    * If you don't pass the optional `resolveDir` parameter, esbuild will still run `onResolve` plugin callbacks but will not attempt any path resolution itself. All of esbuild's path resolution logic depends on the `resolveDir` parameter including looking for packages in `node_modules` directories (since it needs to know where those `node_modules` directories might be).

    * If you want to resolve a file name in a specific directory, make sure the input path starts with `./`. Otherwise the input path will be treated as a package path instead of a relative path. This behavior is identical to esbuild's normal path resolution logic.

    * If path resolution fails, the `errors` property on the returned object will be a non-empty array containing the error information. This function does not always throw an error when it fails. You need to check for errors after calling it.

    * The behavior of this function depends on the build configuration. That's why it's a property of the `build` object instead of being a top-level API call. This also means you can't call it until all plugin `setup` functions have finished since these give plugins the opportunity to adjust the build configuration before it's frozen at the start of the build. So the new `resolve` function is going to be most useful inside your `onResolve` and/or `onLoad` callbacks.

    * There is currently no attempt made to detect infinite path resolution loops. Calling `resolve` from within `onResolve` with the same parameters is almost certainly a bad idea.

* Avoid the CJS-to-ESM wrapper in some cases ([#1831](https://github.com/evanw/esbuild/issues/1831))

    Import statements are converted into `require()` calls when the output format is set to CommonJS. To convert from CommonJS semantics to ES module semantics, esbuild wraps the return value in a call to esbuild's `__toESM()` helper function. However, the conversion is only needed if it's possible that the exports named `default` or `__esModule` could be accessed.

    This release avoids calling this helper function in cases where esbuild knows it's impossible for the `default` or `__esModule` exports to be accessed, which results in smaller and faster code. To get this behavior, you have to use the `import {} from` import syntax:

    ```js
    // Original code
    import { readFile } from "fs";
    readFile();

    // Old output (with --format=cjs)
    var __toESM = (module, isNodeMode) => {
      ...
    };
    var import_fs = __toESM(require("fs"));
    (0, import_fs.readFile)();

    // New output (with --format=cjs)
    var import_fs = require("fs");
    (0, import_fs.readFile)();
    ```

* Strip overwritten function declarations when minifying ([#610](https://github.com/evanw/esbuild/issues/610))

    JavaScript allows functions to be re-declared, with each declaration overwriting the previous declaration. This type of code can sometimes be emitted by automatic code generators. With this release, esbuild now takes this behavior into account when minifying to drop all but the last declaration for a given function:

    ```js
    // Original code
    function foo() { console.log(1) }
    function foo() { console.log(2) }

    // Old output (with --minify)
    function foo(){console.log(1)}function foo(){console.log(2)}

    // New output (with --minify)
    function foo(){console.log(2)}
    ```

* Add support for the Linux IBM Z 64-bit Big Endian platform ([#1864](https://github.com/evanw/esbuild/pull/1864))

    With this release, the esbuild package now includes a Linux binary executable for the IBM System/390 64-bit architecture. This new platform was contributed by [@shahidhs-ibm](https://github.com/shahidhs-ibm).

* Allow whitespace around `:` in JSX elements ([#1877](https://github.com/evanw/esbuild/issues/1877))

    This release allows you to write the JSX `<rdf:Description rdf:ID="foo" />` as `<rdf : Description rdf : ID="foo" />` instead. Doing this is not forbidden by [the JSX specification](https://facebook.github.io/jsx/). While this doesn't work in TypeScript, it does work with other JSX parsers in the ecosystem, so support for this has been added to esbuild.

## 0.14.7

* Cross-module inlining of TypeScript `enum` constants ([#128](https://github.com/evanw/esbuild/issues/128))

    This release adds inlining of TypeScript `enum` constants across separate modules. It activates when bundling is enabled and when the enum is exported via the `export` keyword and imported via the `import` keyword:

    ```ts
    // foo.ts
    export enum Foo { Bar }

    // bar.ts
    import { Foo } from './foo.ts'
    console.log(Foo.Bar)
    ```

    The access to `Foo.Bar` will now be compiled into `0 /* Bar */` even though the enum is defined in a separate file. This inlining was added without adding another pass (which would have introduced a speed penalty) by splitting the code for the inlining between the existing parsing and printing passes. Enum inlining is active whether or not you use `enum` or `const enum` because it improves performance.

    To demonstrate the performance improvement, I compared the performance of the TypeScript compiler built by bundling the TypeScript compiler source code with esbuild before and after this change. The speed of the compiler was measured by using it to type check a small TypeScript code base. Here are the results:

    |      | `tsc` | with esbuild 0.14.6 | with esbuild 0.14.7 |
    |------|-------|---------------------|---------------------|
    | Time | 2.96s | 3.45s               | 2.95s               |

    As you can see, enum inlining gives around a 15% speedup, which puts the esbuild-bundled version at the same speed as the offical TypeScript compiler build (the `tsc` column)!

    The specifics of the benchmark aren't important here since it's just a demonstration of how enum inlining can affect performance. But if you're wondering, I type checked the [Rollup](https://github.com/rollup/rollup) code base using a work-in-progress branch of the TypeScript compiler that's part of the ongoing effort to convert their use of namespaces into ES modules.

* Mark node built-in modules as having no side effects ([#705](https://github.com/evanw/esbuild/issues/705))

    This release marks node built-in modules such as `fs` as being side-effect free. That means unused imports to these modules are now removed when bundling, which sometimes results in slightly smaller code. For example:

    ```js
    // Original code
    import fs from 'fs';
    import path from 'path';
    console.log(path.delimiter);

    // Old output (with --bundle --minify --platform=node --format=esm)
    import"fs";import o from"path";console.log(o.delimiter);

    // New output (with --bundle --minify --platform=node --format=esm)
    import o from"path";console.log(o.delimiter);
    ```

    Note that these modules are only automatically considered side-effect when bundling for node, since they are only known to be side-effect free imports in that environment. However, you can customize this behavior with a plugin by returning `external: true` and `sideEffects: false` in an `onResolve` callback for whatever paths you want to be treated this way.

* Recover from a stray top-level `}` in CSS ([#1876](https://github.com/evanw/esbuild/pull/1876))

    This release fixes a bug where a stray `}` at the top-level of a CSS file would incorrectly truncate the remainder of the file in the output (although not without a warning). With this release, the remainder of the file is now still parsed and printed:

    ```css
    /* Original code */
    .red {
      color: red;
    }
    }
    .blue {
      color: blue;
    }
    .green {
      color: green;
    }

    /* Old output (with --minify) */
    .red{color:red}

    /* New output (with --minify) */
    .red{color:red}} .blue{color:#00f}.green{color:green}
    ```

    This fix was contributed by [@sbfaulkner](https://github.com/sbfaulkner).

## 0.14.6

* Fix a minifier bug with BigInt literals

    Previously expression simplification optimizations in the minifier incorrectly assumed that numeric operators always return numbers. This used to be true but has no longer been true since the introduction of BigInt literals in ES2020. Now numeric operators can return either a number or a BigInt depending on the arguments. This oversight could potentially have resulted in behavior changes. For example, this code printed `false` before being minified and `true` after being minified because esbuild shortened `===` to `==` under the false assumption that both operands were numbers:

    ```js
    var x = 0;
    console.log((x ? 2 : -1n) === -1);
    ```

    The type checking logic has been rewritten to take into account BigInt literals in this release, so this incorrect simplification is no longer applied.

* Enable removal of certain unused template literals ([#1853](https://github.com/evanw/esbuild/issues/1853))

    This release contains improvements to the minification of unused template literals containing primitive values:

    ```js
    // Original code
    `${1}${2}${3}`;
    `${x ? 1 : 2}${y}`;

    // Old output (with --minify)
    ""+1+2+3,""+(x?1:2)+y;

    // New output (with --minify)
    x,`${y}`;
    ```

    This can arise when the template literals are nested inside of another function call that was determined to be unnecessary such as an unused call to a function marked with the `/* @__PURE__ */` pragma.

    This release also fixes a bug with this transformation where minifying the unused expression `` `foo ${bar}` `` into `"" + bar` changed the meaning of the expression. Template string interpolation always calls `toString` while string addition may call `valueOf` instead. This unused expression is now minified to `` `${bar}` ``, which is slightly longer but which avoids the behavior change.

* Allow `keyof`/`readonly`/`infer` in TypeScript index signatures ([#1859](https://github.com/evanw/esbuild/pull/1859))

    This release fixes a bug that prevented these keywords from being used as names in index signatures. The following TypeScript code was previously rejected, but is now accepted:

    ```ts
    interface Foo {
      [keyof: string]: number
    }
    ```

    This fix was contributed by [@magic-akari](https://github.com/magic-akari).

* Avoid warning about `import.meta` if it's replaced ([#1868](https://github.com/evanw/esbuild/issues/1868))

    It's possible to replace the `import.meta` expression using the `--define:` feature. Previously doing that still warned that the `import.meta` syntax was not supported when targeting ES5. With this release, there will no longer be a warning in this case.

## 0.14.5

* Fix an issue with the publishing script

    This release fixes a missing dependency issue in the publishing script where it was previously possible for the published binary executable to have an incorrect version number.

## 0.14.4

* Adjust esbuild's handling of `default` exports and the `__esModule` marker ([#532](https://github.com/evanw/esbuild/issues/532), [#1591](https://github.com/evanw/esbuild/issues/1591), [#1719](https://github.com/evanw/esbuild/issues/1719))

    This change requires some background for context. Here's the history to the best of my understanding:

    When the ECMAScript module `import`/`export` syntax was being developed, the CommonJS module format (used in Node.js) was already widely in use. Because of this the export name called `default` was given special a syntax. Instead of writing `import { default as foo } from 'bar'` you can just write `import foo from 'bar'`. The idea was that when ECMAScript modules (a.k.a. ES modules) were introduced, you could import existing CommonJS modules using the new import syntax for compatibility. Since CommonJS module exports are dynamic while ES module exports are static, it's not generally possible to determine a CommonJS module's export names at module instantiation time since the code hasn't been evaluated yet. So the value of `module.exports` is just exported as the `default` export and the special `default` import syntax gives you easy access to `module.exports` (i.e. `const foo = require('bar')` is the same as `import foo from 'bar'`).

    However, it took a while for ES module syntax to be supported natively by JavaScript runtimes, and people still wanted to start using ES module syntax in the meantime. The [Babel](https://babeljs.io/) JavaScript compiler let you do this. You could transform each ES module file into a CommonJS module file that behaved the same. However, this transformation has a problem: emulating the `import` syntax accurately as described above means that `export default 0` and `import foo from 'bar'` will no longer line up when transformed to CommonJS. The code `export default 0` turns into `module.exports.default = 0` and the code `import foo from 'bar'` turns into `const foo = require('bar')`, meaning `foo` is `0` before the transformation but `foo` is `{ default: 0 }` after the transformation.

    To fix this, Babel sets the property `__esModule` to true as a signal to itself when it converts an ES module to a CommonJS module. Then, when importing a `default` export, it can know to use the value of `module.exports.default` instead of `module.exports` to make sure the behavior of the CommonJS modules correctly matches the behavior of the original ES modules. This fix has been widely adopted across the ecosystem and has made it into other tools such as TypeScript and even esbuild.

    However, when Node.js finally released their ES module implementation, they went with the original implementation where the `default` export is always `module.exports`, which broke compatibility with the existing ecosystem of ES modules that had been cross-compiled into CommonJS modules by Babel. You now have to either add or remove an additional `.default` property depending on whether your code needs to run in a Node environment or in a Babel environment, which created an interoperability headache. In addition, JavaScript tools such as esbuild now need to guess whether you want Node-style or Babel-style `default` imports. There's no way for a tool to know with certainty which one a given file is expecting and if your tool guesses wrong, your code will break.

    This release changes esbuild's heuristics around `default` exports and the `__esModule` marker to attempt to improve compatibility with Webpack and Node, which is what most packages are tuned for. The behavior changes are as follows:

    Old behavior:

    * If an `import` statement is used to load a CommonJS file and a) `module.exports` is an object, b) `module.exports.__esModule` is truthy, and c) the property `default` exists in `module.exports`, then esbuild would set the `default` export to `module.exports.default` (like Babel). Otherwise the `default` export was set to `module.exports` (like Node).

    * If a `require` call is used to load an ES module file, the returned module namespace object had the `__esModule` property set to true. This behaved as if the ES module had been converted to CommonJS via  a Babel-compatible transformation.

    * The `__esModule` marker could inconsistently appear on module namespace objects (i.e. `import * as`) when writing pure ESM code. Specifically, if a module namespace object was materialized then the `__esModule` marker was present, but if it was optimized away then the `__esModule` marker was absent.

    * It was not allowed to create an ES module export named `__esModule`. This avoided generating code that might break due to the inconsistency mentioned above, and also avoided issues with duplicate definitions of `__esModule`.

    New behavior:

    * If an `import` statement is used to load a CommonJS file and a) `module.exports` is an object, b) `module.exports.__esModule` is truthy, and c) the file name does not end in either `.mjs` or `.mts` and the `package.json` file does not contain `"type": "module"`, then esbuild will set the `default` export to `module.exports.default` (like Babel). Otherwise the `default` export is set to `module.exports` (like Node).

        Note that this means the `default` export may now be undefined in situations where it previously wasn't undefined. This matches Webpack's behavior so it should hopefully be more compatible.

        Also note that this means import behavior now depends on the file extension and on the contents of `package.json`. This also matches Webpack's behavior to hopefully improve compatibility.

    * If a `require` call is used to load an ES module file, the returned module namespace object has the `__esModule` property set to `true`. This behaves as if the ES module had been converted to CommonJS via  a Babel-compatible transformation.

    * If an `import` statement or `import()` expression is used to load an ES module, the `__esModule` marker should now never be present on the module namespace object. This frees up the `__esModule` export name for use with ES modules.

    * It's now allowed to use `__esModule` as a normal export name in an ES module. This property will be accessible to other ES modules but will not be accessible to code that loads the ES module using `require`, where they will observe the property set to `true` instead.

## 0.14.3

* Pass the current esbuild instance to JS plugins ([#1790](https://github.com/evanw/esbuild/issues/1790))

    Previously JS plugins that wanted to run esbuild had to `require('esbuild')` to get the esbuild object. However, that could potentially result in a different version of esbuild. This is also more complicated to do outside of node (such as within a browser). With this release, the current esbuild instance is now passed to JS plugins as the `esbuild` property:

    ```js
    let examplePlugin = {
      name: 'example',
      setup(build) {
        console.log(build.esbuild.version)
        console.log(build.esbuild.transformSync('1+2'))
      },
    }
    ```

* Disable `calc()` transform for results with non-finite numbers ([#1839](https://github.com/evanw/esbuild/issues/1839))

    This release disables minification of `calc()` expressions when the result contains `NaN`, `-Infinity`, or `Infinity`. These numbers are valid inside of `calc()` expressions but not outside of them, so the `calc()` expression must be preserved in these cases.

* Move `"use strict"` before injected shim imports ([#1837](https://github.com/evanw/esbuild/issues/1837))

    If a CommonJS file contains a `"use strict"` directive, it could potentially be unintentionally disabled by esbuild when using the "inject" feature when bundling is enabled. This is because the inject feature was inserting a call to the initializer for the injected file before the `"use strict"` directive. In JavaScript, directives do not apply if they come after a non-directive statement. This release fixes the problem by moving the `"use strict"` directive before the initializer for the injected file so it isn't accidentally disabled.

* Pass the ignored path query/hash suffix to `onLoad` plugins ([#1827](https://github.com/evanw/esbuild/issues/1827))

    The built-in `onResolve` handler that comes with esbuild can strip the query/hash suffix off of a path during path resolution. For example, `url("fonts/icons.eot?#iefix")` can be resolved to the file `fonts/icons.eot`. For context, IE8 has a bug where it considers the font face URL to extend to the last `)` instead of the first `)`. In the example below, IE8 thinks the URL for the font is `Example.eot?#iefix') format('eot'), url('Example.ttf') format('truetype` so by adding `?#iefix`, IE8 thinks the URL has a path of `Example.eot` and a query string of `?#iefix') format('eot...` and can load the font file:

    ```css
    @font-face {
      font-family: 'Example';
      src: url('Example.eot?#iefix') format('eot'), url('Example.ttf') format('truetype');
    }
    ```

    However, the suffix is not currently passed to esbuild and plugins may want to use this suffix for something. Previously plugins had to add their own `onResolve` handler if they wanted to use the query suffix. With this release, the suffix can now be returned by plugins from `onResolve` and is now passed to plugins in `onLoad`:

    ```js
    let examplePlugin = {
      name: 'example',
      setup(build) {
        build.onResolve({ filter: /.*/ }, args => {
          return { path: args.path, suffix: '?#iefix' }
        })

        build.onLoad({ filter: /.*/ }, args => {
          console.log({ path: args.path, suffix: args.suffix })
        })
      },
    }
    ```

    The suffix is deliberately not included in the path that's provided to plugins because most plugins won't know to handle this strange edge case and would likely break. Keeping the suffix out of the path means that plugins can opt-in to handling this edge case if they want to, and plugins that aren't aware of this edge case will likely still do something reasonable.

## 0.14.2

* Add `[ext]` placeholder for path templates ([#1799](https://github.com/evanw/esbuild/pull/1799))

    This release adds the `[ext]` placeholder to the `--entry-names=`, `--chunk-names=`, and `--asset-names=` configuration options. The `[ext]` placeholder takes the value of the file extension without the leading `.`, and can be used to place output files with different file extensions into different folders. For example, `--asset-names=assets/[ext]/[name]-[hash]` might generate an output path of `assets/png/image-LSAMBFUD.png`.

    This feature was contributed by [@LukeSheard](https://github.com/LukeSheard).

* Disable star-to-clause transform for external imports ([#1801](https://github.com/evanw/esbuild/issues/1801))

    When bundling is enabled, esbuild automatically transforms `import * as x from 'y'; x.z()` into `import {z} as 'y'; z()` to improve tree shaking. This avoids needing to create the import namespace object `x` if it's unnecessary, which can result in the removal of large amounts of unused code. However, this transform shouldn't be done for external imports because that incorrectly changes the semantics of the import. If the export `z` doesn't exist in the previous example, the value `x.z` is a property access that is undefined at run-time, but the value `z` is an import error that will prevent the code from running entirely. This release fixes the problem by avoiding doing this transform for external imports:

    ```js
    // Original code
    import * as x from 'y';
    x.z();

    // Old output (with --bundle --format=esm --external:y)
    import { z } from "y";
    z();

    // New output (with --bundle --format=esm --external:y)
    import * as x from "y";
    x.z();
    ```

* Disable `calc()` transform for numbers with many fractional digits ([#1821](https://github.com/evanw/esbuild/issues/1821))

    Version 0.13.12 introduced simplification of `calc()` expressions in CSS when minifying. For example, `calc(100% / 4)` turns into `25%`. However, this is problematic for numbers with many fractional digits because either the number is printed with reduced precision, which is inaccurate, or the number is printed with full precision, which could be longer than the original expression. For example, turning `calc(100% / 3)` into `33.33333%` is inaccurate and turning it into `33.333333333333336%` likely isn't desired. In this release, minification of `calc()` is now disabled when any number in the result cannot be represented to full precision with at most five fractional digits.

* Fix an edge case with `catch` scope handling ([#1812](https://github.com/evanw/esbuild/issues/1812))

    This release fixes a subtle edge case with `catch` scope and destructuring assignment. Identifiers in computed properties and/or default values inside the destructuring binding pattern should reference the outer scope, not the inner scope. The fix was to split the destructuring pattern into its own scope, separate from the `catch` body. Here's an example of code that was affected by this edge case:

    ```js
    // Original code
    let foo = 1
    try {
      throw ['a', 'b']
    } catch ({ [foo]: y }) {
      let foo = 2
      assert(y === 'b')
    }

    // Old output (with --minify)
    let foo=1;try{throw["a","b"]}catch({[o]:t}){let o=2;assert(t==="b")}

    // New output (with --minify)
    let foo=1;try{throw["a","b"]}catch({[foo]:t}){let o=2;assert(t==="b")}
    ```

* Go 1.17.2 was upgraded to Go 1.17.4

    The previous release was built with Go 1.17.2, but this release is built with Go 1.17.4. This is just a routine upgrade. There are no changes significant to esbuild outside of some security-related fixes to Go's HTTP stack (but you shouldn't be running esbuild's dev server in production anyway).

    One notable change related to this is that esbuild's publishing script now ensures that git's state is free of uncommitted and/or untracked files before building. Previously this wasn't the case because publishing esbuild involved changing the version number, running the publishing script, and committing at the end, which meant that files were uncommitted during the build process. I also typically had some untracked test files in the same directory during publishing (which is harmless).

    This matters because there's an upcoming change in Go 1.18 where the Go compiler will include metadata about whether there are untracked files or not when doing a build: https://github.com/golang/go/issues/37475. Changing esbuild's publishing script should mean that when esbuild upgrades to Go 1.18, esbuild's binary executables will be marked as being built off of a specific commit without any modifications. This is important for reproducibility. Checking out a specific esbuild commit and building it should give a bitwise-identical binary executable to one that I published. But if this metadata indicated that there were untracked files during the published build, then the resulting executable would no longer be bitwise-identical.

## 0.14.1

* Fix `imports` in `package.json` ([#1807](https://github.com/evanw/esbuild/issues/1807))

    This release contains a fix for the rarely-used [`imports` feature in `package.json` files](https://nodejs.org/api/packages.html#subpath-imports) that lets a package specify a custom remapping for import paths inside that package that start with `#`. Support for `imports` was added in version 0.13.9. However, the field was being incorrectly interpreted as relative to the importing file instead of to the `package.json` file, which caused an import failure when the importing file is in a subdirectory instead of being at the top level of the package. Import paths should now be interpreted as relative to the correct directory which should fix these path resolution failures.

* Isolate implicit sibling scope lookup for `enum` and `namespace`

    The previous release implemented sibling namespaces in TypeScript, which introduces a new kind of scope lookup that doesn't exist in JavaScript. Exported members inside an `enum` or `namespace` block can be implicitly referenced in a sibling `enum` or `namespace` block just by using the name without using a property reference. However, this behavior appears to only work for `enum`-to-`enum` and `namespace`-to-`namespace` interactions. Even though sibling enums and namespaces with the same name can be merged together into the same underlying object, this implicit reference behavior doesn't work for `enum`-to-`namespace` interactions and attempting to do this with a `namespace`-to-`enum` interaction [causes the TypeScript compiler itself to crash](https://github.com/microsoft/TypeScript/issues/46891). Here is an example of how the TypeScript compiler behaves in each case:

    ```ts
    // "b" is accessible
    enum a { b = 1 }
    enum a { c = b }

    // "e" is accessible
    namespace d { export let e = 1 }
    namespace d { export let f = e }

    // "h" is inaccessible
    enum g { h = 1 }
    namespace g { export let i = h }

    // This causes the TypeScript compiler to crash
    namespace j { export let k = 1 }
    enum j { l = k }
    ```

    This release changes the implicit sibling scope lookup behavior to only work for `enum`-to-`enum` and `namespace`-to-`namespace` interactions. These implicit references no longer work with `enum`-to-`namespace` and `namespace`-to-`enum` interactions, which should more accurately match the behavior of the TypeScript compiler.

* Add semicolon insertion before TypeScript-specific definite assignment assertion modifier ([#1810](https://github.com/evanw/esbuild/issues/1810))

    TypeScript lets you add a `!` after a variable declaration to bypass TypeScript's definite assignment analysis:

    ```ts
    let x!: number[];
    initialize();
    x.push(4);

    function initialize() { x = [0, 1, 2, 3]; }
    ```

    This `!` is called a [definite assignment assertion](https://devblogs.microsoft.com/typescript/announcing-typescript-2-7/#definite-assignment-assertions) and tells TypeScript to assume that the variable has been initialized somehow. However, JavaScript's automatic semicolon insertion rules should be able to insert a semicolon before it:

    ```ts
    let a
    !function(){}()
    ```

    Previously the above code was incorrectly considered a syntax error in TypeScript. With this release, this code is now parsed correctly.

* Log output to stderr has been overhauled

    This release changes the way log messages are formatted to stderr. The changes make the kind of message (e.g. error vs. warning vs. note) more obvious, and they also give more room for paragraph-style notes that can provide more detail about the message. Here's an example:

    Before:

    ```
     > example.tsx:14:25: warning: Comparison with -0 using the "===" operator will also match 0
        14 │     case 1: return x === -0
           ╵                          ~~
     > example.tsx:21:23: error: Could not resolve "path" (use "--platform=node" when building for node)
        21 │   const path = require('path')
           ╵                        ~~~~~~
    ```

    After:

    ```
    ▲ [WARNING] Comparison with -0 using the "===" operator will also match 0

        example.tsx:14:25:
          14 │     case 1: return x === -0
             ╵                          ~~

      Floating-point equality is defined such that 0 and -0 are equal, so "x === -0" returns true for
      both 0 and -0. You need to use "Object.is(x, -0)" instead to test for -0.

    ✘ [ERROR] Could not resolve "path"

        example.tsx:21:23:
          21 │   const path = require('path')
             ╵                        ~~~~~~

      The package "path" wasn't found on the file system but is built into node. Are you trying to
      bundle for node? You can use "--platform=node" to do that, which will remove this error.
    ```

    Note that esbuild's formatted log output is for humans, not for machines. If you need to output a stable machine-readable format, you should be using the API for that. Build and transform results have arrays called `errors` and `warnings` with objects that represent the log messages.

* Show inlined enum value names in comments

    When esbuild inlines an enum, it will now put a comment next to it with the original enum name:

    ```ts
    // Original code
    const enum Foo { FOO }
    console.log(Foo.FOO)

    // Old output
    console.log(0);

    // New output
    console.log(0 /* FOO */);
    ```

    This matches the behavior of the TypeScript compiler, and should help with debugging. These comments are not generated if minification is enabled.

## 0.14.0

**This release contains backwards-incompatible changes.** Since esbuild is before version 1.0.0, these changes have been released as a new minor version to reflect this (as [recommended by npm](https://docs.npmjs.com/cli/v6/using-npm/semver/)). You should either be pinning the exact version of `esbuild` in your `package.json` file or be using a version range syntax that only accepts patch upgrades such as `~0.13.0`. See the documentation about [semver](https://docs.npmjs.com/cli/v6/using-npm/semver/) for more information.

* Add support for TypeScript's `preserveValueImports` setting ([#1525](https://github.com/evanw/esbuild/issues/1525))

    TypeScript 4.5, which was just released, added [a new setting called `preserveValueImports`](https://devblogs.microsoft.com/typescript/announcing-typescript-4-5/#preserve-value-imports). This release of esbuild implements support for this new setting. However, this release also changes esbuild's behavior regarding the `importsNotUsedAsValues` setting, so this release is being considered a breaking change. Now esbuild's behavior should more accurately match the behavior of the TypeScript compiler. This is described in more detail below.

    The difference in behavior is around unused imports. By default, unused import names are considered to be types and are completely removed if they are unused. If all import names are removed for a given import statement, then the whole import statement is removed too. The two `tsconfig.json` settings [`importsNotUsedAsValues`](https://www.typescriptlang.org/tsconfig#importsNotUsedAsValues) and [`preserveValueImports`](https://www.typescriptlang.org/tsconfig#preserveValueImports) let you customize this. Here's what the TypeScript compiler's output looks like with these different settings enabled:

    ```ts
    // Original code
    import { unused } from "foo";

    // Default output
    /* (the import is completely removed) */

    // Output with "importsNotUsedAsValues": "preserve"
    import "foo";

    // Output with "preserveValueImports": true
    import { unused } from "foo";
    ```

    Previously, since the `preserveValueImports` setting didn't exist yet, esbuild had treated the `importsNotUsedAsValues` setting as if it were what is now the `preserveValueImports` setting instead. This was a deliberate deviation from how the TypeScript compiler behaves, but was necessary to allow esbuild to be used as a TypeScript-to-JavaScript compiler inside of certain composite languages such as Svelte and Vue. These languages append additional code after converting the TypeScript to JavaScript so unused imports may actually turn out to be used later on:

    ```svelte
    <script>
    import { someFunc } from "./some-module.js";
    </script>
    <button on:click={someFunc}>Click me!</button>
    ```

    Previously the implementers of these languages had to use the `importsNotUsedAsValues` setting as a hack for esbuild to preserve the import statements. With this release, esbuild now follows the behavior of the TypeScript compiler so implementers will need to use the new `preserveValueImports` setting to do this instead. This is the breaking change.

* TypeScript code follows JavaScript class field semantics with `--target=esnext` ([#1480](https://github.com/evanw/esbuild/issues/1480))

    TypeScript 4.3 included a subtle breaking change that wasn't mentioned in the [TypeScript 4.3 blog post](https://devblogs.microsoft.com/typescript/announcing-typescript-4-3/): class fields will now be compiled with different semantics if `"target": "ESNext"` is present in `tsconfig.json`. Specifically in this case `useDefineForClassFields` will default to `true` when not specified instead of `false`. This means class field behavior in TypeScript code will now match JavaScript instead of doing something else:

    ```js
    class Base {
      set foo(value) { console.log('set', value) }
    }
    class Derived extends Base {
      foo = 123
    }
    new Derived()
    ```

    In TypeScript 4.2 and below, the TypeScript compiler would generate code that prints `set 123` when `tsconfig.json` contains `"target": "ESNext"` but in TypeScript 4.3 and above, the TypeScript compiler will now generate code that doesn't print anything. This is the difference between "assign" semantics and "define" semantics.

    Previously you had to create a `tsconfig.json` file and specify `"target": "ESNext"` to get this behavior in esbuild. With this release, you can now also just pass `--target=esnext` to esbuild to force-enable this behavior. Note that esbuild doesn't do this by default even though the default value of `--target=` otherwise behaves like `esnext`. Since TypeScript's compiler doesn't do this behavior by default, it seems like a good idea for esbuild to not do this behavior by default either.

In addition to the breaking changes above, the following changes are also included in this release:

* Allow certain keywords as tuple type labels in TypeScript ([#1797](https://github.com/evanw/esbuild/issues/1797))

    Apparently TypeScript lets you use certain keywords as tuple labels but not others. For example, `type x = [function: number]` is allowed while `type x = [class: number]` isn't. This release replicates this behavior in esbuild's TypeScript parser:

    * Allowed keywords: `false`, `function`, `import`, `new`, `null`, `this`, `true`, `typeof`, `void`

    * Forbidden keywords: `break`, `case`, `catch`, `class`, `const`, `continue`, `debugger`, `default`, `delete`, `do`, `else`, `enum`, `export`, `extends`, `finally`, `for`, `if`, `in`, `instanceof`, `return`, `super`, `switch`, `throw`, `try`, `var`, `while`, `with`

* Support sibling namespaces in TypeScript ([#1410](https://github.com/evanw/esbuild/issues/1410))

    TypeScript has a feature where sibling namespaces with the same name can implicitly reference each other's exports without an explicit property access. This goes against how scope lookup works in JavaScript, so it previously didn't work with esbuild. This release adds support for this feature:

    ```ts
    // Original TypeScript code
    namespace x {
      export let y = 123
    }
    namespace x {
      export let z = y
    }

    // Old JavaScript output
    var x;
    (function(x2) {
      x2.y = 123;
    })(x || (x = {}));
    (function(x2) {
      x2.z = y;
    })(x || (x = {}));

    // New JavaScript output
    var x;
    (function(x2) {
      x2.y = 123;
    })(x || (x = {}));
    (function(x2) {
      x2.z = x2.y;
    })(x || (x = {}));
    ```

    Notice how the identifier `y` is now compiled to the property access `x2.y` which references the export named `y` on the namespace, instead of being left as the identifier `y` which references the global named `y`. This matches how the TypeScript compiler treats namespace objects. This new behavior also works for enums:

    ```ts
    // Original TypeScript code
    enum x {
      y = 123
    }
    enum x {
      z = y + 1
    }

    // Old JavaScript output
    var x;
    (function(x2) {
      x2[x2["y"] = 123] = "y";
    })(x || (x = {}));
    (function(x2) {
      x2[x2["z"] = y + 1] = "z";
    })(x || (x = {}));

    // New JavaScript output
    var x;
    (function(x2) {
      x2[x2["y"] = 123] = "y";
    })(x || (x = {}));
    (function(x2) {
      x2[x2["z"] = 124] = "z";
    })(x || (x = {}));
    ```

    Note that this behavior does **not** work across files. Each file is still compiled independently so the namespaces in each file are still resolved independently per-file. Implicit namespace cross-references still do not work across files. Getting this to work is counter to esbuild's parallel architecture and does not fit in with esbuild's design. It also doesn't make sense with esbuild's bundling model where input files are either in ESM or CommonJS format and therefore each have their own scope.

* Change output for top-level TypeScript enums

    The output format for top-level TypeScript enums has been changed to reduce code size and improve tree shaking, which means that esbuild's enum output is now somewhat different than TypeScript's enum output. The behavior of both output formats should still be equivalent though. Here's an example that shows the difference:

    ```ts
    // Original code
    enum x {
      y = 1,
      z = 2
    }

    // Old output
    var x;
    (function(x2) {
      x2[x2["y"] = 1] = "y";
      x2[x2["z"] = 2] = "z";
    })(x || (x = {}));

    // New output
    var x = /* @__PURE__ */ ((x2) => {
      x2[x2["y"] = 1] = "y";
      x2[x2["z"] = 2] = "z";
      return x2;
    })(x || {});
    ```

    The function expression has been changed to an arrow expression to reduce code size and the enum initializer has been moved into the variable declaration to make it possible to be marked as `/* @__PURE__ */` to improve tree shaking. The `/* @__PURE__ */` annotation is now automatically added when all of the enum values are side-effect free, which means the entire enum definition can be removed as dead code if it's never referenced. Direct enum value references within the same file that have been inlined do not count as references to the enum definition so this should eliminate enums from the output in many cases:

    ```ts
    // Original code
    enum Foo { FOO = 1 }
    enum Bar { BAR = 2 }
    console.log(Foo, Bar.BAR)

    // Old output (with --bundle --minify)
    var n;(function(e){e[e.FOO=1]="FOO"})(n||(n={}));var l;(function(e){e[e.BAR=2]="BAR"})(l||(l={}));console.log(n,2);

    // New output (with --bundle --minify)
    var n=(e=>(e[e.FOO=1]="FOO",e))(n||{});console.log(n,2);
    ```

    Notice how the new output is much shorter because the entire definition for `Bar` has been completely removed as dead code by esbuild's tree shaking.

    The output may seem strange since it would be simpler to just have a plain object literal as an initializer. However, TypeScript's enum feature behaves similarly to TypeScript's namespace feature which means enums can merge with existing enums and/or existing namespaces (and in some cases also existing objects) if the existing definition has the same name. This new output format keeps its similarity to the original output format so that it still handles all of the various edge cases that TypeScript's enum feature supports. Initializing the enum using a plain object literal would not merge with existing definitions and would break TypeScript's enum semantics.

* Fix legal comment parsing in CSS ([#1796](https://github.com/evanw/esbuild/issues/1796))

    Legal comments in CSS either start with `/*!` or contain `@preserve` or `@license` and are preserved by esbuild in the generated CSS output. This release fixes a bug where non-top-level legal comments inside a CSS file caused esbuild to skip any following legal comments even if those following comments are top-level:

    ```css
    /* Original code */
    .example {
      --some-var: var(--tw-empty, /*!*/ /*!*/);
    }
    /*! Some legal comment */
    body {
      background-color: red;
    }

    /* Old output (with --minify) */
    .example{--some-var: var(--tw-empty, )}body{background-color:red}

    /* New output (with --minify) */
    .example{--some-var: var(--tw-empty, )}/*! Some legal comment */body{background-color:red}
    ```

* Fix panic when printing invalid CSS ([#1803](https://github.com/evanw/esbuild/issues/1803))

    This release fixes a panic caused by a conditional CSS `@import` rule with a URL token. Code like this caused esbuild to enter an unexpected state because the case where tokens in the import condition with associated import records wasn't handled. This case is now handled correctly:

    ```css
    @import "example.css" url(foo);
    ```

* Mark `Set` and `Map` with array arguments as pure ([#1791](https://github.com/evanw/esbuild/issues/1791))

    This release introduces special behavior for references to the global `Set` and `Map` constructors that marks them as `/* @__PURE__ */` if they are known to not have any side effects. These constructors evaluate the iterator of whatever is passed to them and the iterator could have side effects, so this is only safe if whatever is passed to them is an array, since the array iterator has no side effects.

    Marking a constructor call as `/* @__PURE__ */` means it's safe to remove if the result is unused. This is an existing feature that you can trigger by manually adding a `/* @__PURE__ */` comment before a constructor call. The difference is that this release contains special behavior to automatically mark `Set` and `Map` as pure for you as long as it's safe to do so. As with all constructor calls that are marked `/* @__PURE__ */`, any internal expressions which could cause side effects are still preserved even though the constructor call itself is removed:

    ```js
    // Original code
    new Map([
      ['a', b()],
      [c(), new Set(['d', e()])],
    ]);

    // Old output (with --minify)
    new Map([["a",b()],[c(),new Set(["d",e()])]]);

    // New output (with --minify)
    b(),c(),e();
    ```

## 0.13.15

* Fix `super` in lowered `async` arrow functions ([#1777](https://github.com/evanw/esbuild/issues/1777))

    This release fixes an edge case that was missed when lowering `async` arrow functions containing `super` property accesses for compile targets that don't support `async` such as with `--target=es6`. The problem was that lowering transforms `async` arrow functions into generator function expressions that are then passed to an esbuild helper function called `__async` that implements the `async` state machine behavior. Since function expressions do not capture `this` and `super` like arrow functions do, this led to a mismatch in behavior which meant that the transform was incorrect. The fix is to introduce a helper function to forward `super` access into the generator function expression body. Here's an example:

    ```js
    // Original code
    class Foo extends Bar {
      foo() { return async () => super.bar() }
    }

    // Old output (with --target=es6)
    class Foo extends Bar {
      foo() {
        return () => __async(this, null, function* () {
          return super.bar();
        });
      }
    }

    // New output (with --target=es6)
    class Foo extends Bar {
      foo() {
        return () => {
          var __superGet = (key) => super[key];
          return __async(this, null, function* () {
            return __superGet("bar").call(this);
          });
        };
      }
    }
    ```

* Avoid merging certain CSS rules with different units ([#1732](https://github.com/evanw/esbuild/issues/1732))

    This release no longer collapses `border-radius`, `margin`, `padding`, and `inset` rules when they have units with different levels of browser support. Collapsing multiple of these rules into a single rule is not equivalent if the browser supports one unit but not the other unit, since one rule would still have applied before the collapse but no longer applies after the collapse due to the whole rule being ignored. For example, Chrome 10 supports the `rem` unit but not the `vw` unit, so the CSS code below should render with rounded corners in Chrome 10. However, esbuild previously merged everything into a single rule which would cause Chrome 10 to ignore the rule and not round the corners. This issue is now fixed:

    ```css
    /* Original CSS */
    div {
      border-radius: 1rem;
      border-top-left-radius: 1vw;
      margin: 0;
      margin-top: 1Q;
      left: 10Q;
      top: 20Q;
      right: 10Q;
      bottom: 20Q;
    }

    /* Old output (with --minify) */
    div{border-radius:1vw 1rem 1rem;margin:1Q 0 0;inset:20Q 10Q}

    /* New output (with --minify) */
    div{border-radius:1rem;border-top-left-radius:1vw;margin:0;margin-top:1Q;inset:20Q 10Q}
    ```

    Notice how esbuild can still collapse rules together when they all share the same unit, even if the unit is one that doesn't have universal browser support such as the unit `Q`. One subtlety is that esbuild now distinguishes between "safe" and "unsafe" units where safe units are old enough that they are guaranteed to work in any browser a user might reasonably use, such as `px`. Safe units are allowed to be collapsed together even if there are multiple different units while multiple different unsafe units are not allowed to be collapsed together. Another detail is that esbuild no longer minifies zero lengths by removing the unit if the unit is unsafe (e.g. `0rem` into `0`) since that could cause a rendering difference if a previously-ignored rule is now no longer ignored due to the unit change. If you are curious, you can learn more about browser support levels for different CSS units in [Mozilla's documentation about CSS length units](https://developer.mozilla.org/en-US/docs/Web/CSS/length).

* Avoid warning about ignored side-effect free imports for empty files ([#1785](https://github.com/evanw/esbuild/issues/1785))

    When bundling, esbuild warns about bare imports such as `import "lodash-es"` when the package has been marked as `"sideEffects": false` in its `package.json` file. This is because the only reason to use a bare import is because you are relying on the side effects of the import, but imports for packages marked as side-effect free are supposed to be removed. If the package indicates that it has no side effects, then this bare import is likely a bug.

    However, some people have packages just for TypeScript type definitions. These package can actually have a side effect as they can augment the type of the global object in TypeScript, even if they are marked with `"sideEffects": false`. To avoid warning in this case, esbuild will now only issue this warning if the imported file is non-empty. If the file is empty, then it's irrelevant whether you import it or not so any import of that file does not indicate a bug. This fixes this case because `.d.ts` files typically end up being empty after esbuild parses them since they typically only contain type declarations.

* Attempt to fix packages broken due to the `node:` prefix ([#1760](https://github.com/evanw/esbuild/issues/1760))

    Some people have started using the node-specific `node:` path prefix in their packages. This prefix forces the following path to be interpreted as a node built-in module instead of a package on the file system. So `require("node:path")` will always import [node's `path` module](https://nodejs.org/api/path.html) and never import [npm's `path` package](https://www.npmjs.com/package/path).

    Adding the `node:` prefix breaks that code with older node versions that don't understand the `node:` prefix. This is a problem with the package, not with esbuild. The package should be adding a fallback if the `node:` prefix isn't available. However, people still want to be able to use these packages with older node versions even though the code is broken. Now esbuild will automatically strip this prefix if it detects that the code will break in the configured target environment (as specified by `--target=`). Note that this only happens during bundling, since import paths are only examined during bundling.

## 0.13.14

* Fix dynamic `import()` on node 12.20+ ([#1772](https://github.com/evanw/esbuild/issues/1772))

    When you use flags such as `--target=node12.20`, esbuild uses that version number to see what features the target environment supports. This consults an internal table that stores which target environments are supported for each feature. For example, `import(x)` is changed into `Promise.resolve().then(() => require(x))` if dynamic `import` expressions are unsupported.

    Previously esbuild's internal table only stored one version number, since features are rarely ever removed in newer versions of software. Either the target environment is before that version and the feature is unsupported, or the target environment is after that version and the feature is supported. This approach has work for all relevant features in all cases except for one: dynamic `import` support in node. This feature is supported in node 12.20.0 up to but not including node 13.0.0, and then is also supported in node 13.2.0 up. The feature table implementation has been changed to store an array of potentially discontiguous version ranges instead of one version number.

    Up until now, esbuild used 13.2.0 as the lowest supported version number to avoid generating dynamic `import` expressions when targeting node versions that don't support it. But with this release, esbuild will now use the more accurate discontiguous version range in this case. This means dynamic `import` expressions can now be generated when targeting versions of node 12.20.0 up to but not including node 13.0.0.

* Avoid merging certain qualified rules in CSS ([#1776](https://github.com/evanw/esbuild/issues/1776))

    A change was introduced in the previous release to merge adjacent CSS rules that have the same content:

    ```css
    /* Original code */
    a { color: red }
    b { color: red }

    /* Minified output */
    a,b{color:red}
    ```

    However, that introduced a regression in cases where the browser considers one selector to be valid and the other selector to be invalid, such as in the following example:

    ```css
    /* This rule is valid, and is applied */
    a { color: red }

    /* This rule is invalid, and is ignored */
    b:-x-invalid { color: red }
    ```

    Merging these two rules into one causes the browser to consider the entire merged rule to be invalid, which disables both rules. This is a change in behavior from the original code.

    With this release, esbuild will now only merge adjacent duplicate rules together if they are known to work in all browsers (specifically, if they are known to work in IE 7 and up). Adjacent duplicate rules will no longer be merged in all other cases including modern pseudo-class selectors such as `:focus`, HTML5 elements such as `video`, and combinators such as `a + b`.

* Minify syntax in the CSS `font`, `font-family`, and `font-weight` properties ([#1756](https://github.com/evanw/esbuild/pull/1756))

    This release includes size reductions for CSS font syntax when minification is enabled:

    ```css
    /* Original code */
    div {
      font: bold 1rem / 1.2 "Segoe UI", sans-serif, "Segoe UI Emoji";
    }

    /* Output with "--minify" */
    div{font:700 1rem/1.2 Segoe UI,sans-serif,"Segoe UI Emoji"}
    ```

    Notice how `bold` has been changed to `700` and the quotes were removed around `"Segoe UI"` since it was safe to do so.

    This feature was contributed by [@sapphi-red](https://github.com/sapphi-red).

## 0.13.13

* Add more information about skipping `"main"` in `package.json` ([#1754](https://github.com/evanw/esbuild/issues/1754))

    Configuring `mainFields: []` breaks most npm packages since it tells esbuild to ignore the `"main"` field in `package.json`, which most npm packages use to specify their entry point. This is not a bug with esbuild because esbuild is just doing what it was told to do. However, people may do this without understanding how npm packages work, and then be confused about why it doesn't work. This release now includes additional information in the error message:

    ```
     > foo.js:1:27: error: Could not resolve "events" (use "--platform=node" when building for node)
         1 │ var EventEmitter = require('events')
           ╵                            ~~~~~~~~
       node_modules/events/package.json:20:2: note: The "main" field was ignored because the list of main fields to use is currently set to []
        20 │   "main": "./events.js",
           ╵   ~~~~~~
    ```

* Fix a tree-shaking bug with `var exports` ([#1739](https://github.com/evanw/esbuild/issues/1739))

    This release fixes a bug where a variable named `var exports = {}` was incorrectly removed by tree-shaking (i.e. dead code elimination). The `exports` variable is a special variable in CommonJS modules that is automatically provided by the CommonJS runtime. CommonJS modules are transformed into something like this before being run:

    ```js
    function(exports, module, require) {
      var exports = {}
    }
    ```

    So using `var exports = {}` should have the same effect as `exports = {}` because the variable `exports` should already be defined. However, esbuild was incorrectly overwriting the definition of the `exports` variable with the one provided by CommonJS. This release merges the definitions together so both are included, which fixes the bug.

* Merge adjacent CSS selector rules with duplicate content ([#1755](https://github.com/evanw/esbuild/issues/1755))

    With this release, esbuild will now merge adjacent selectors when minifying if they have the same content:

    ```css
    /* Original code */
    a { color: red }
    b { color: red }

    /* Old output (with --minify) */
    a{color:red}b{color:red}

    /* New output (with --minify) */
    a,b{color:red}
    ```

* Shorten `top`, `right`, `bottom`, `left` CSS property into `inset` when it is supported ([#1758](https://github.com/evanw/esbuild/pull/1758))

    This release enables collapsing of `inset` related properties:

    ```css
    /* Original code */
    div {
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }

    /* Output with "--minify-syntax" */
    div {
      inset: 0;
    }
    ```

    This minification rule is only enabled when `inset` property is supported by the target environment. Make sure to set esbuild's `target` setting correctly when minifying if the code will be running in an older environment (e.g. earlier than Chrome 87).

    This feature was contributed by [@sapphi-red](https://github.com/sapphi-red).

## 0.13.12

* Implement initial support for simplifying `calc()` expressions in CSS ([#1607](https://github.com/evanw/esbuild/issues/1607))

    This release includes basic simplification of `calc()` expressions in CSS when minification is enabled. The approach mainly follows the official CSS specification, which means it should behave the way browsers behave: https://www.w3.org/TR/css-values-4/#calc-func. This is a basic implementation so there are probably some `calc()` expressions that can be reduced by other tools but not by esbuild. This release mainly focuses on setting up the parsing infrastructure for `calc()` expressions to make it straightforward to implement additional simplifications in the future. Here's an example of this new functionality:

    ```css
    /* Input CSS */
    div {
      width: calc(60px * 4 - 5px * 2);
      height: calc(100% / 4);
    }

    /* Output CSS (with --minify-syntax) */
    div {
      width: 230px;
      height: 25%;
    }
    ```

    Expressions that can't be fully simplified will still be partially simplified into a reduced `calc()` expression:

    ```css
    /* Input CSS */
    div {
      width: calc(100% / 5 - 2 * 1em - 2 * 1px);
    }

    /* Output CSS (with --minify-syntax) */
    div {
      width: calc(20% - 2em - 2px);
    }
    ```

    Note that this transformation doesn't attempt to modify any expression containing a `var()` CSS variable reference. These variable references can contain any number of tokens so it's not safe to move forward with a simplification assuming that `var()` is a single token. For example, `calc(2px * var(--x) * 3)` is not transformed into `calc(6px * var(--x))` in case `var(--x)` contains something like `4 + 5px` (`calc(2px * 4 + 5px * 3)` evaluates to `23px` while `calc(6px * 4 + 5px)` evaluates to `29px`).

* Fix a crash with a legal comment followed by an import ([#1730](https://github.com/evanw/esbuild/issues/1730))

    Version 0.13.10 introduced parsing for CSS legal comments but caused a regression in the code that checks whether there are any rules that come before `@import`. This is not desired because browsers ignore `@import` rules after other non-`@import` rules, so esbuild warns you when you do this. However, legal comments are modeled as rules in esbuild's internal AST even though they aren't actual CSS rules, and the code that performs this check wasn't updated. This release fixes the crash.

## 0.13.11

* Implement class static blocks ([#1558](https://github.com/evanw/esbuild/issues/1558))

    This release adds support for a new upcoming JavaScript feature called [class static blocks](https://github.com/tc39/proposal-class-static-block) that lets you evaluate code inside of a class body. It looks like this:

    ```js
    class Foo {
      static {
        this.foo = 123
      }
    }
    ```

    This can be useful when you want to use `try`/`catch` or access private `#name` fields during class initialization. Doing that without this feature is quite hacky and basically involves creating temporary static fields containing immediately-invoked functions and then deleting the fields after class initialization. Static blocks are much more ergonomic and avoid performance loss due to `delete` changing the object shape.

    Static blocks are transformed for older browsers by moving the static block outside of the class body and into an immediately invoked arrow function after the class definition:

    ```js
    // The transformed version of the example code above
    const _Foo = class {
    };
    let Foo = _Foo;
    (() => {
      _Foo.foo = 123;
    })();
    ```

    In case you're wondering, the additional `let` variable is to guard against the potential reassignment of `Foo` during evaluation such as what happens below. The value of `this` must be bound to the original class, not to the current value of `Foo`:

    ```js
    let bar
    class Foo {
      static {
        bar = () => this
      }
    }
    Foo = null
    console.log(bar()) // This should not be "null"
    ```

* Fix issues with `super` property accesses

    Code containing `super` property accesses may need to be transformed even when they are supported. For example, in ES6 `async` methods are unsupported while `super` properties are supported. An `async` method containing `super` property accesses requires those uses of `super` to be transformed (the `async` function is transformed into a nested generator function and the `super` keyword cannot be used inside nested functions).

    Previously esbuild transformed `super` property accesses into a function call that returned the corresponding property. However, this was incorrect for uses of `super` that write to the inherited setter since a function call is not a valid assignment target. This release fixes writing to a `super` property:

    ```js
    // Original code
    class Base {
      set foo(x) { console.log('set foo to', x) }
    }
    class Derived extends Base {
      async bar() { super.foo = 123 }
    }
    new Derived().bar()

    // Old output with --target=es6 (contains a syntax error)
    class Base {
      set foo(x) {
        console.log("set foo to", x);
      }
    }
    class Derived extends Base {
      bar() {
        var __super = (key) => super[key];
        return __async(this, null, function* () {
          __super("foo") = 123;
        });
      }
    }
    new Derived().bar();

    // New output with --target=es6 (works correctly)
    class Base {
      set foo(x) {
        console.log("set foo to", x);
      }
    }
    class Derived extends Base {
      bar() {
        var __superSet = (key, value) => super[key] = value;
        return __async(this, null, function* () {
          __superSet("foo", 123);
        });
      }
    }
    new Derived().bar();
    ```

    All known edge cases for assignment to a `super` property should now be covered including destructuring assignment and using the unary assignment operators with BigInts.

    In addition, this release also fixes a bug where a `static` class field containing a `super` property access was not transformed when it was moved outside of the class body, which can happen when `static` class fields aren't supported.

    ```js
    // Original code
    class Base {
      static get foo() {
        return 123
      }
    }
    class Derived extends Base {
      static bar = super.foo
    }

    // Old output with --target=es6 (contains a syntax error)
    class Base {
      static get foo() {
        return 123;
      }
    }
    class Derived extends Base {
    }
    __publicField(Derived, "bar", super.foo);

    // New output with --target=es6 (works correctly)
    class Base {
      static get foo() {
        return 123;
      }
    }
    const _Derived = class extends Base {
    };
    let Derived = _Derived;
    __publicField(Derived, "bar", __superStaticGet(_Derived, "foo"));
    ```

    All known edge cases for `super` inside `static` class fields should be handled including accessing `super` after prototype reassignment of the enclosing class object.

## 0.13.10

* Implement legal comment preservation for CSS ([#1539](https://github.com/evanw/esbuild/issues/1539))

    This release adds support for legal comments in CSS the same way they are already supported for JS. A legal comment is one that starts with `/*!` or that contains the text `@license` or `@preserve`. These comments are preserved in output files by esbuild since that follows the intent of the original authors of the code. The specific behavior is controlled via `--legal-comments=` in the CLI and `legalComments` in the JS API, which can be set to any of the following options:

    * `none`: Do not preserve any legal comments
    * `inline`: Preserve all rule-level legal comments
    * `eof`: Move all rule-level legal comments to the end of the file
    * `linked`: Move all rule-level legal comments to a `.LEGAL.txt` file and link to them with a comment
    * `external`: Move all rule-level legal comments to a `.LEGAL.txt` file but to not link to them

    The default behavior is `eof` when bundling and `inline` otherwise.

* Allow uppercase `es*` targets ([#1717](https://github.com/evanw/esbuild/issues/1717))

    With this release, you can now use target names such as `ESNext` instead of `esnext` as the target name in the CLI and JS API. This is important because people don't want to have to call `.toLowerCase()` on target strings from TypeScript's `tsconfig.json` file before passing it to esbuild (TypeScript uses case-agnostic target names).

    This feature was contributed by [@timse](https://github.com/timse).

* Update to Unicode 14.0.0

    The character tables that determine which characters form valid JavaScript identifiers have been updated from Unicode version 13.0.0 to the newly release Unicode version 14.0.0. I'm not putting an example in the release notes because all of the new characters will likely just show up as little squares since fonts haven't been updated yet. But you can read https://www.unicode.org/versions/Unicode14.0.0/#Summary for more information about the changes.

## 0.13.9

* Add support for `imports` in `package.json` ([#1691](https://github.com/evanw/esbuild/issues/1691))

    This release adds basic support for the `imports` field in `package.json`. It behaves similarly to the `exports` field but only applies to import paths that start with `#`. The `imports` field provides a way for a package to remap its own internal imports for itself, while the `exports` field provides a way for a package to remap its external exports for other packages. This is useful because the `imports` field respects the currently-configured conditions which means that the import mapping can change at run-time. For example:

    ```
    $ cat entry.mjs
    import '#example'

    $ cat package.json
    {
      "imports": {
        "#example": {
          "foo": "./example.foo.mjs",
          "default": "./example.mjs"
        }
      }
    }

    $ cat example.foo.mjs
    console.log('foo is enabled')

    $ cat example.mjs
    console.log('foo is disabled')

    $ node entry.mjs
    foo is disabled

    $ node --conditions=foo entry.mjs
    foo is enabled
    ```

    Now that esbuild supports this feature too, import paths starting with `#` and any provided conditions will be respected when bundling:

    ```
    $ esbuild --bundle entry.mjs | node
    foo is disabled

    $ esbuild --conditions=foo --bundle entry.mjs | node
    foo is enabled
    ```

* Fix using `npm rebuild` with the `esbuild` package ([#1703](https://github.com/evanw/esbuild/issues/1703))

    Version 0.13.4 accidentally introduced a regression in the install script where running `npm rebuild` multiple times could fail after the second time. The install script creates a copy of the binary executable using [`link`](https://man7.org/linux/man-pages/man2/link.2.html) followed by [`rename`](https://www.man7.org/linux/man-pages/man2/rename.2.html). Using `link` creates a hard link which saves space on the file system, and `rename` is used for safety since it atomically replaces the destination.

    However, the `rename` syscall has an edge case where it silently fails if the source and destination are both the same link. This meant that the install script would fail after being run twice in a row. With this release, the install script now deletes the source after calling `rename` in case it has silently failed, so this issue should now be fixed. It should now be safe to use `npm rebuild` with the `esbuild` package.

* Fix invalid CSS minification of `border-radius` ([#1702](https://github.com/evanw/esbuild/issues/1702))

    CSS minification does collapsing of `border-radius` related properties. For example:

    ```css
    /* Original CSS */
    div {
      border-radius: 1px;
      border-top-left-radius: 5px;
    }

    /* Minified CSS */
    div{border-radius:5px 1px 1px}
    ```

    However, this only works for numeric tokens, not identifiers. For example:

    ```css
    /* Original CSS */
    div {
      border-radius: 1px;
      border-top-left-radius: inherit;
    }

    /* Minified CSS */
    div{border-radius:1px;border-top-left-radius:inherit}
    ```

    Transforming this to `div{border-radius:inherit 1px 1px}`, as was done in previous releases of esbuild, is an invalid transformation and results in incorrect CSS. This release of esbuild fixes this CSS transformation bug.

## 0.13.8

* Fix `super` inside arrow function inside lowered `async` function ([#1425](https://github.com/evanw/esbuild/issues/1425))

    When an `async` function is transformed into a regular function for target environments that don't support `async` such as `--target=es6`, references to `super` inside that function must be transformed too since the `async`-to-regular function transformation moves the function body into a nested function, so the `super` references are no longer syntactically valid. However, this transform didn't handle an edge case and `super` references inside of an arrow function were overlooked. This release fixes this bug:

    ```js
    // Original code
    class Foo extends Bar {
      async foo() {
        return () => super.foo()
      }
    }

    // Old output (with --target=es6)
    class Foo extends Bar {
      foo() {
        return __async(this, null, function* () {
          return () => super.foo();
        });
      }
    }

    // New output (with --target=es6)
    class Foo extends Bar {
      foo() {
        var __super = (key) => super[key];
        return __async(this, null, function* () {
          return () => __super("foo").call(this);
        });
      }
    }
    ```

* Remove the implicit `/` after `[dir]` in entry names ([#1661](https://github.com/evanw/esbuild/issues/1661))

    The "entry names" feature lets you customize the way output file names are generated. The `[dir]` and `[name]` placeholders are filled in with the directory name and file name of the corresponding entry point file, respectively.

    Previously `--entry-names=[dir]/[name]` and `--entry-names=[dir][name]` behaved the same because the value used for `[dir]` always had an implicit trailing slash, since it represents a directory. However, some people want to be able to remove the file name with `--entry-names=[dir]` and the implicit trailing slash gets in the way.

    With this release, you can now use the `[dir]` placeholder without an implicit trailing slash getting in the way. For example, the command `esbuild foo/bar/index.js --outbase=. --outdir=out --entry-names=[dir]` previously generated the file `out/foo/bar/.js` but will now generate the file `out/foo/bar.js`.

## 0.13.7

* Minify CSS alpha values correctly ([#1682](https://github.com/evanw/esbuild/issues/1682))

    When esbuild uses the `rgba()` syntax for a color instead of the 8-character hex code (e.g. when `target` is set to Chrome 61 or earlier), the 0-to-255 integer alpha value must be printed as a floating-point fraction between 0 and 1. The fraction was only printed to three decimal places since that is the minimal number of decimal places required for all 256 different alpha values to be uniquely determined. However, using three decimal places does not necessarily result in the shortest result. For example, `128 / 255` is `0.5019607843137255` which is printed as `".502"` using three decimal places, but `".5"` is equivalent because `round(0.5 * 255) == 128`, so printing `".5"` would be better. With this release, esbuild will always use the minimal numeric representation for the alpha value:

    ```css
    /* Original code */
    a { color: #FF800080 }

    /* Old output (with --minify --target=chrome61) */
    a{color:rgba(255,128,0,.502)}

    /* New output (with --minify --target=chrome61) */
    a{color:rgba(255,128,0,.5)}
    ```

* Match node's behavior for core module detection ([#1680](https://github.com/evanw/esbuild/issues/1680))

    Node has a hard-coded list of core modules (e.g. `fs`) that, when required, short-circuit the module resolution algorithm and instead return the corresponding internal core module object. When you pass `--platform=node` to esbuild, esbuild also implements this short-circuiting behavior and doesn't try to bundle these import paths. This was implemented in esbuild using the existing `external` feature (e.g. essentially `--external:fs`). However, there is an edge case where esbuild's `external` feature behaved differently than node.

    Modules specified via esbuild's `external` feature also cause all sub-paths to be excluded as well, so for example `--external:foo` excludes both `foo` and `foo/bar` from the bundle. However, node's core module check is only an exact equality check, so for example `fs` is a core module and bypasses the module resolution algorithm but `fs/foo` is not a core module and causes the module resolution algorithm to search the file system.

    This behavior can be used to load a module on the file system with the same name as one of node's core modules. For example, `require('fs/')` will load the module `fs` from the file system instead of loading node's core `fs` module. With this release, esbuild will now match node's behavior in this edge case. This means the external modules that are automatically added by `--platform=node` now behave subtly differently than `--external:`, which allows code that relies on this behavior to be bundled correctly.

* Fix WebAssembly builds on Go 1.17.2+ ([#1684](https://github.com/evanw/esbuild/pull/1684))

    Go 1.17.2 introduces a change (specifically a [fix for CVE-2021-38297](https://go-review.googlesource.com/c/go/+/354591/)) that causes Go's WebAssembly bootstrap script to throw an error when it's run in situations with many environment variables. One such situation is when the bootstrap script is run inside [GitHub Actions](https://github.com/features/actions). This change was introduced because the bootstrap script writes a copy of the environment variables into WebAssembly memory without any bounds checking, and writing more than 4096 bytes of data ends up writing past the end of the buffer and overwriting who-knows-what. So throwing an error in this situation is an improvement. However, this breaks esbuild which previously (at least seemingly) worked fine.

    With this release, esbuild's WebAssembly bootstrap script that calls out to Go's WebAssembly bootstrap script will now delete all environment variables except for the ones that esbuild checks for, of which there are currently only four: `NO_COLOR`, `NODE_PATH`, `npm_config_user_agent`, and `WT_SESSION`. This should avoid a crash when esbuild is built using Go 1.17.2+ and should reduce the likelihood of memory corruption when esbuild is built using Go 1.17.1 or earlier. This release also updates the Go version that esbuild ships with to version 1.17.2. Note that this problem only affects the `esbuild-wasm` package. The `esbuild` package is not affected.

    See also:

    * https://github.com/golang/go/issues/48797
    * https://github.com/golang/go/issues/49011

## 0.13.6

* Emit decorators for `declare` class fields ([#1675](https://github.com/evanw/esbuild/issues/1675))

    In version 3.7, TypeScript introduced the `declare` keyword for class fields that avoids generating any code for that field:

    ```ts
    // TypeScript input
    class Foo {
      a: number
      declare b: number
    }

    // JavaScript output
    class Foo {
      a;
    }
    ```

    However, it turns out that TypeScript still emits decorators for these omitted fields. With this release, esbuild will now do this too:

    ```ts
    // TypeScript input
    class Foo {
      @decorator a: number;
      @decorator declare b: number;
    }

    // Old JavaScript output
    class Foo {
      a;
    }
    __decorateClass([
      decorator
    ], Foo.prototype, "a", 2);

    // New JavaScript output
    class Foo {
      a;
    }
    __decorateClass([
      decorator
    ], Foo.prototype, "a", 2);
    __decorateClass([
      decorator
    ], Foo.prototype, "b", 2);
    ```

* Experimental support for esbuild on NetBSD ([#1624](https://github.com/evanw/esbuild/pull/1624))

    With this release, esbuild now has a published binary executable for [NetBSD](https://www.netbsd.org/) in the [`esbuild-netbsd-64`](https://www.npmjs.com/package/esbuild-netbsd-64) npm package, and esbuild's installer has been modified to attempt to use it when on NetBSD. Hopefully this makes installing esbuild via npm work on NetBSD. This change was contributed by [@gdt](https://github.com/gdt).

    ⚠️ Note: NetBSD is not one of [Node's supported platforms](https://nodejs.org/api/process.html#process_process_platform), so installing esbuild may or may not work on NetBSD depending on how Node has been patched. This is not a problem with esbuild. ⚠️

* Disable the "esbuild was bundled" warning if `ESBUILD_BINARY_PATH` is provided ([#1678](https://github.com/evanw/esbuild/pull/1678))

    The `ESBUILD_BINARY_PATH` environment variable allows you to substitute an alternate binary executable for esbuild's JavaScript API. This is useful in certain cases such as when debugging esbuild. The JavaScript API has some code that throws an error if it detects that it was bundled before being run, since bundling prevents esbuild from being able to find the path to its binary executable. However, that error is unnecessary if `ESBUILD_BINARY_PATH` is present because an alternate path has been provided. This release disables the warning when `ESBUILD_BINARY_PATH` is present so that esbuild can be used when bundled as long as you also manually specify `ESBUILD_BINARY_PATH`.

    This change was contributed by [@heypiotr](https://github.com/heypiotr).

* Remove unused `catch` bindings when minifying ([#1660](https://github.com/evanw/esbuild/pull/1660))

    With this release, esbuild will now remove unused `catch` bindings when minifying:

    ```js
    // Original code
    try {
      throw 0;
    } catch (e) {
    }

    // Old output (with --minify)
    try{throw 0}catch(t){}

    // New output (with --minify)
    try{throw 0}catch{}
    ```

    This takes advantage of the new [optional catch binding](https://github.com/tc39/proposal-optional-catch-binding) syntax feature that was introduced in ES2019. This minification rule is only enabled when optional catch bindings are supported by the target environment. Specifically, it's not enabled when using `--target=es2018` or older. Make sure to set esbuild's `target` setting correctly when minifying if the code will be running in an older JavaScript environment.

    This change was contributed by [@sapphi-red](https://github.com/sapphi-red).

## 0.13.5

* Improve watch mode accuracy ([#1113](https://github.com/evanw/esbuild/issues/1113))

    Watch mode is enabled by `--watch` and causes esbuild to become a long-running process that automatically rebuilds output files when input files are changed. It's implemented by recording all calls to esbuild's internal file system interface and then invalidating the build whenever these calls would return different values. For example, a call to esbuild's internal `ReadFile()` function is considered to be different if either the presence of the file has changed (e.g. the file didn't exist before but now exists) or the presence of the file stayed the same but the content of the file has changed.

    Previously esbuild's watch mode operated at the `ReadFile()` and `ReadDirectory()` level. When esbuild checked whether a directory entry existed or not (e.g. whether a directory contains a `node_modules` subdirectory or a `package.json` file), it called `ReadDirectory()` which then caused the build to depend on that directory's set of entries. This meant the build would be invalidated even if a new unrelated entry was added or removed, since that still changes the set of entries. This is problematic when using esbuild in environments that constantly create and destroy temporary directory entries in your project directory. In that case, esbuild's watch mode would constantly rebuild as the directory was constantly considered to be dirty.

    With this release, watch mode now operates at the `ReadFile()` and `ReadDirectory().Get()` level. So when esbuild checks whether a directory entry exists or not, the build should now only depend on the presence status for that one directory entry. This should avoid unnecessary rebuilds due to unrelated directory entries being added or removed. The log messages generated using `--watch` will now also mention the specific directory entry whose presence status was changed if a build is invalidated for this reason.

    Note that this optimization does not apply to plugins using the `watchDirs` return value because those paths are only specified at the directory level and do not describe individual directory entries. You can use `watchFiles` or `watchDirs` on the individual entries inside the directory to get a similar effect instead.

* Disallow certain uses of `<` in `.mts` and `.cts` files

    The upcoming version 4.5 of TypeScript is introducing the `.mts` and `.cts` extensions that turn into the `.mjs` and `.cjs` extensions when compiled. However, unlike the existing `.ts` and `.tsx` extensions, expressions that start with `<` are disallowed when they would be ambiguous depending on whether they are parsed in `.ts` or `.tsx` mode. The ambiguity is caused by the overlap between the syntax for JSX elements and the old deprecated syntax for type casts:

    | Syntax                        | `.ts`                | `.tsx`           | `.mts`/`.cts`        |
    |-------------------------------|----------------------|------------------|----------------------|
    | `<x>y`                        | ✅ Type cast         | 🚫 Syntax error   | 🚫 Syntax error      |
    | `<T>() => {}`                 | ✅ Arrow function    | 🚫 Syntax error   | 🚫 Syntax error      |
    | `<x>y</x>`                    | 🚫 Syntax error      | ✅ JSX element    | 🚫 Syntax error      |
    | `<T>() => {}</T>`             | 🚫 Syntax error      | ✅ JSX element    | 🚫 Syntax error      |
    | `<T extends>() => {}</T>`     | 🚫 Syntax error      | ✅ JSX element    | 🚫 Syntax error      |
    | `<T extends={0}>() => {}</T>` | 🚫 Syntax error      | ✅ JSX element    | 🚫 Syntax error      |
    | `<T,>() => {}`                | ✅ Arrow function    | ✅ Arrow function | ✅ Arrow function    |
    | `<T extends X>() => {}`       | ✅ Arrow function    | ✅ Arrow function | ✅ Arrow function    |

    This release of esbuild introduces a syntax error for these ambiguous syntax constructs in `.mts` and `.cts` files to match the new behavior of the TypeScript compiler.

* Do not remove empty `@keyframes` rules ([#1665](https://github.com/evanw/esbuild/issues/1665))

    CSS minification in esbuild automatically removes empty CSS rules, since they have no effect. However, empty `@keyframes` rules still trigger JavaScript animation events so it's incorrect to remove them. To demonstrate that empty `@keyframes` rules still have an effect, here is a bug report for Firefox where it was incorrectly not triggering JavaScript animation events for empty `@keyframes` rules: https://bugzilla.mozilla.org/show_bug.cgi?id=1004377.

    With this release, empty `@keyframes` rules are now preserved during minification:

    ```css
    /* Original CSS */
    @keyframes foo {
      from {}
      to {}
    }

    /* Old output (with --minify) */

    /* New output (with --minify) */
    @keyframes foo{}
    ```

    This fix was contributed by [@eelco](https://github.com/eelco).

* Fix an incorrect duplicate label error ([#1671](https://github.com/evanw/esbuild/pull/1671))

    When labeling a statement in JavaScript, the label must be unique within the enclosing statements since the label determines the jump target of any labeled `break` or `continue` statement:

    ```js
    // This code is valid
    x: y: z: break x;

    // This code is invalid
    x: y: x: break x;
    ```

    However, an enclosing label with the same name *is* allowed as long as it's located in a different function body. Since `break` and `continue` statements can't jump across function boundaries, the label is not ambiguous. This release fixes a bug where esbuild incorrectly treated this valid code as a syntax error:

    ```js
    // This code is valid, but was incorrectly considered a syntax error
    x: (() => {
      x: break x;
    })();
    ```

    This fix was contributed by [@nevkontakte](https://github.com/nevkontakte).

## 0.13.4

* Fix permission issues with the install script ([#1642](https://github.com/evanw/esbuild/issues/1642))

    The `esbuild` package contains a small JavaScript stub file that implements the CLI (command-line interface). Its only purpose is to spawn the binary esbuild executable as a child process and forward the command-line arguments to it.

    The install script contains an optimization that replaces this small JavaScript stub with the actual binary executable at install time to avoid the overhead of unnecessarily creating a new `node` process. This optimization can't be done at package publish time because there is only one `esbuild` package but there are many supported platforms, so the binary executable for the current platform must live outside of the `esbuild` package.

    However, the optimization was implemented with an [unlink](https://www.man7.org/linux/man-pages/man2/unlink.2.html) operation followed by a [link](https://www.man7.org/linux/man-pages/man2/link.2.html) operation. This means that if the first step fails, the package is left in a broken state since the JavaScript stub file is deleted but not yet replaced.

    With this release, the optimization is now implemented with a [link](https://www.man7.org/linux/man-pages/man2/link.2.html) operation followed by a [rename](https://www.man7.org/linux/man-pages/man2/rename.2.html) operation. This should always leave the package in a working state even if either step fails.

* Add a fallback for `npm install esbuild --no-optional` ([#1647](https://github.com/evanw/esbuild/issues/1647))

    The installation method for esbuild's platform-specific binary executable was recently changed in version 0.13.0. Before that version esbuild downloaded it in an install script, and after that version esbuild lets the package manager download it using the `optionalDependencies` feature in `package.json`. This change was made because downloading the binary executable in an install script never really fully worked. The reasons are complex but basically there are a variety of edge cases where people people want to install esbuild in environments that they have customized such that downloading esbuild isn't possible. Using `optionalDependencies` instead lets the package manager deal with it instead, which should work fine in all cases (either that or your package manager has a bug, but that's not esbuild's problem).

    There is one case where this new installation method doesn't work: if you pass the `--no-optional` flag to npm to disable the `optionalDependencies` feature. If you do this, you prevent esbuild from being installed. This is not a problem with esbuild because you are manually enabling a flag to change npm's behavior such that esbuild doesn't install correctly. However, people still want to do this.

    With this release, esbuild will now fall back to the old installation method if the new installation method fails. **THIS MAY NOT WORK.** The new `optionalDependencies` installation method is the only supported way to install esbuild with npm. The old downloading installation method was removed because it doesn't always work. The downloading method is only being provided to try to be helpful but it's not the supported installation method. If you pass `--no-optional` and the download fails due to some environment customization you did, the recommended fix is to just remove the `--no-optional` flag.

* Support the new `.mts` and `.cts` TypeScript file extensions

    The upcoming version 4.5 of TypeScript has two new file extensions: `.mts` and `.cts`. Files with these extensions can be imported using the `.mjs` and `.cjs`, respectively. So the statement `import "./foo.mjs"` in TypeScript can actually succeed even if the file `./foo.mjs` doesn't exist on the file system as long as the file `./foo.mts` does exist. The import path with the `.mjs` extension is automatically re-routed to the corresponding file with the `.mts` extension at type-checking time by the TypeScript compiler. See [the TypeScript 4.5 beta announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-4-5-beta/#new-file-extensions) for details.

    With this release, esbuild will also automatically rewrite `.mjs` to `.mts` and `.cjs` to `.cts` when resolving import paths to files on the file system. This should make it possible to bundle code written in this new style. In addition, the extensions `.mts` and `.cts` are now also considered valid TypeScript file extensions by default along with the `.ts` extension.

* Fix invalid CSS minification of `margin` and `padding` ([#1657](https://github.com/evanw/esbuild/issues/1657))

    CSS minification does collapsing of `margin` and `padding` related properties. For example:

    ```css
    /* Original CSS */
    div {
      margin: auto;
      margin-top: 5px;
      margin-left: 5px;
    }

    /* Minified CSS */
    div{margin:5px auto auto 5px}
    ```

    However, while this works for the `auto` keyword, it doesn't work for other keywords. For example:

    ```css
    /* Original CSS */
    div {
      margin: inherit;
      margin-top: 5px;
      margin-left: 5px;
    }

    /* Minified CSS */
    div{margin:inherit;margin-top:5px;margin-left:5px}
    ```

    Transforming this to `div{margin:5px inherit inherit 5px}`, as was done in previous releases of esbuild, is an invalid transformation and results in incorrect CSS. This release of esbuild fixes this CSS transformation bug.

## 0.13.3

* Support TypeScript type-only import/export specifiers ([#1637](https://github.com/evanw/esbuild/pull/1637))

    This release adds support for a new TypeScript syntax feature in the upcoming version 4.5 of TypeScript. This feature lets you prefix individual imports and exports with the `type` keyword to indicate that they are types instead of values. This helps tools such as esbuild omit them from your source code, and is necessary because esbuild compiles files one-at-a-time and doesn't know at parse time which imports/exports are types and which are values. The new syntax looks like this:

    ```ts
    // Input TypeScript code
    import { type Foo } from 'foo'
    export { type Bar }

    // Output JavaScript code (requires "importsNotUsedAsValues": "preserve" in "tsconfig.json")
    import {} from "foo";
    export {};
    ```

    See [microsoft/TypeScript#45998](https://github.com/microsoft/TypeScript/pull/45998) for full details. From what I understand this is a purely ergonomic improvement since this was already previously possible using a type-only import/export statements like this:

    ```ts
    // Input TypeScript code
    import type { Foo } from 'foo'
    export type { Bar }
    import 'foo'
    export {}

    // Output JavaScript code (requires "importsNotUsedAsValues": "preserve" in "tsconfig.json")
    import "foo";
    export {};
    ```

    This feature was contributed by [@g-plane](https://github.com/g-plane).

## 0.13.2

* Fix `export {}` statements with `--tree-shaking=true` ([#1628](https://github.com/evanw/esbuild/issues/1628))

    The new `--tree-shaking=true` option allows you to force-enable tree shaking in cases where it wasn't previously possible. One such case is when bundling is disabled and there is no output format configured, in which case esbuild just preserves the format of whatever format the input code is in. Enabling tree shaking in this context caused a bug where `export {}` statements were stripped. This release fixes the bug so `export {}` statements should now be preserved when you pass `--tree-shaking=true`. This bug only affected this new functionality and didn't affect existing scenarios.

## 0.13.1

* Fix the `esbuild` package in yarn 2+

    The [yarn package manager](https://yarnpkg.com/) version 2 and above has a mode called [PnP](https://next.yarnpkg.com/features/pnp/) that installs packages inside zip files instead of using individual files on disk, and then hijacks node's `fs` module to pretend that paths to files inside the zip file are actually individual files on disk so that code that wasn't written specifically for yarn still works. Unfortunately that hijacking is incomplete and it still causes certain things to break such as using these zip file paths to create a JavaScript worker thread or to create a child process.

    This was an issue for the new `optionalDependencies` package installation strategy that was just released in version 0.13.0 since the binary executable is now inside of an installed package instead of being downloaded using an install script. When it's installed with yarn 2+ in PnP mode the binary executable is inside a zip file and can't be run. To work around this, esbuild detects yarn's PnP mode and copies the binary executable to a real file outside of the zip file.

    Unfortunately the code to do this didn't create the parent directory before writing to the file path. That caused esbuild's API to crash when it was run for the first time. This didn't come up during testing because the parent directory already existed when the tests were run. This release changes the location of the binary executable from a shared cache directory to inside the esbuild package itself, which should fix this crash. This problem only affected esbuild's JS API when it was run through yarn 2+ with PnP mode active.

## 0.13.0

**This release contains backwards-incompatible changes.** Since esbuild is before version 1.0.0, these changes have been released as a new minor version to reflect this (as [recommended by npm](https://docs.npmjs.com/cli/v6/using-npm/semver/)). You should either be pinning the exact version of `esbuild` in your `package.json` file or be using a version range syntax that only accepts patch upgrades such as `~0.12.0`. See the documentation about [semver](https://docs.npmjs.com/cli/v6/using-npm/semver/) for more information.

* Allow tree shaking to be force-enabled and force-disabled ([#1518](https://github.com/evanw/esbuild/issues/1518), [#1610](https://github.com/evanw/esbuild/issues/1610), [#1611](https://github.com/evanw/esbuild/issues/1611), [#1617](https://github.com/evanw/esbuild/pull/1617))

    This release introduces a breaking change that gives you more control over when tree shaking happens ("tree shaking" here refers to declaration-level dead code removal). Previously esbuild's tree shaking was automatically enabled or disabled for you depending on the situation and there was no manual override to change this. Specifically, tree shaking was only enabled either when bundling was enabled or when the output format was set to `iife` (i.e. wrapped in an immediately-invoked function expression). This was done to avoid issues with people appending code to output files in the `cjs` and `esm` formats and expecting that code to be able to reference code in the output file that isn't otherwise referenced.

    You now have the ability to explicitly force-enable or force-disable tree shaking to bypass this default behavior. This is a breaking change because there is already a setting for tree shaking that does something else, and it has been moved to a separate setting instead. The previous setting allowed you to control whether or not to ignore manual side-effect annotations, which is related to tree shaking since only side-effect free code can be removed as dead code. Specifically you can annotate function calls with `/* @__PURE__ */` to indicate that they can be removed if they are not used, and you can annotate packages with `"sideEffects": false` to indicate that imports of that package can be removed if they are not used. Being able to ignore these annotations is necessary because [they are sometimes incorrect](https://github.com/tensorflow/tfjs/issues/4248). This previous setting has been moved to a separate setting because it actually impacts dead-code removal within expressions, which also applies when minifying with tree-shaking disabled.

    ### Old behavior

    * CLI
        * Ignore side-effect annotations: `--tree-shaking=ignore-annotations`
    * JS
        * Ignore side-effect annotations: `treeShaking: 'ignore-annotations'`
    * Go
        * Ignore side-effect annotations: `TreeShaking: api.TreeShakingIgnoreAnnotations`

    ### New behavior

    * CLI
        * Ignore side-effect annotations: `--ignore-annotations`
        * Force-disable tree shaking: `--tree-shaking=false`
        * Force-enable tree shaking: `--tree-shaking=true`
    * JS
        * Ignore side-effect annotations: `ignoreAnnotations: true`
        * Force-disable tree shaking: `treeShaking: false`
        * Force-enable tree shaking: `treeShaking: true`
    * Go
        * Ignore side-effect annotations: `IgnoreAnnotations: true`
        * Force-disable tree shaking: `TreeShaking: api.TreeShakingFalse`
        * Force-enable tree shaking: `TreeShaking: api.TreeShakingTrue`

* The npm package now uses `optionalDependencies` to install the platform-specific binary executable ([#286](https://github.com/evanw/esbuild/issues/286), [#291](https://github.com/evanw/esbuild/issues/291), [#319](https://github.com/evanw/esbuild/issues/319), [#347](https://github.com/evanw/esbuild/issues/347), [#369](https://github.com/evanw/esbuild/issues/369), [#547](https://github.com/evanw/esbuild/issues/547), [#565](https://github.com/evanw/esbuild/issues/565), [#789](https://github.com/evanw/esbuild/issues/789), [#921](https://github.com/evanw/esbuild/issues/921), [#1193](https://github.com/evanw/esbuild/issues/1193), [#1270](https://github.com/evanw/esbuild/issues/1270), [#1382](https://github.com/evanw/esbuild/issues/1382), [#1422](https://github.com/evanw/esbuild/issues/1422), [#1450](https://github.com/evanw/esbuild/issues/1450), [#1485](https://github.com/evanw/esbuild/issues/1485), [#1546](https://github.com/evanw/esbuild/issues/1546), [#1547](https://github.com/evanw/esbuild/pull/1547), [#1574](https://github.com/evanw/esbuild/issues/1574), [#1609](https://github.com/evanw/esbuild/issues/1609))

    This release changes esbuild's installation strategy in an attempt to improve compatibility with edge cases such as custom registries, custom proxies, offline installations, read-only file systems, or when post-install scripts are disabled. It's being treated as a breaking change out of caution because it's a significant change to how esbuild works with JS package managers, and hasn't been widely tested yet.

    **The old installation strategy** manually downloaded the correct binary executable in a [post-install script](https://docs.npmjs.com/cli/v7/using-npm/scripts). The binary executable is hosted in a separate platform-specific npm package such as [`esbuild-darwin-64`](https://www.npmjs.com/package/esbuild-darwin-64). The install script first attempted to download the package via the `npm` command in case npm had custom network settings configured. If that didn't work, the install script attempted to download the package from https://registry.npmjs.org/ before giving up. This was problematic for many reasons including:

    * Not all of npm's settings can be forwarded due to npm bugs such as https://github.com/npm/cli/issues/2284, and npm has said these bugs will never be fixed.
    * Some people have configured their network environments such that downloading from https://registry.npmjs.org/ will hang instead of either succeeding or failing.
    * The installed package was broken if you used `npm --ignore-scripts` because then the post-install script wasn't run. Some people enable this option so that malicious packages must be run first before being able to do malicious stuff.

    **The new installation strategy** automatically downloads the correct binary executable using npm's `optionalDependencies` feature to depend on all esbuild packages for all platforms but only have the one for the current platform be installed. This is a built-in part of the package manager so my assumption is that it should work correctly in all of these edge cases that currently don't work. And if there's an issue with this, then the problem is with the package manager instead of with esbuild so this should hopefully reduce the maintenance burden on esbuild itself. Changing to this installation strategy has these drawbacks:

    * Old versions of certain package managers (specifically npm and yarn) print lots of useless log messages during the installation, at least one for each platform other than the current one. These messages are harmless and can be ignored. However, they are annoying. There is nothing I can do about this. If you have this problem, one solution is to upgrade your package manager to a newer version.

    * Installation will be significantly slower in old versions of npm, old versions of pnpm, and all versions of yarn. These package managers download all packages for all platforms even though they aren't needed and actually cannot be used. This problem has been fixed in npm and pnpm and the problem has been communicated to yarn: https://github.com/yarnpkg/berry/issues/3317. If you have this problem, one solution is to use a newer version of npm or pnpm as your package manager.

    * This installation strategy does not work if you use `npm --no-optional` since then the package with the binary executable is not installed. If you have this problem, the solution is to not pass the `--no-optional` flag when installing packages.

    * There is still a small post-install script but it's now optional in that the `esbuild` package should still function correctly if post-install scripts are disabled (such as with `npm --ignore-scripts`). This post-install script optimizes the installed package by replacing the `esbuild` JavaScript command shim with the actual binary executable at install time. This avoids the overhead of launching another `node` process when using the `esbuild` command. So keep in mind that installing with `--ignore-scripts` will result in a slower `esbuild` command.

    Despite the drawbacks of the new installation strategy, I believe this change is overall a good thing to move forward with. It should fix edge case scenarios where installing esbuild currently doesn't work at all, and this only comes at the expense of the install script working in a less-optimal way (but still working) if you are using an old version of npm. So I'm going to switch installation strategies and see how it goes.

    The platform-specific binary executables are still hosted on npm in the same way, so anyone who wrote code that downloads builds from npm using the instructions here should not have to change their code: https://esbuild.github.io/getting-started/#download-a-build. However, note that these platform-specific packages no longer specify the `bin` field in `package.json` so the `esbuild` command will no longer be automatically put on your path. The `bin` field had to be removed because of a collision with the `bin` field of the `esbuild` package (now that the `esbuild` package depends on all of these platform-specific packages as optional dependencies).

In addition to the breaking changes above, the following features are also included in this release:

* Treat `x` guarded by `typeof x !== 'undefined'` as side-effect free

    This is a small tree-shaking (i.e. dead code removal) improvement. Global identifier references are considered to potentially have side effects since they will throw a reference error if the global identifier isn't defined, and code with side effects cannot be removed as dead code. However, there's a somewhat-common case where the identifier reference is guarded by a `typeof` check to check that it's defined before accessing it. With this release, code that does this will now be considered to have no side effects which allows it to be tree-shaken:

    ```js
    // Original code
    var __foo = typeof foo !== 'undefined' && foo;
    var __bar = typeof bar !== 'undefined' && bar;
    console.log(__bar);

    // Old output (with --bundle, which enables tree-shaking)
    var __foo = typeof foo !== 'undefined' && foo;
    var __bar = typeof bar !== 'undefined' && bar;
    console.log(__bar);

    // New output (with --bundle, which enables tree-shaking)
    var __bar = typeof bar !== 'undefined' && bar;
    console.log(__bar);
    ```

## 0.12.29

* Fix compilation of abstract class fields in TypeScript ([#1623](https://github.com/evanw/esbuild/issues/1623))

    This release fixes a bug where esbuild could incorrectly include a TypeScript abstract class field in the compiled JavaScript output. This is incorrect because the official TypeScript compiler never does this. Note that this only happened in scenarios where TypeScript's `useDefineForClassFields` setting was set to `true` (or equivalently where TypeScript's `target` setting was set to `ESNext`). Here is the difference:

    ```js
    // Original code
    abstract class Foo {
      abstract foo: any;
    }

    // Old output
    class Foo {
      foo;
    }

    // New output
    class Foo {
    }
    ```

* Proxy from the `__require` shim to `require` ([#1614](https://github.com/evanw/esbuild/issues/1614))

    Some background: esbuild's bundler emulates a CommonJS environment. The bundling process replaces the literal syntax `require(<string>)` with the referenced module at compile-time. However, other uses of `require` such as `require(someFunction())` are not bundled since the value of `someFunction()` depends on code evaluation, and esbuild does not evaluate code at compile-time. So it's possible for some references to `require` to remain after bundling.

    This was causing problems for some CommonJS code that was run in the browser and that expected `typeof require === 'function'` to be true (see [#1202](https://github.com/evanw/esbuild/issues/1202)), since the browser does not provide a global called `require`. Thus esbuild introduced a shim `require` function called `__require` (shown below) and replaced all references to `require` in the bundled code with `__require`:

    ```js
    var __require = x => {
      if (typeof require !== 'undefined') return require(x);
      throw new Error('Dynamic require of "' + x + '" is not supported');
    };
    ```

    However, this broke code that referenced `require.resolve` inside the bundle, which could hypothetically actually work since you could assign your own implementation to `window.require.resolve` (see [#1579](https://github.com/evanw/esbuild/issues/1579)). So the implementation of `__require` was changed to this:

    ```js
    var __require = typeof require !== 'undefined' ? require : x => {
      throw new Error('Dynamic require of "' + x + '" is not supported');
    };
    ```

    However, that broke code that assigned to `window.require` later on after the bundle was loaded ([#1614](https://github.com/evanw/esbuild/issues/1614)). So with this release, the code for `__require` now handles all of these edge cases:

    * `typeof require` is still `function` even if `window.require` is undefined
    * `window.require` can be assigned to either before or after the bundle is loaded
    * `require.resolve` and arbitrary other properties can still be accessed
    * `require` will now forward any number of arguments, not just the first one

    Handling all of these edge cases is only possible with the [Proxy API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). So the implementation of `__require` now looks like this:

    ```js
    var __require = (x =>
      typeof require !== 'undefined' ? require :
      typeof Proxy !== 'undefined' ? new Proxy(x, {
        get: (a, b) => (typeof require !== 'undefined' ? require : a)[b]
      }) : x
    )(function(x) {
      if (typeof require !== 'undefined') return require.apply(this, arguments);
      throw new Error('Dynamic require of "' + x + '" is not supported');
    });
    ```

* Consider `typeof x` to have no side effects

    The `typeof` operator does not itself trigger any code evaluation so it can safely be removed if evaluating the operand does not cause any side effects. However, there is a special case of the `typeof` operator when the operand is an identifier expression. In that case no reference error is thrown if the referenced symbol does not exist (e.g. `typeof x` does not throw an error if there is no symbol named `x`). With this release, esbuild will now consider `typeof x` to have no side effects even if evaluating `x` would have side effects (i.e. would throw a reference error):

    ```js
    // Original code
    var unused = typeof React !== 'undefined';

    // Old output
    var unused = typeof React !== 'undefined';

    // New output
    ```

    Note that there is actually an edge case where `typeof x` *can* throw an error: when `x` is being referenced inside of its TDZ, or temporal dead zone (i.e. before it's declared). This applies to `let`, `const`, and `class` symbols. However, esbuild doesn't currently handle TDZ rules so the possibility of errors thrown due to TDZ rules is not currently considered. This typically doesn't matter in real-world code so this hasn't been a priority to fix (and is actually tricky to fix with esbuild's current bundling approach). So esbuild may incorrectly remove a `typeof` expression that actually has side effects. However, esbuild already incorrectly did this in previous releases so its behavior regarding `typeof` and TDZ rules hasn't changed in this release.

## 0.12.28

* Fix U+30FB and U+FF65 in identifier names in ES5 vs. ES6+ ([#1599](https://github.com/evanw/esbuild/issues/1599))

    The ES6 specification caused two code points that were previously valid in identifier names in ES5 to no longer be valid in identifier names in ES6+. The two code points are:

    * `U+30FB` i.e. `KATAKANA MIDDLE DOT` i.e. `・`
    * `U+FF65` i.e. `HALFWIDTH KATAKANA MIDDLE DOT` i.e. `･`

    This means that using ES6+ parsing rules will fail to parse some valid ES5 code, and generating valid ES5 code may fail to be parsed using ES6+ parsing rules. For example, esbuild would previously fail to parse `x.y･` even though it's valid ES5 code (since it's not valid ES6+ code) and esbuild could generate `{y･:x}` when minifying even though it's not valid ES6+ code (since it's valid ES5 code). This problem is the result of my incorrect assumption that ES6 is a superset of ES5.

    As of this release, esbuild will now parse a superset of ES5 and ES6+ and will now quote identifier names when possible if it's not considered to be a valid identifier name in either ES5 or ES6+. In other words, a union of ES5 and ES6 rules is used for parsing and the intersection of ES5 and ES6 rules is used for printing.

* Fix `++` and `--` on class private fields when used with big integers ([#1600](https://github.com/evanw/esbuild/issues/1600))

    Previously when esbuild lowered class private fields (e.g. `#foo`) to older JavaScript syntax, the transform of the `++` and `--` was not correct if the value is a big integer such as `123n`. The transform in esbuild is similar to Babel's transform which [has the same problem](https://github.com/babel/babel/issues/13756). Specifically, the code was transformed into code that either adds or subtracts the number `1` and `123n + 1` throws an exception in JavaScript. This problem has been fixed so this should now work fine starting with this release.

## 0.12.27

* Update JavaScript syntax feature compatibility tables ([#1594](https://github.com/evanw/esbuild/issues/1594))

    Most JavaScript syntax feature compatibility data is able to be obtained automatically via https://kangax.github.io/compat-table/. However, they are missing data for quite a few new JavaScript features (see ([kangax/compat-table#1034](https://github.com/kangax/compat-table/issues/1034))) so data on these new features has to be added manually. This release manually adds a few new entries:

    * Top-level await

        This feature lets you use `await` at the top level of a module, outside of an `async` function. Doing this holds up the entire module instantiation operation until the awaited expression is resolved or rejected. This release marks this feature as supported in Edge 89, Firefox 89, and Safari 15 (it was already marked as supported in Chrome 89 and Node 14.8). The data source for this is https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await.

    * Arbitrary module namespace identifier names

        This lets you use arbitrary strings as module namespace identifier names as long as they are valid UTF-16 strings. An example is `export { x as "🍕" }` which can then be imported as `import { "🍕" as y } from "./example.js"`. This release marks this feature as supported in Firefox 87 (it was already marked as supported in Chrome 90 and Node 16). The data source for this is https://bugzilla.mozilla.org/show_bug.cgi?id=1670044.

    I would also like to add data for Safari. They have recently added support for arbitrary module namespace identifier names (https://bugs.webkit.org/show_bug.cgi?id=217576) and `export * as` (https://bugs.webkit.org/show_bug.cgi?id=214379). However, I have no idea how to determine which Safari release these bugs correspond to so this compatibility data for Safari has been omitted.

* Avoid unnecessary additional log messages after the server is stopped ([#1589](https://github.com/evanw/esbuild/issues/1589))

    There is a development server built in to esbuild which is accessible via the `serve()` API call. This returns a promise that resolves to an object with a `stop()` method that immediately terminates the development server. Previously calling this could cause esbuild to print stray log messages since `stop()` could cause plugins to be unregistered while a build is still in progress. With this release, calling `stop()` no longer terminates the development server immediately. It now waits for any active builds to finish first so the builds are not interrupted and left in a confusing state.

* Fix an accidental dependency on Go ≥1.17.0 ([#1585](https://github.com/evanw/esbuild/pull/1585))

    The source code of this release no longer uses the `math.MaxInt` constant that was introduced in Go version 1.17.0. This constant was preventing esbuild from being compiled on Go version <1.17.0. This fix was contributed by [@davezuko](https://github.com/davezuko).

## 0.12.26

* Add `--analyze` to print information about the bundle ([#1568](https://github.com/evanw/esbuild/issues/1568))

    The `--metafile=` flag tells esbuild to write information about the bundle into the provided metadata file in JSON format. It contains information about the input files and which other files each one imports, as well as the output files and which input files they include. This information is sufficient to answer many questions such as:

    * Which files are in my bundle?
    * What's are the biggest files in my bundle?
    * Why is this file included in my bundle?

    Previously you had to either write your own code to answer these questions, or use another tool such as https://bundle-buddy.com/esbuild to visualize the data. Starting with this release you can now also use `--analyze` to enable esbuild's built-in visualizer. It looks like this:

    ```
    $ esbuild --bundle example.jsx --outfile=out.js --minify --analyze

      out.js  27.6kb

    ⚡ Done in 6ms

      out.js                                                                    27.6kb  100.0%
       ├ node_modules/react-dom/cjs/react-dom-server.browser.production.min.js  19.2kb   69.8%
       ├ node_modules/react/cjs/react.production.min.js                          5.9kb   21.4%
       ├ node_modules/object-assign/index.js                                     965b     3.4%
       ├ example.jsx                                                             137b     0.5%
       ├ node_modules/react-dom/server.browser.js                                 50b     0.2%
       └ node_modules/react/index.js                                              50b     0.2%
    ```

    This tells you what input files were bundled into each output file as well as the final minified size contribution of each input file as well as the percentage of the output file it takes up. You can also enable verbose analysis with `--analyze=verbose` to see why each input file was included (i.e. which files imported it from the entry point file):

    ```
    $ esbuild --bundle example.jsx --outfile=out.js --minify --analyze=verbose

      out.js  27.6kb

    ⚡ Done in 6ms

      out.js ─────────────────────────────────────────────────────────────────── 27.6kb ─ 100.0%
       ├ node_modules/react-dom/cjs/react-dom-server.browser.production.min.js ─ 19.2kb ── 69.8%
       │  └ node_modules/react-dom/server.browser.js
       │     └ example.jsx
       ├ node_modules/react/cjs/react.production.min.js ───────────────────────── 5.9kb ── 21.4%
       │  └ node_modules/react/index.js
       │     └ example.jsx
       ├ node_modules/object-assign/index.js ──────────────────────────────────── 965b ──── 3.4%
       │  └ node_modules/react-dom/cjs/react-dom-server.browser.production.min.js
       │     └ node_modules/react-dom/server.browser.js
       │        └ example.jsx
       ├ example.jsx ──────────────────────────────────────────────────────────── 137b ──── 0.5%
       ├ node_modules/react-dom/server.browser.js ──────────────────────────────── 50b ──── 0.2%
       │  └ example.jsx
       └ node_modules/react/index.js ───────────────────────────────────────────── 50b ──── 0.2%
          └ example.jsx
    ```

    There is also a JS API for this:

    ```js
    const result = await esbuild.build({
      metafile: true,
      ...
    })
    console.log(await esbuild.analyzeMetafile(result.metafile, {
      verbose: true,
    }))
    ```

    and a Go API:

    ```js
    result := api.Build(api.BuildOptions{
      Metafile: true,
      ...
    })
    fmt.Println(api.AnalyzeMetafile(result.Metafile, api.AnalyzeMetafileOptions{
      Verbose: true,
    }))
    ```

    Note that this is not the only way to visualize this data. If you want a visualization that's different than the information displayed here, you can easily build it yourself using the information in the metafile that is generated with the `--metafile=` flag.

    Also note that this data is intended for humans, not machines. The specific format of this data may change over time which will likely break any tools that try to parse it. You should not write a tool to parse this data. You should be using the information in the JSON metadata file instead. Everything in this visualization is derived from the JSON metadata so you are not losing out on any information by not using esbuild's output.

* Allow `require.resolve` in non-node builds ([#1579](https://github.com/evanw/esbuild/issues/1579))

    With this release, you can now use `require.resolve` in builds when the target platform is set to `browser` instead of `node` as long as the function `window.require.resolve` exists somehow. This was already possible when the platform is `node` but when the platform is `browser`, esbuild generates a no-op shim `require` function for compatibility reasons (e.g. because some code expects `typeof require` must be `"function"` even in the browser). The shim previously had a fallback to `window.require` if it exists, but additional properties of the `require` function such as `require.resolve` were not copied over to the shim. Now the shim function is only used if `window.require` is undefined so additional properties such as `require.resolve` should now work.

    This change was contributed by [@screetBloom](https://github.com/screetBloom).

## 0.12.25

* Fix a TypeScript parsing edge case with the postfix `!` operator ([#1560](https://github.com/evanw/esbuild/issues/1560))

    This release fixes a bug with esbuild's TypeScript parser where the postfix `!` operator incorrectly terminated a member expression after the `new` operator:

    ```js
    // Original input
    new Foo!.Bar();

    // Old output
    new Foo().Bar();

    // New output
    new Foo.Bar();
    ```

    The problem was that `!` was considered a postfix operator instead of part of a member expression. It is now considered to be part of a member expression instead, which fixes this edge case.

* Fix a parsing crash with nested private brand checks

    This release fixes a bug in the parser where code of the form `#a in #b in c` caused a crash. This code now causes a syntax error instead. Private identifiers are allowed when followed by `in`, but only if the operator precedence level is such that the `in` operator is allowed. The parser was missing the operator precedence check.

* Publish x86-64 binary executables for illumos ([#1562](https://github.com/evanw/esbuild/pull/1562))

    This release adds support for the [illumos](https://www.illumos.org/) operating system, which is related to Solaris and SunOS. Support for this platform was contributed by [@hadfl](https://github.com/hadfl).

## 0.12.24

* Fix an edge case with direct `eval` and variable renaming

    Use of the direct `eval` construct causes all variable names in the scope containing the direct `eval` and all of its parent scopes to become "pinned" and unable to be renamed. This is because the dynamically-evaluated code is allowed to reference any of those variables by name. When this happens esbuild avoids renaming any of these variables, which effectively disables minification for most of the file, and avoids renaming any non-pinned variables to the name of a pinned variable.

    However, there was previously a bug where the pinned variable name avoidance only worked for pinned variables in the top-level scope but not in nested scopes. This could result in a non-pinned variable being incorrectly renamed to the name of a pinned variable in certain cases. For example:

    ```js
    // Input to esbuild
    return function($) {
      function foo(arg) {
        return arg + $;
      }
      // Direct "eval" here prevents "$" from being renamed
      // Repeated "$" puts "$" at the top of the character frequency histogram
      return eval(foo($$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$))
    }(2);
    ```

    When this code is minified with `--minify-identifiers`, the non-pinned variable `arg` is incorrectly transformed into `$` resulting in a name collision with the nested pinned variable `$`:

    ```js
    // Old output from esbuild (incorrect)
    return function($) {
      function foo($) {
        return $ + $;
      }
      return eval(foo($$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$));
    }(2);
    ```

    This is because the non-pinned variable `arg` is renamed to the top character in the character frequency histogram `$` (esbuild uses a character frequency histogram for smaller gzipped output sizes) and the pinned variable `$` was incorrectly not present in the list of variable names to avoid. With this release, the output is now correct:

    ```js
    // New output from esbuild (correct)
    return function($) {
      function foo(n) {
        return n + $;
      }
      return eval(foo($$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$));
    }(2);
    ```

    Note that even when esbuild handles direct `eval` correctly, using direct `eval` is not recommended because it disables minification for the file and likely won't work correctly in the presence of scope hoisting optimizations. See https://esbuild.github.io/link/direct-eval for more details.

## 0.12.23

* Parsing of rest arguments in certain TypeScript types ([#1553](https://github.com/evanw/esbuild/issues/1553))

    This release implements parsing of rest arguments inside object destructuring inside arrow functions inside TypeScript type declarations. Support for rest arguments in this specific syntax was not previously implemented. The following code was incorrectly considered a syntax error before this release, but is no longer considered a syntax error:

    ```ts
    type F = ({ ...rest }) => void;
    ```

* Fix error message for `watch: true` and `buildSync` ([#1552](https://github.com/evanw/esbuild/issues/1552))

    Watch mode currently only works with the `build` API. Previously using watch mode with the `buildSync` API caused a confusing error message. This release explicitly disallows doing this, so the error message is now more clear.

* Fix an minification bug with the `--keep-names` option ([#1552](https://github.com/evanw/esbuild/issues/1552))

    This release fixes a subtle bug that happens with `--keep-names --minify` and nested function declarations in strict mode code. It can be triggered by the following code, which was being compiled incorrectly under those flags:

    ```js
    export function outer() {
      {
        function inner() {
          return Math.random();
        }
        const x = inner();
        console.log(x);
      }
    }
    outer();
    ```

    The bug was caused by an unfortunate interaction between a few of esbuild's behaviors:

    1. Function declarations inside of nested scopes behave differently in different situations, so esbuild rewrites this function declaration to a local variable initialized to a function expression instead so that it behaves the same in all situations.

        More specifically, the interpretation of such function declarations depends on whether or not it currently exists in a strict mode context:

        ```
        > (function(){ { function x(){} } return x })()
        function x() {}

        > (function(){ 'use strict'; { function x(){} } return x })()
        ❌ Uncaught ReferenceError: x is not defined
        ```

        The bundling process sometimes erases strict mode context. For example, different files may have different strict mode status but may be merged into a single file which all shares the same strict mode status. Also, files in ESM format are automatically in strict mode but a bundle output file in IIFE format may not be executed in strict mode. Transforming the nested `function` to a `let` in strict mode and a `var` in non-strict mode means esbuild's output will behave reliably in different environments.

    2. The "keep names" feature adds automatic calls to the built-in `__name` helper function to assign the original name to the `.name` property of the minified function object at run-time. That transforms the code into this:

        ```js
        let inner = function() {
          return Math.random();
        };
        __name(inner, "inner");
        const x = inner();
        console.log(x);
        ```

        This injected helper call does not count as a use of the associated function object so that dead-code elimination will still remove the function object as dead code if nothing else uses it. Otherwise dead-code elimination would stop working when the "keep names" feature is enabled.

    3. Minification enables an optimization where an initialized variable with a single use immediately following that variable is transformed by inlining the initializer into the use. So for example `var a = 1; return a` is transformed into `return 1`. This code matches this pattern (initialized single-use variable + use immediately following that variable) so the optimization does the inlining, which transforms the code into this:

        ```js
        __name(function() {
          return Math.random();
        }, "inner");
        const x = inner();
        console.log(x);
        ```

        The code is now incorrect because `inner` actually has two uses, although only one was actually counted.

    This inlining optimization will now be avoided in this specific case, which fixes the bug without regressing dead-code elimination or initialized variable inlining in any other cases.

## 0.12.22

* Make HTTP range requests more efficient ([#1536](https://github.com/evanw/esbuild/issues/1536))

    The local HTTP server built in to esbuild supports [range requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests), which are necessary for video playback in Safari. This means you can now use `<video>` tags in your HTML pages with esbuild's local HTTP server.

    Previously this was implemented inefficiently for files that aren't part of the build, but that are read from the underlying fallback directory. In that case the entire file was being read even though only part of the file was needed. In this release, only the part of the file that is needed is read so using HTTP range requests with esbuild in this case will now use less memory.

* Fix CSS minification bug with `box-shadow` and `var()` ([#1538](https://github.com/evanw/esbuild/issues/1538))

    The `box-shadow` property can be specified using 2, 3, or 4 numbers. The 3rd and 4th numbers are the blur radius and spread radius, and can be omitted if zero. When minifying, esbuild has an optimization that removes trailing zeros from runs of numbers within the `box-shadow` property. However, that optimization is not correct in the presence of tokens that are neither a number, a color, nor the token `insert`. These edge cases include `var()` or `calc()` tokens. With this release, esbuild will now do stronger validation and will only remove trailing zeros if the contents of the `box-shadow` property matches the underlying CSS grammar exactly.

    ```css
    /* Original code */
    button {
      box-shadow: 0 0 0 var(--spread) red;
    }

    /* Old minified output */
    button{box-shadow:0 0 var(--spread) red}

    /* New minified output */
    button{box-shadow:0 0 0 var(--spread) red}
    ```

## 0.12.21

* Add support for native esbuild on Windows 64-bit ARM ([#995](https://github.com/evanw/esbuild/issues/995))

    The newly-released Go version 1.17.0 [adds support for Windows 64-bit ARM CPUs](https://golang.org/doc/go1.17#windows), so esbuild can now support these CPUs as well. This release introduces support for `npm install esbuild` on Windows 64-bit ARM.

## 0.12.20

* Avoid the sequence `</style` in CSS output ([#1509](https://github.com/evanw/esbuild/issues/1509))

    The CSS code generator now avoids generating the character sequence `</style` in case you want to embed the CSS output in a `<style>...</style>` tag inside HTML:

    ```css
    /* Original code */
    a:after {
      content: "</style>";
    }

    /* Old output */
    a:after {
      content: "</style>";
    }

    /* New output */
    a:after {
      content: "<\/style>";
    }
    ```

    This mirrors how the JS code generator similarly avoids the character sequence `</script`.

    In addition, the check that escapes `</style` and `</script` is now case-insensitive to match how the browser's HTML parser behaves. So `</STYLE` and `</SCRIPT` are now escaped as well.

* Fix a TypeScript parsing edge case with ASI (Automatic Semicolon Insertion) ([#1512](https://github.com/evanw/esbuild/issues/1512))

    This fixes a parsing bug where TypeScript types consisting of multiple identifiers joined together with a `.` could incorrectly extend onto the next line if the next line started with `<`. This problem was due to ASI; esbuild should be automatically inserting a semicolon at the end of the line:

    ```ts
    let x: {
      <A extends B>(): c.d /* A semicolon should be automatically inserted here */
      <E extends F>(): g.h
    }
    ```

    Previously the above code was incorrectly considered a syntax error since esbuild attempted to parse the parameterized type `c.d<E extends F ? ...>`. With this release, this code is now parsed correctly.

## 0.12.19

* Add support for CSS source maps ([#519](https://github.com/evanw/esbuild/issues/519))

    With this release, esbuild will now generate source maps for CSS output files when `--sourcemap` is enabled. This supports all of the same options as JS source maps including `--sourcemap=inline` and `--sourcemap=external`. In addition, CSS input files with embedded `/*# sourceMappingURL=... */` comments will cause the CSS output file source map to map all the way back to the original inputs. CSS source maps are used by the browser's style inspector to link back to the original source code instead of linking to the bundled source code.

* Fix computed class fields in TypeScript edge case ([#1507](https://github.com/evanw/esbuild/issues/1507))

    If TypeScript code contains computed class fields, the target environment supports class fields so syntax lowering is not necessary, and TypeScript's `useDefineForClassFields` setting is set to `true`, then esbuild had a bug where the computed property names were computed after the class definition and were undefined. Note that TypeScript's `useDefineForClassFields` setting defaults to `true` if `tsconfig.json` contains `"target": "ESNext"`.

    ```ts
    // Original code
    class Foo {
      [foo] = 1;
      @bar [baz] = 2;
    }

    // Old output
    var _a, _b;
    var Foo = class {
      [_a] = 1;
      [_b] = 2;
    };
    _a = foo, _b = baz;
    __decorateClass([
      bar
    ], Foo.prototype, _b, 2);

    // New output
    var _a;
    var Foo = class {
      [foo] = 1;
      [_a = baz] = 2;
    };
    __decorateClass([
      bar
    ], Foo.prototype, _a, 2);
    ```

    The problem in this case is that normally TypeScript moves class field initializers into the special `constructor` method (automatically generating one if one doesn't already exist) so the side effects for class field property names must happen after the class body. But if class fields are supported by the target environment then the side effects must happen inline instead.

## 0.12.18

* Allow implicit `./` in CSS `@import` paths ([#1494](https://github.com/evanw/esbuild/pull/1494))

    In the browser, the paths inside CSS `@import` rules are implicitly relative to the path of the current CSS style sheet. Previously esbuild used node's JS path resolution rules in CSS as well, which required a `./` or `../` prefix for a path to be considered a relative path. Paths without that prefix are considered package paths and are searched for inside `node_modules` instead.

    With this release, esbuild will now first try to interpret the path as a relative path and then fall back to interpreting it as a package path if nothing exists at that relative path. This feature was originally added in version 0.7.18 but only worked for CSS `url()` tokens. In this release it now also works for `@import` rules.

    This feature was contributed by [@pd4d10](https://github.com/pd4d10).

* Fix lowering of nullish coalescing assignment edge case ([#1493](https://github.com/evanw/esbuild/issues/1493))

    This release fixes a bug where lowering of the `??=` nullish coalescing assignment operator failed when the target environment supported nullish coalescing and private class fields but not nullish coalescing assignment. An example target environment with this specific feature support matrix combination is node 14.8. This edge case is now lowered correctly:

    ```js
    // Original code
    class A {
      #a;
      f() {
        this.#a ??= 1;
      }
    }

    // Old output (with --target=node14.8)
    panic: Unexpected expression of type *js_ast.EPrivateIdentifier

    // New output (with --target=node14.8)
    class A {
      #a;
      f() {
        this.#a ?? (this.#a = 1);
      }
    }
    ```

* Fix public fields being inserted before `super()` call ([#1497](https://github.com/evanw/esbuild/issues/1497))

    The helper function that esbuild uses to emulate the new public class field syntax can potentially be inserted into the class constructor before the `super()` call. That is problematic because the helper function makes use of `this`, and `this` must only be used after the `super()` call. This release fixes a case where this happens when minification is enabled:

    ```js
    // Original code
    class A extends B {
      x;
      constructor() {
        f();
        super();
      }
    }

    // Old output (with --minify-syntax --target=es6)
    class A extends B {
      constructor() {
        __publicField(this, "x");
        f(), super();
      }
    }

    // New output (with --minify-syntax --target=es6)
    class A extends B {
      constructor() {
        f();
        super();
        __publicField(this, "x");
      }
    }
    ```

* Fix lowering of static private methods in class expressions ([#1498](https://github.com/evanw/esbuild/issues/1498))

    Previously static private methods were lowered incorrectly when present in class expressions. The class expression itself was missing in the output due to an oversight (variable shadowing). This issue has been fixed:

    ```js
    // Original code
    (class {
      static #x() {}
    });

    // Old output (with --target=es6)
    var _x, _a, x_fn;
    __privateAdd(_a, _x), _x = new WeakSet(), x_fn = function() {
    }, __privateAdd(_a, _x), _a;

    // New output (with --target=es6)
    var _x, _a, x_fn;
    _a = class {
    }, _x = new WeakSet(), x_fn = function() {
    }, __privateAdd(_a, _x), _a;
    ```

## 0.12.17

* Fix a bug with private fields and logical assignment operators ([#1418](https://github.com/evanw/esbuild/issues/1418))

    This release fixes a bug where code using private fields in combination with [logical assignment operators](https://github.com/tc39/proposal-logical-assignment) was transformed incorrectly if the target environment supported logical assignment operators but not private fields. Since logical assignment operators are assignment operators, the entire operator must be transformed even if the operator is supported. This should now work correctly:

    ```js
    // Original code
    class Foo {
      #x
      foo() {
        this.#x &&= 2
        this.#x ||= 2
        this.#x ??= 2
      }
    }

    // Old output
    var _x;
    class Foo {
      constructor() {
        __privateAdd(this, _x, void 0);
      }
      foo() {
        this._x &&= 2;
        this._x ||= 2;
        this._x ??= 2;
      }
    }
    _x = new WeakMap();

    // New output
    var _x, _a;
    class Foo {
      constructor() {
        __privateAdd(this, _x, void 0);
      }
      foo() {
        __privateGet(this, _x) && __privateSet(this, _x, 2);
        __privateGet(this, _x) || __privateSet(this, _x, 2);
        __privateGet(this, _x) ?? __privateSet(this, _x, 2);
      }
    }
    _x = new WeakMap();
    ```

* Fix a hoisting bug in the bundler ([#1455](https://github.com/evanw/esbuild/issues/1455))

    This release fixes a bug where variables declared using `var` inside of top-level `for` loop initializers were not hoisted inside lazily-initialized ES modules (such as those that are generated when bundling code that loads an ES module using `require`). This meant that hoisted function declarations incorrectly didn't have access to these loop variables:

    ```js
    // entry.js
    console.log(require('./esm-file').test())

    // esm-file.js
    for (var i = 0; i < 10; i++) ;
    export function test() { return i }
    ```

    Old output (incorrect):

    ```js
    // esm-file.js
    var esm_file_exports = {};
    __export(esm_file_exports, {
      test: () => test
    });
    function test() {
      return i;
    }
    var init_esm_file = __esm({
      "esm-file.js"() {
        for (var i = 0; i < 10; i++)
          ;
      }
    });

    // entry.js
    console.log((init_esm_file(), esm_file_exports).test());
    ```

    New output (correct):

    ```js
    // esm-file.js
    var esm_file_exports = {};
    __export(esm_file_exports, {
      test: () => test
    });
    function test() {
      return i;
    }
    var i;
    var init_esm_file = __esm({
      "esm-file.js"() {
        for (i = 0; i < 10; i++)
          ;
      }
    });

    // entry.js
    console.log((init_esm_file(), esm_file_exports).test());
    ```

* Fix a code generation bug for private methods ([#1424](https://github.com/evanw/esbuild/issues/1424))

    This release fixes a bug where when private methods are transformed and the target environment is one that supports private methods (such as `esnext`), the member function name was uninitialized and took on the zero value by default. This resulted in the member function name becoming `__create` instead of the correct name since that's the name of the symbol at index 0. Now esbuild always generates a private method symbol even when private methods are supported, so this is no longer an issue:

    ```js
    // Original code
    class Foo {
      #a() { return 'a' }
      #b() { return 'b' }
      static c
    }

    // Old output
    var _a, __create, _b, __create;
    var Foo = class {
      constructor() {
        __privateAdd(this, _a);
        __privateAdd(this, _b);
      }
    };
    _a = new WeakSet();
    __create = function() {
      return "a";
    };
    _b = new WeakSet();
    __create = function() {
      return "b";
    };
    __publicField(Foo, "c");

    // New output
    var _a, a_fn, _b, b_fn;
    var Foo = class {
      constructor() {
        __privateAdd(this, _a);
        __privateAdd(this, _b);
      }
    };
    _a = new WeakSet();
    a_fn = function() {
      return "a";
    };
    _b = new WeakSet();
    b_fn = function() {
      return "b";
    };
    __publicField(Foo, "c");
    ```

* The CLI now stops watch and serve mode when stdin is closed ([#1449](https://github.com/evanw/esbuild/pull/1449))

    To facilitate esbuild being called from the Erlang VM, esbuild's command-line interface will now exit when in `--watch` or `--serve` mode if stdin is closed. This change is necessary because the Erlang VM doesn't have an API for terminating a child process, so it instead closes stdin to indicate that the process is no longer needed.

    Note that this only happens when stdin is not a TTY (i.e. only when the CLI is being used non-interactively) to avoid disrupting the use case of manually moving esbuild to a background job using a Unix terminal.

    This change was contributed by [@josevalim](https://github.com/josevalim).

## 0.12.16

* Remove warning about bad CSS `@`-rules ([#1426](https://github.com/evanw/esbuild/issues/1426))

    The CSS bundler built in to esbuild is only designed with real CSS in mind. Running other languages that compile down to CSS through esbuild without compiling them down to CSS first can be a bad idea since esbuild applies browser-style error recovery to invalid syntax and uses browser-style import order that other languages might not be expecting. This is why esbuild previously generated warnings when it encountered unknown CSS `@`-rules.

    However, some people want to run other non-CSS languages through esbuild's CSS bundler anyway. So with this release, esbuild will no longer generate any warnings if you do this. But keep in mind that doing this is still potentially unsafe. Depending on the input language, using esbuild's CSS bundler to bundle non-CSS code can still potentially alter the semantics of your code.

* Allow `ES2021` in `tsconfig.json` ([#1470](https://github.com/evanw/esbuild/issues/1470))

    TypeScript recently [added support for `ES2021`](https://github.com/microsoft/TypeScript/pull/41239) in `tsconfig.json` so esbuild now supports this too. This has the same effect as if you passed `--target=es2021` to esbuild. Keep in mind that the value of `target` in `tsconfig.json` is only respected if you did not pass a `--target=` value to esbuild.

* Avoid using the `worker_threads` optimization in certain old node versions ([#1462](https://github.com/evanw/esbuild/issues/1462))

    The `worker_threads` optimization makes esbuild's synchronous API calls go much faster than they would otherwise. However, it turns out this optimization cannot be used in certain node versions older than `v12.17.0`, where node throws an error when trying to create the worker. This optimization is now disabled in these scenarios.

    Note that these old node versions are [currently in maintenance](https://nodejs.org/en/about/releases/). I recommend upgrading to a modern version of node if run-time performance is important to you.

* Paths starting with `node:` are implicitly external when bundling for node ([#1466](https://github.com/evanw/esbuild/issues/1466))

    This replicates a new node feature where you can [prefix an import path with `node:`](https://nodejs.org/api/esm.html#esm_node_imports) to load a native node module by that name (such as `import fs from "node:fs/promises"`). These paths also [have special behavior](https://nodejs.org/api/modules.html#modules_core_modules):

    > Core modules can also be identified using the `node:` prefix, in which case it bypasses the `require` cache. For instance, `require('node:http')` will always return the built in HTTP module, even if there is `require.cache` entry by that name.

    With this release, esbuild's built-in resolver will now automatically consider all import paths starting with `node:` as external. This new behavior is only active when the current platform is set to node such as with `--platform=node`. If you need to customize this behavior, you can write a plugin to intercept these paths and treat them differently.

* Consider `\` and `/` to be the same in file paths ([#1459](https://github.com/evanw/esbuild/issues/1459))

    On Windows, there are many different file paths that can refer to the same underlying file. Windows uses a case-insensitive file system so for example `foo.js` and `Foo.js` are the same file. When bundling, esbuild needs to treat both of these paths as the same to avoid incorrectly bundling the file twice. This is case is already handled by identifying files by their lower-case file path.

    The case that wasn't being handled is the fact that Windows supports two different path separators, `/` and `\`, both of which mean the same thing. For example `foo/bar.js` and `foo\bar.js` are the same file. With this release, this case is also handled by esbuild. Files that are imported in multiple places with inconsistent path separators will now be considered the same file instead of bundling the file multiple times.

## 0.12.15

* Fix a bug with `var()` in CSS color lowering ([#1421](https://github.com/evanw/esbuild/issues/1421))

    This release fixes a bug with esbuild's handling of the `rgb` and `hsl` color functions when they contain `var()`. Each `var()` token sequence can be substituted for any number of tokens including zero or more than one, but previously esbuild's output was only correct if each `var()` inside of `rgb` or `hsl` contained exactly one token. With this release, esbuild will now not attempt to transform newer CSS color syntax to older CSS color syntax if it contains `var()`:

    ```
    /* Original code */
    a {
      color: hsl(var(--hs), var(--l));
    }

    /* Old output */
    a {
      color: hsl(var(--hs), ,, var(--l));
    }

    /* New output */
    a {
      color: hsl(var(--hs), var(--l));
    }
    ```

    The bug with the old output above happened because esbuild considered the arguments to `hsl` as matching the pattern `hsl(h s l)` which is the new space-separated form allowed by [CSS Color Module Level 4](https://drafts.csswg.org/css-color/#the-hsl-notation). Then esbuild tried to convert this to the form `hsl(h, s, l)` which is more widely supported by older browsers. But this substitution doesn't work in the presence of `var()`, so it has now been disabled in that case.

## 0.12.14

* Fix the `file` loader with custom namespaces ([#1404](https://github.com/evanw/esbuild/issues/1404))

    This fixes a regression from version 0.12.12 where using a plugin to load an input file with the `file` loader in a custom namespace caused esbuild to write the contents of that input file to the path associated with that namespace instead of to a path inside of the output directory. With this release, the `file` loader should now always copy the file somewhere inside of the output directory.

## 0.12.13

* Fix using JS synchronous API from from non-main threads ([#1406](https://github.com/evanw/esbuild/issues/1406))

    This release fixes an issue with the new implementation of the synchronous JS API calls (`transformSync` and `buildSync`) when they are used from a thread other than the main thread. The problem happened because esbuild's new implementation uses node's `worker_threads` library internally and non-main threads were incorrectly assumed to be esbuild's internal thread instead of potentially another unrelated thread. Now esbuild's synchronous JS APIs should work correctly when called from non-main threads.

## 0.12.12

* Fix `file` loader import paths when subdirectories are present ([#1044](https://github.com/evanw/esbuild/issues/1044))

    Using the `file` loader for a file type causes importing affected files to copy the file into the output directory and to embed the path to the copied file into the code that imported it. However, esbuild previously always embedded the path relative to the output directory itself. This is problematic when the importing code is generated within a subdirectory inside the output directory, since then the relative path is wrong. For example:

    ```
    $ cat src/example/entry.css
    div {
      background: url(../images/image.png);
    }

    $ esbuild --bundle src/example/entry.css --outdir=out --outbase=src --loader:.png=file

    $ find out -type f
    out/example/entry.css
    out/image-55DNWN2R.png

    $ cat out/example/entry.css
    /* src/example/entry.css */
    div {
      background: url(./image-55DNWN2R.png);
    }
    ```

    This is output from the previous version of esbuild. The above asset reference in `out/example/entry.css` is wrong. The path should start with `../` because the two files are in different directories.

    With this release, the asset references present in output files will now be the full relative path from the output file to the asset, so imports should now work correctly when the entry point is in a subdirectory within the output directory. This change affects asset reference paths in both CSS and JS output files.

    Note that if you want asset reference paths to be independent of the subdirectory in which they reside, you can use the `--public-path` setting to provide the common path that all asset reference paths should be constructed relative to. Specifically `--public-path=.` should bring back the old problematic behavior in case you need it.

* Add support for `[dir]` in `--asset-names` ([#1196](https://github.com/evanw/esbuild/pull/1196))

    You can now use path templates such as `--asset-names=[dir]/[name]-[hash]` to copy the input directory structure of your asset files (i.e. input files loaded with the `file` loader) to the output directory. Here's an example:

    ```
    $ cat entry.css
    header {
      background: url(images/common/header.png);
    }
    main {
      background: url(images/home/hero.png);
    }

    $ esbuild --bundle entry.css --outdir=out --asset-names=[dir]/[name]-[hash] --loader:.png=file

    $ find out -type f
    out/images/home/hero-55DNWN2R.png
    out/images/common/header-55DNWN2R.png
    out/entry.css

    $ cat out/entry.css
    /* entry.css */
    header {
      background: url(./images/common/header-55DNWN2R.png);
    }
    main {
      background: url(./images/home/hero-55DNWN2R.png);
    }
    ```

## 0.12.11

* Enable faster synchronous transforms with the JS API by default ([#1000](https://github.com/evanw/esbuild/issues/1000))

    Currently the synchronous JavaScript API calls `transformSync` and `buildSync` spawn a new child process on every call. This is due to limitations with node's `child_process` API. Doing this means `transformSync` and `buildSync` are much slower than `transform` and `build`, which share the same child process across calls.

    This release improves the performance of `transformSync` and `buildSync` by up to 20x. It enables a hack where node's `worker_threads` API and atomics are used to block the main thread while asynchronous communication with a single long-lived child process happens in a worker. Previously this was only enabled when the `ESBUILD_WORKER_THREADS` environment variable was set to `1`. But this experiment has been available for a while (since version 0.9.6) without any reported issues. Now this hack will be enabled by default. It can be disabled by setting `ESBUILD_WORKER_THREADS` to `0` before running node.

* Fix nested output directories with WebAssembly on Windows ([#1399](https://github.com/evanw/esbuild/issues/1399))

    Many functions in Go's standard library have a bug where they do not work on Windows when using Go with WebAssembly. This is a long-standing bug and is a fault with the design of the standard library, so it's unlikely to be fixed. Basically Go's standard library is designed to bake "Windows or not" decision into the compiled executable, but WebAssembly is platform-independent which makes "Windows or not" is a run-time decision instead of a compile-time decision. Oops.

    I have been working around this by trying to avoid using path-related functions in the Go standard library and doing all path manipulation by myself instead. This involved completely replacing Go's `path/filepath` library. However, I missed the `os.MkdirAll` function which is also does path manipulation but is outside of the `path/filepath` package. This meant that nested output directories failed to be created on Windows, which caused a build error. This problem only affected the `esbuild-wasm` package.

    This release manually reimplements nested output directory creation to work around this bug in the Go standard library. So nested output directories should now work on Windows with the `esbuild-wasm` package.

## 0.12.10

* Add a target for ES2021

    It's now possible to use `--target=es2021` to target the newly-released JavaScript version ES2021. The only difference between that and `--target=es2020` is that logical assignment operators such as `a ||= b` are not converted to regular assignment operators such as `a || (a = b)`.

* Minify the syntax `Infinity` to `1 / 0` ([#1385](https://github.com/evanw/esbuild/pull/1385))

	The `--minify-syntax` flag (automatically enabled by `--minify`) will now minify the expression `Infinity` to `1 / 0`, which uses fewer bytes:

	```js
	// Original code
	const a = Infinity;

	// Output with "--minify-syntax"
	const a = 1 / 0;
	```

    This change was contributed by [@Gusted](https://github.com/Gusted).

* Minify syntax in the CSS `transform` property ([#1390](https://github.com/evanw/esbuild/pull/1390))

    This release includes various size reductions for CSS transform matrix syntax when minification is enabled:

    ```css
    /* Original code */
    div {
      transform: translate3d(0, 0, 10px) scale3d(200%, 200%, 1) rotate3d(0, 0, 1, 45deg);
    }

    /* Output with "--minify-syntax" */
    div {
      transform: translateZ(10px) scale(2) rotate(45deg);
    }
    ```

    The `translate3d` to `translateZ` conversion was contributed by [@steambap](https://github.com/steambap).

* Support for the case-sensitive flag in CSS attribute selectors ([#1397](https://github.com/evanw/esbuild/issues/1397))

    You can now use the case-sensitive CSS attribute selector flag `s` such as in `[type="a" s] { list-style: lower-alpha; }`. Previously doing this caused a warning about unrecognized syntax.

## 0.12.9

* Allow `this` with `--define` ([#1361](https://github.com/evanw/esbuild/issues/1361))

    You can now override the default value of top-level `this` with the `--define` feature. Top-level `this` defaults to being `undefined` in ECMAScript modules and `exports` in CommonJS modules. For example:

    ```js
    // Original code
    ((obj) => {
      ...
    })(this);

    // Output with "--define:this=window"
    ((obj) => {
      ...
    })(window);
    ```

    Note that overriding what top-level `this` is will likely break code that uses it correctly. So this new feature is only useful in certain cases.

* Fix CSS minification issue with `!important` and duplicate declarations ([#1372](https://github.com/evanw/esbuild/issues/1372))

    Previously CSS with duplicate declarations for the same property where the first one was marked with `!important` was sometimes minified incorrectly. For example:

    ```css
    .selector {
      padding: 10px !important;
      padding: 0;
    }
    ```

    This was incorrectly minified as `.selector{padding:0}`. The bug affected three properties: `padding`, `margin`, and `border-radius`. With this release, this code will now be minified as `.selector{padding:10px!important;padding:0}` instead which means there is no longer a difference between minified and non-minified code in this case.

## 0.12.8

* Plugins can now specify `sideEffects: false` ([#1009](https://github.com/evanw/esbuild/issues/1009))

    The default path resolution behavior in esbuild determines if a given file can be considered side-effect free (in the [Webpack-specific sense](https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free)) by reading the contents of the nearest enclosing `package.json` file and looking for `"sideEffects": false`. However, up until now this was impossible to achieve in an esbuild plugin because there was no way of returning this metadata back to esbuild.

    With this release, esbuild plugins can now return `sideEffects: false` to mark a file as having no side effects. Here's an example:

    ```js
    esbuild.build({
      entryPoints: ['app.js'],
      bundle: true,
      plugins: [{
        name: 'env-plugin',
        setup(build) {
          build.onResolve({ filter: /^env$/ }, args => ({
            path: args.path,
            namespace: 'some-ns',
            sideEffects: false,
          }))
          build.onLoad({ filter: /.*/, namespace: 'some-ns' }, () => ({
            contents: `export default self.env || (self.env = getEnv())`,
          }))
        },
      }],
    })
    ```

    This plugin creates a virtual module that can be generated by importing the string `env`. However, since the plugin returns `sideEffects: false`, the generated virtual module will not be included in the bundle if all of the imported values from the module `env` end up being unused.

    This feature was contributed by [@chriscasola](https://github.com/chriscasola).

* Remove a warning about unsupported source map comments ([#1358](https://github.com/evanw/esbuild/issues/1358))

    This removes a warning that indicated when a source map comment couldn't be supported. Specifically, this happens when you enable source map generation and esbuild encounters a file with a source map comment pointing to an external file but doesn't have enough information to know where to look for that external file (basically when the source file doesn't have an associated directory to use for path resolution). In this case esbuild can't respect the input source map because it cannot be located. The warning was annoying so it has been removed. Source maps still won't work, however.

## 0.12.7

* Quote object properties that are modern Unicode identifiers ([#1349](https://github.com/evanw/esbuild/issues/1349))

    In ES6 and above, an identifier is a character sequence starting with a character in the `ID_Start` Unicode category and followed by zero or more characters in the `ID_Continue` Unicode category, and these categories must be drawn from Unicode version 5.1 or above.

    But in ES5, an identifier is a character sequence starting with a character in one of the `Lu, Ll, Lt, Lm, Lo, Nl` Unicode categories and followed by zero or more characters in the `Lu, Ll, Lt, Lm, Lo, Nl, Mn, Mc, Nd, Pc` Unicode categories, and these categories must be drawn from Unicode version 3.0 or above.

    Previously esbuild always used the ES6+ identifier validation test when deciding whether to use an identifier or a quoted string to encode an object property but with this release, it will use the ES5 validation test instead:

    ```js
    // Original code
    x.ꓷꓶꓲꓵꓭꓢꓱ = { ꓷꓶꓲꓵꓭꓢꓱ: y };

    // Old output
    x.ꓷꓶꓲꓵꓭꓢꓱ = { ꓷꓶꓲꓵꓭꓢꓱ: y };

    // New output
    x["ꓷꓶꓲꓵꓭꓢꓱ"] = { "ꓷꓶꓲꓵꓭꓢꓱ": y };
    ```

    This approach should ensure maximum compatibility with all JavaScript environments that support ES5 and above. Note that this means minified files containing Unicode properties may be slightly larger than before.

* Ignore `tsconfig.json` files inside `node_modules` ([#1355](https://github.com/evanw/esbuild/issues/1355))

    Package authors often publish their `tsconfig.json` files to npm because of npm's default-include publishing model and because these authors probably don't know about `.npmignore` files. People trying to use these packages with esbuild have historically complained that esbuild is respecting `tsconfig.json` in these cases. The assumption is that the package author published these files by accident.

    With this release, esbuild will no longer respect `tsconfig.json` files when the source file is inside a `node_modules` folder. Note that `tsconfig.json` files inside `node_modules` are still parsed, and extending `tsconfig.json` files from inside a package is still supported.

* Fix missing `--metafile` when using `--watch` ([#1357](https://github.com/evanw/esbuild/issues/1357))

    Due to an oversight, the `--metafile` setting didn't work when `--watch` was also specified. This only affected the command-line interface. With this release, the `--metafile` setting should now work in this case.

* Add a hidden `__esModule` property to modules in ESM format ([#1338](https://github.com/evanw/esbuild/pull/1338))

    Module namespace objects from ESM files will now have a hidden `__esModule` property. This improves compatibility with code that has been converted from ESM syntax to CommonJS by Babel or TypeScript. For example:

    ```js
    // Input TypeScript code
    import x from "y"
    console.log(x)

    // Output JavaScript code from the TypeScript compiler
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const y_1 = __importDefault(require("y"));
    console.log(y_1.default);
    ```

    If the object returned by `require("y")` doesn't have an `__esModule` property, then `y_1` will be the object `{ "default": require("y") }`. If the file `"y"` is in ESM format and has a default export of, say, the value `null`, that means `y_1` will now be `{ "default": { "default": null } }` and you will need to use `y_1.default.default` to access the default value. Adding an automatically-generated `__esModule` property when converting files in ESM format to CommonJS is required to make this code work correctly (i.e. for the value to be accessible via just `y_1.default` instead).

    With this release, code in ESM format will now have an automatically-generated `__esModule` property to satisfy this convention. The property is non-enumerable so it shouldn't show up when iterating over the properties of the object. As a result, the export name `__esModule` is now reserved for use with esbuild. It's now an error to create an export with the name `__esModule`.

    This fix was contributed by [@lbwa](https://github.com/lbwa).

## 0.12.6

* Improve template literal lowering transformation conformance ([#1327](https://github.com/evanw/esbuild/issues/1327))

    This release contains the following improvements to template literal lowering for environments that don't support tagged template literals natively (such as `--target=es5`):

    * For tagged template literals, the arrays of strings that are passed to the tag function are now frozen and immutable. They are also now cached so they should now compare identical between multiple template evaluations:

        ```js
        // Original code
        console.log(tag`\u{10000}`)

        // Old output
        console.log(tag(__template(["𐀀"], ["\\u{10000}"])));

        // New output
        var _a;
        console.log(tag(_a || (_a = __template(["𐀀"], ["\\u{10000}"]))));
        ```

    * For tagged template literals, the generated code size is now smaller in the common case where there are no escape sequences, since in that case there is no distinction between "raw" and "cooked" values:

        ```js
        // Original code
        console.log(tag`some text without escape sequences`)

        // Old output
        console.log(tag(__template(["some text without escape sequences"], ["some text without escape sequences"])));

        // New output
        var _a;
        console.log(tag(_a || (_a = __template(["some text without escape sequences"]))));
        ```

    * For non-tagged template literals, the generated code now uses chains of `.concat()` calls instead of string addition:

        ```js
        // Original code
        console.log(`an ${example} template ${literal}`)

        // Old output
        console.log("an " + example + " template " + literal);

        // New output
        console.log("an ".concat(example, " template ").concat(literal));
        ```

        The old output was incorrect for several reasons including that `toString` must be called instead of `valueOf` for objects and that passing a `Symbol` instance should throw instead of converting the symbol to a string. Using `.concat()` instead of string addition fixes both of those correctness issues. And you can't use a single `.concat()` call because side effects must happen inline instead of at the end.

* Only respect `target` in `tsconfig.json` when esbuild's target is not configured ([#1332](https://github.com/evanw/esbuild/issues/1332))

    In version 0.12.4, esbuild began respecting the `target` setting in `tsconfig.json`. However, sometimes `tsconfig.json` contains target values that should not be used. With this release, esbuild will now only use the `target` value in `tsconfig.json` as the language level when esbuild's `target` setting is not configured. If esbuild's `target` setting is configured then the `target` value in `tsconfig.json` is now ignored.

* Fix the order of CSS imported from JS ([#1342](https://github.com/evanw/esbuild/pull/1342))

    Importing CSS from JS when bundling causes esbuild to generate a sibling CSS output file next to the resulting JS output file containing the bundled CSS. The order of the imported CSS files in the output was accidentally the inverse order of the order in which the JS files were evaluated. Instead the order of the imported CSS files should match the order in which the JS files were evaluated. This fix was contributed by [@dmitrage](https://github.com/dmitrage).

* Fix an edge case with transforming `export default class` ([#1346](https://github.com/evanw/esbuild/issues/1346))

    Statements of the form `export default class x {}` were incorrectly transformed to `class x {} var y = x; export {y as default}` instead of `class x {} export {x as default}`. Transforming these statements like this is incorrect in the rare case that the class is later reassigned by name within the same file such as `export default class x {} x = null`. Here the imported value should be `null` but was incorrectly the class object instead. This is unlikely to matter in real-world code but it has still been fixed to improve correctness.

## 0.12.5

* Add support for lowering tagged template literals to ES5 ([#297](https://github.com/evanw/esbuild/issues/297))

    This release adds support for lowering tagged template literals such as `` String.raw`\unicode` `` to target environments that don't support them such as `--target=es5` (non-tagged template literals were already supported). Each literal turns into a function call to a helper function:

    ```js
    // Original code
    console.log(String.raw`\unicode`)

    // Lowered code
    console.log(String.raw(__template([void 0], ["\\unicode"])));
    ```

* Change class field behavior to match TypeScript 4.3

    TypeScript 4.3 includes a subtle breaking change that wasn't mentioned in the [TypeScript 4.3 blog post](https://devblogs.microsoft.com/typescript/announcing-typescript-4-3/): class fields will now be compiled with different semantics if `"target": "ESNext"` is present in `tsconfig.json`. Specifically in this case `useDefineForClassFields` will default to `true` when not specified instead of `false`. This means class field behavior in TypeScript code will now match JavaScript instead of doing something else:

    ```js
    class Base {
      set foo(value) { console.log('set', value) }
    }
    class Derived extends Base {
      foo = 123
    }
    new Derived()
    ```

    In TypeScript 4.2 and below, the TypeScript compiler would generate code that prints `set 123` when `tsconfig.json` contains `"target": "ESNext"` but in TypeScript 4.3, the TypeScript compiler will now generate code that doesn't print anything. This is the difference between "assign" semantics and "define" semantics. With this release, esbuild has been changed to follow the TypeScript 4.3 behavior.

* Avoid generating the character sequence `</script>` ([#1322](https://github.com/evanw/esbuild/issues/1322))

    If the output of esbuild is inlined into a `<script>...</script>` tag inside an HTML file, the character sequence `</script>` inside the JavaScript code will accidentally cause the script tag to be terminated early. There are at least four such cases where this can happen:

    ```js
    console.log('</script>')
    console.log(1</script>/.exec(x).length)
    console.log(String.raw`</script>`)
    // @license </script>
    ```

    With this release, esbuild will now handle all of these cases and avoid generating the problematic character sequence:

    ```js
    console.log('<\/script>');
    console.log(1< /script>/.exec(x).length);
    console.log(String.raw(__template(["<\/script>"], ["<\/script>"])));
    // @license <\/script>
    ```

* Change the triple-slash reference comment for Deno ([#1325](https://github.com/evanw/esbuild/issues/1325))

    The comment in esbuild's JavaScript API implementation for Deno that references the TypeScript type declarations has been changed from `/// <reference path="./mod.d.ts" />` to `/// <reference types="./mod.d.ts" />`. This comment was copied from Deno's documentation but apparently Deno's documentation was incorrect. The comment in esbuild's Deno bundle has been changed to reflect Deno's latest documentation.

## 0.12.4

* Reorder name preservation before TypeScript decorator evaluation ([#1316](https://github.com/evanw/esbuild/issues/1316))

    The `--keep-names` option ensures the `.name` property on functions and classes remains the same after bundling. However, this was being enforced after TypeScript decorator evaluation which meant that the decorator could observe the incorrect name. This has been fixed and now `.name` preservation happens before decorator evaluation instead.

* Potential fix for a determinism issue ([#1304](https://github.com/evanw/esbuild/issues/1304))

    This release contains a potential fix for an unverified issue with non-determinism in esbuild. The regression was apparently introduced in 0.11.13 and may be related to parallelism that was introduced around the point where dynamic `import()` expressions are added to the list of entry points. Hopefully this fix should resolve the regression.

* Respect `target` in `tsconfig.json` ([#277](https://github.com/evanw/esbuild/issues/277))

    Each JavaScript file that esbuild bundles will now be transformed according to the [`target`](https://www.typescriptlang.org/tsconfig#target) language level from the nearest enclosing `tsconfig.json` file. This is in addition to esbuild's own `--target` setting; the two settings are merged by transforming any JavaScript language feature that is unsupported in either esbuild's configured `--target` value or the `target` property in the `tsconfig.json` file.

## 0.12.3

* Ensure JSX element names start with a capital letter ([#1309](https://github.com/evanw/esbuild/issues/1309))

    The JSX specification only describes the syntax and says nothing about how to interpret it. But React (and therefore esbuild) treats JSX tags that start with a lower-case ASCII character as strings instead of identifiers. That way the tag `<i/>` always refers to the italic HTML element `i` and never to a local variable named `i`.

    However, esbuild may rename identifiers for any number of reasons such as when minification is enabled. Previously esbuild could sometimes rename identifiers used as tag names such that they start with a lower-case ASCII character. This is problematic when JSX syntax preservation is enabled since subsequent JSX processing would then turn these identifier references into strings.

    With this release, esbuild will now make sure identifiers used in tag names start with an upper-case ASCII character instead when JSX syntax preservation is enabled. This should avoid problems when using esbuild with JSX transformation tools.

* Fix a single hyphen being treated as a CSS name ([#1310](https://github.com/evanw/esbuild/pull/1310))

    CSS identifiers are allowed to start with a `-` character if (approximately) the following character is a letter, an escape sequence, a non-ASCII character, the character `_`, or another `-` character. This check is used in certain places when printing CSS to determine whether a token is a valid identifier and can be printed as such or whether it's an invalid identifier and needs to be quoted as a string. One such place is in attribute selectors such as `[a*=b]`.

    However, esbuild had a bug where a single `-` character was incorrectly treated as a valid identifier in this case. This is because the end of string became U+FFFD (the Unicode replacement character) which is a non-ASCII character and a valid name-start code point. With this release a single `-` character is no longer treated as a valid identifier. This fix was contributed by [@lbwa](https://github.com/lbwa).

## 0.12.2

* Fix various code generation and minification issues ([#1305](https://github.com/evanw/esbuild/issues/1305))

    This release fixes the following issues, which were all identified by running esbuild against the latest UglifyJS test suite:

    * The `in` operator is now surrounded parentheses inside arrow function expression bodies inside `for` loop initializers:

        ```js
        // Original code
        for ((x => y in z); 0; ) ;

        // Old output
        for ((x) => y in z; 0; ) ;

        // New output
        for ((x) => (y in z); 0; ) ;
        ```

        Without this, the `in` operator would cause the for loop to be considered a for-in loop instead.

    * The statement `return undefined;` is no longer minified to `return;` inside async generator functions:

        ```js
        // Original code
        return undefined;

        // Old output
        return;

        // New output
        return void 0;
        ```

        Using `return undefined;` inside an async generator function has the same effect as `return await undefined;` which schedules a task in the event loop and runs code in a different order than just `return;`, which doesn't hide an implicit `await` expression.

    * Property access expressions are no longer inlined in template tag position:

        ```js
        // Original code
        (null, a.b)``, (null, a[b])``;

        // Old output
        a.b``, a[b]``;

        // New output
        (0, a.b)``, (0, a[b])``;
        ```

        The expression `` a.b`c` `` is different than the expression `` (0, a.b)`c` ``. The first calls the function `a.b` with `a` as the value for `this` but the second calls the function `a.b` with the default value for `this` (the global object in non-strict mode or `undefined` in strict mode).

    * Verbatim `__proto__` properties inside object spread are no longer inlined when minifying:

        ```js
        // Original code
        x = { ...{ __proto__: { y: true } } }.y;

        // Old output
        x = { __proto__: { y: !0 } }.y;

        // New output
        x = { ...{ __proto__: { y: !0 } } }.y;
        ```

        A verbatim (i.e. non-computed non-method) property called `__proto__` inside an object literal actually sets the prototype of the surrounding object literal. It does not add an "own property" called `__proto__` to that object literal, so inlining it into the parent object literal would be incorrect. The presence of a `__proto__` property now stops esbuild from applying the object spread inlining optimization when minifying.

    * The value of `this` has now been fixed for lowered private class members that are used as template tags:

        ```js
        // Original code
        x = (new (class {
          a = this.#c``;
          b = 1;
          #c() { return this }
        })).a.b;

        // Old output
        var _c, c_fn, _a;
        x = new (_a = class {
          constructor() {
            __privateAdd(this, _c);
            __publicField(this, "a", __privateMethod(this, _c, c_fn)``);
            __publicField(this, "b", 1);
          }
        }, _c = new WeakSet(), c_fn = function() {
          return this;
        }, _a)().a.b;

        // New output
        var _c, c_fn, _a;
        x = new (_a = class {
          constructor() {
            __privateAdd(this, _c);
            __publicField(this, "a", __privateMethod(this, _c, c_fn).bind(this)``);
            __publicField(this, "b", 1);
          }
        }, _c = new WeakSet(), c_fn = function() {
          return this;
        }, _a)().a.b;
        ```

        The value of `this` here should be an instance of the class because the template tag is a property access expression. However, it was previously the default value (the global object in non-strict mode or `undefined` in strict mode) instead due to the private member transformation, which is incorrect.

    * Invalid escape sequences are now allowed in tagged template literals

        This implements the template literal revision feature: https://github.com/tc39/proposal-template-literal-revision. It allows you to process tagged template literals using custom semantics that don't follow JavaScript escape sequence rules without causing a syntax error:

        ```js
        console.log((x => x.raw)`invalid \unicode escape sequence`)
        ```

## 0.12.1

* Add the ability to preserve JSX syntax ([#735](https://github.com/evanw/esbuild/issues/735))

    You can now pass `--jsx=preserve` to esbuild to prevent JSX from being transformed into JS. Instead, JSX syntax in all input files is preserved throughout the pipeline and is printed as JSX syntax in the generated output files. Note that this means the output files are no longer valid JavaScript code if you enable this setting. This feature is intended to be used when you want to transform the JSX syntax in esbuild's output files by another tool after bundling, usually one with a different JSX-to-JS transform than the one esbuild implements.

* Update the list of built-in node modules ([#1294](https://github.com/evanw/esbuild/issues/1294))

    The list of built-in modules that come with node was outdated, so it has been updated. It now includes new modules such as `wasi` and `_http_common`. Modules in this list are automatically marked as external when esbuild's platform is configured to `node`.

## 0.12.0

**This release contains backwards-incompatible changes.** Since esbuild is before version 1.0.0, these changes have been released as a new minor version to reflect this (as [recommended by npm](https://docs.npmjs.com/cli/v6/using-npm/semver/)). You should either be pinning the exact version of `esbuild` in your `package.json` file or be using a version range syntax that only accepts patch upgrades such as `~0.11.0`. See the documentation about [semver](https://docs.npmjs.com/cli/v6/using-npm/semver/) for more information.

The breaking changes in this release relate to CSS import order and also build scenarios where both the `inject` and `define` API options are used (see below for details). These breaking changes are as follows:

* Fix bundled CSS import order ([#465](https://github.com/evanw/esbuild/issues/465))

    JS and CSS use different import ordering algorithms. In JS, importing a file that has already been imported is a no-op but in CSS, importing a file that has already been imported re-imports the file. A simple way to imagine this is to view each `@import` rule in CSS as being replaced by the contents of that file similar to `#include` in C/C++. However, this is incorrect in the case of `@import` cycles because it would cause infinite expansion. A more accurate way to imagine this is that in CSS, a file is evaluated at the *last* `@import` location while in JS, a file is evaluated at the *first* `import` location.

    Previously esbuild followed JS import order rules for CSS but now esbuild will follow CSS import order rules. This is a breaking change because it means your CSS may behave differently when bundled. Note that CSS import order rules are somewhat unintuitive because evaluation order matters. In CSS, using `@import` multiple times can end up unintentionally erasing overriding styles. For example, consider the following files:

    ```css
    /* entry.css */
    @import "./color.css";
    @import "./background.css";
    ```

    ```css
    /* color.css */
    @import "./reset.css";
    body {
      color: white;
    }
    ```

    ```css
    /* background.css */
    @import "./reset.css";
    body {
      background: black;
    }
    ```

    ```css
    /* reset.css */
    body {
      background: white;
      color: black;
    }
    ```

    Because of how CSS import order works, `entry.css` will now be bundled like this:

    ```css
    /* color.css */
    body {
      color: white;
    }

    /* reset.css */
    body {
      background: white;
      color: black;
    }

    /* background.css */
    body {
      background: black;
    }
    ```

    This means the body will unintuitively be all black! The file `reset.css` is evaluated at the location of the *last* `@import` instead of the *first* `@import`. The fix for this case is to remove the nested imports of `reset.css` and to import `reset.css` exactly once at the top of `entry.css`.

    Note that while the evaluation order of external CSS imports is preserved with respect to other external CSS imports, the evaluation order of external CSS imports is *not* preserved with respect to other internal CSS imports. All external CSS imports are "hoisted" to the top of the bundle. The alternative would be to generate many smaller chunks which is usually undesirable. So in this case esbuild's CSS bundling behavior will not match the browser.

* Fix bundled CSS when using JS code splitting ([#608](https://github.com/evanw/esbuild/issues/608))

    Previously esbuild generated incorrect CSS output when JS code splitting was enabled and the JS code being bundled imported CSS files. CSS code that was reachable via multiple JS entry points was split off into a shared CSS chunk, but that chunk was not actually imported anywhere so the shared CSS was missing. This happened because both CSS and JS code splitting were experimental features that are still in progress and weren't tested together.

    Now esbuild's CSS output should contain all reachable CSS code when JS code splitting is enabled. Note that this does *not* mean code splitting works for CSS files. Each CSS output file simply contains the transitive set of all CSS reachable from the JS entry point including through dynamic `import()` and `require()` expressions. Specifically, the bundler constructs a virtual CSS file for each JS entry point consisting only of `@import` rules for each CSS file imported into a JS file. These `@import` rules are constructed in JS source order, but then the bundler uses CSS import order from that point forward to bundle this virtual CSS file into the final CSS output file.

    This model makes the most sense when CSS files are imported into JS files via JS `import` statements. Importing CSS via `import()` and `require()` (either directly or transitively through multiple intermediate JS files) should still "work" in the sense that all reachable CSS should be included in the output, but in this case esbuild will pick an arbitrary (but consistent) import order. The import order may not match the order that the JS files are evaluated in because JS evaluation order of dynamic imports is only determined at run-time while CSS bundling happens at compile-time.

    It's possible to implement code splitting for CSS such that CSS code used between multiple entry points is shared. However, CSS lacks a mechanism for "lazily" importing code (i.e. disconnecting the import location with the evaluation location) so CSS code splitting could potentially need to generate a huge number of very small chunks to preserve import order. It's unclear if this would end up being a net win or not as far as browser download time. So sharing-based code splitting is currently not supported for CSS.

    It's theoretically possible to implement code splitting for CSS such that CSS from a dynamically-imported JS file (e.g. via `import()`) is placed into a separate chunk. However, due to how `@import` order works this would in theory end up re-evaluating all shared dependencies which could overwrite overloaded styles and unintentionally change the way the page is rendered. For example, constructing a single-page app architecture such that each page is JS-driven and can transition to other JS-driven pages via `import()` could end up with pages that look different depending on what order you visit them in. This is clearly undesirable. The simple way to address this is to just not support dynamic-import code splitting for CSS either.

* Change "define" to have higher priority than "inject" ([#660](https://github.com/evanw/esbuild/issues/660))

    The "define" and "inject" features are both ways of replacing certain expressions in your source code with other things expressions. Previously esbuild's behavior ran "inject" before "define", which could lead to some undesirable behavior. For example (from the `react` npm package):

    ```js
    if (process.env.NODE_ENV === 'production') {
      module.exports = require('./cjs/react.production.min.js');
    } else {
      module.exports = require('./cjs/react.development.js');
    }
    ```

    If you use "define" to replace `process.env.NODE_ENV` with `"production"` and "inject" to replace `process` with a shim that emulates node's process API, then `process` was previously replaced first and then `process.env.NODE_ENV` wasn't matched because `process` referred to the injected shim. This wasn't ideal because it means esbuild didn't detect the branch condition as a constant (since it doesn't know how the shim behaves at run-time) and bundled both the development and production versions of the package.

    With this release, esbuild will now run "define" before "inject". In the above example this means that `process.env.NODE_ENV` will now be replaced with `"production"`, the injected shim will not be included, and only the production version of the package will be bundled. This feature was contributed by [@rtsao](https://github.com/rtsao).

In addition to the breaking changes above, the following features are also included in this release:

* Add support for the `NO_COLOR` environment variable

    The CLI will now omit color if the `NO_COLOR` environment variable is present, which is an existing convention that is followed by some other software. See https://no-color.org/ for more information.

## 0.11.23

* Add a shim function for unbundled uses of `require` ([#1202](https://github.com/evanw/esbuild/issues/1202))

    Modules in CommonJS format automatically get three variables injected into their scope: `module`, `exports`, and `require`. These allow the code to import other modules and to export things from itself. The bundler automatically rewrites uses of `module` and `exports` to refer to the module's exports and certain uses of `require` to a helper function that loads the imported module.

    Not all uses of `require` can be converted though, and un-converted uses of `require` will end up in the output. This is problematic because `require` is only present at run-time if the output is run as a CommonJS module. Otherwise `require` is undefined, which means esbuild's behavior is inconsistent between compile-time and run-time. The `module` and `exports` variables are objects at compile-time and run-time but `require` is a function at compile-time and undefined at run-time. This causes code that checks for `typeof require` to have inconsistent behavior:

    ```js
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
      console.log('CommonJS detected')
    }
    ```

    In the above example, ideally `CommonJS detected` would always be printed since the code is being bundled with a CommonJS-aware bundler. To fix this, esbuild will now substitute references to `require` with a stub `__require` function when bundling if the output format is something other than CommonJS. This should ensure that `require` is now consistent between compile-time and run-time. When bundled, code that uses unbundled references to `require` will now look something like this:

    ```js
    var __require = (x) => {
      if (typeof require !== "undefined")
        return require(x);
      throw new Error('Dynamic require of "' + x + '" is not supported');
    };

    var __commonJS = (cb, mod) => () => (mod || cb((mod = {exports: {}}).exports, mod), mod.exports);

    var require_example = __commonJS((exports, module) => {
      if (typeof __require === "function" && typeof exports === "object" && typeof module === "object") {
        console.log("CommonJS detected");
      }
    });

    require_example();
    ```

* Fix incorrect caching of internal helper function library ([#1292](https://github.com/evanw/esbuild/issues/1292))

    This release fixes a bug where running esbuild multiple times with different configurations sometimes resulted in code that would crash at run-time. The bug was introduced in version 0.11.19 and happened because esbuild's internal helper function library is parsed once and cached per configuration, but the new profiler name option was accidentally not included in the cache key. This option is now included in the cache key so this bug should now be fixed.

* Minor performance improvements

    This release contains some small performance improvements to offset an earlier minor performance regression due to the addition of certain features such as hashing for entry point files. The benchmark times on the esbuild website should now be accurate again (versions of esbuild after the regression but before this release were slightly slower than the benchmark).

## 0.11.22

* Add support for the "import assertions" proposal

    This is new JavaScript syntax that was shipped in Chrome 91. It looks like this:

    ```js
    import './foo.json' assert { type: 'json' }
    import('./bar.json', { assert: { type: 'json' } })
    ```

    On the web, the content type for a given URL is determined by the `Content-Type` HTTP header instead of the file extension. So adding support for importing non-JS content types such as JSON to the web could cause [security issues](https://github.com/WICG/webcomponents/issues/839) since importing JSON from an untrusted source is safe while importing JS from an untrusted source is not.

    Import assertions are a new feature to address this security concern and unblock non-JS content types on the web. They cause the import to fail if the `Content-Type` header doesn't match the expected value. This prevents security issues for data-oriented content types such as JSON since it guarantees that data-oriented content will never accidentally be evaluated as code instead of data. More information about the proposal is available here: https://github.com/tc39/proposal-import-assertions.

    This release includes support for parsing and printing import assertions. They will be printed if the configured target environment supports them (currently only in `esnext` and `chrome91`), otherwise they will be omitted. If they aren't supported in the configured target environment and it's not possible to omit them, which is the case for certain dynamic `import()` expressions, then using them is a syntax error. Import assertions are otherwise unused by the bundler.

* Forbid the token sequence `for ( async of` when not followed by `=>`

    This follows a recently-fixed ambiguity in the JavaScript specification, which you can read about here: https://github.com/tc39/ecma262/pull/2256. Prior to this change in the specification, it was ambiguous whether this token sequence should be parsed as `for ( async of =>` or `for ( async of ;`. V8 and esbuild expected `=>` after `for ( async of` while SpiderMonkey and JavaScriptCore did something else.

    The ambiguity has been removed and the token sequence `for ( async of` is now forbidden by the specification when not followed by `=>`, so esbuild now forbids this as well. Note that the token sequence `for await (async of` is still allowed even when not followed by `=>`. Code such as `for ((async) of []) ;` is still allowed and will now be printed with parentheses to avoid the grammar ambiguity.

* Restrict `super` property access to inside of methods

    You can now only use `super.x` and `super[x]` expressions inside of methods. Previously these expressions were incorrectly allowed everywhere. This means esbuild now follows the JavaScript language specification more closely.

## 0.11.21

* TypeScript `override` for parameter properties ([#1262](https://github.com/evanw/esbuild/pull/1262))

    You can now use the `override` keyword instead of or in addition to the `public`, `private`, `protected`, and `readonly` keywords for declaring a TypeScript parameter property:

    ```ts
    class Derived extends Base {
      constructor(override field: any) {
      }
    }
    ```

    This feature was [recently added to the TypeScript compiler](https://github.com/microsoft/TypeScript/pull/43831) and will presumably be in an upcoming version of the TypeScript language. Support for this feature in esbuild was contributed by [@g-plane](https://github.com/g-plane).

* Fix duplicate export errors due to TypeScript import-equals statements ([#1283](https://github.com/evanw/esbuild/issues/1283))

    TypeScript has a special import-equals statement that is not part of JavaScript. It looks like this:

    ```ts
    import a = foo.a
    import b = a.b
    import c = b.c

    import x = foo.x
    import y = x.y
    import z = y.z

    export let bar = c
    ```

    Each import can be a type or a value and type-only imports need to be eliminated when converting this code to JavaScript, since types do not exist at run-time. The TypeScript compiler generates the following JavaScript code for this example:

    ```js
    var a = foo.a;
    var b = a.b;
    var c = b.c;
    export let bar = c;
    ```

    The `x`, `y`, and `z` import statements are eliminated in esbuild by iterating over imports and exports multiple times and continuing to remove unused TypeScript import-equals statements until none are left. The first pass removes `z` and marks `y` as unused, the second pass removes `y` and marks `x` as unused, and the third pass removes `x`.

    However, this had the side effect of making esbuild incorrectly think that a single export is exported twice (because it's processed more than once). This release fixes that bug by only iterating multiple times over imports, not exports. There should no longer be duplicate export errors for this case.

* Add support for type-only TypeScript import-equals statements ([#1285](https://github.com/evanw/esbuild/pull/1285))

    This adds support for the following new TypeScript syntax that was added in version 4.2:

    ```ts
    import type React = require('react')
    ```

    Unlike `import React = require('react')`, this statement is a type declaration instead of a value declaration and should be omitted from the generated code. See [microsoft/TypeScript#41573](https://github.com/microsoft/TypeScript/pull/41573) for details. This feature was contributed by [@g-plane](https://github.com/g-plane).

## 0.11.20

* Omit warning about duplicate JSON keys from inside `node_modules` ([#1254](https://github.com/evanw/esbuild/issues/1254))

    This release no longer warns about duplicate keys inside `package.json` files inside `node_modules`. There are packages like this that are published to npm, and this warning is unactionable. Now esbuild will only issue this warning outside of `node_modules` directories.

* Add CSS minification for `box-shadow` values

    The CSS `box-shadow` property is now minified when `--mangle-syntax` is enabled. This includes trimming length values and minifying color representations.

* Fix object spread transform for non-spread getters ([#1259](https://github.com/evanw/esbuild/issues/1259))

    When transforming an object literal containing object spread (the `...` syntax), properties inside the spread should be evaluated but properties outside the spread should not be evaluated. Previously esbuild's object spread transform incorrectly evaluated properties in both cases. Consider this example:

    ```js
    var obj = {
      ...{ get x() { console.log(1) } },
      get y() { console.log(3) },
    }
    console.log(2)
    obj.y
    ```

    This should print out `1 2 3` because the non-spread getter should not be evaluated. Instead, esbuild was incorrectly transforming this into code that printed `1 3 2`. This issue should now be fixed with this release.

* Prevent private class members from being added more than once

    This fixes a corner case with the private class member implementation. Constructors in JavaScript can return an object other than `this`, so private class members can actually be added to objects other than `this`. This can be abused to attach completely private metadata to other objects:

    ```js
    class Base {
      constructor(x) {
        return x
      }
    }
    class Derived extends Base {
      #y
      static is(z) {
        return #y in z
      }
    }
    const foo = {}
    new Derived(foo)
    console.log(Derived.is(foo)) // true
    ```

    This already worked in code transformed by esbuild for older browsers. However, calling `new Derived(foo)` multiple times in the above code was incorrectly allowed. This should not be allowed because it would mean that the private field `#y` would be re-declared. This is no longer allowed starting from this release.

## 0.11.19

* Allow esbuild to be restarted in Deno ([#1238](https://github.com/evanw/esbuild/pull/1238))

    The esbuild API for [Deno](https://deno.land) has an extra function called `stop()` that doesn't exist in esbuild's API for node. This is because Deno doesn't provide a way to stop esbuild automatically, so calling `stop()` is required to allow Deno to exit. However, once stopped the esbuild API could not be restarted.

    With this release, you can now continue to use esbuild after calling `stop()`. This will restart esbuild's API and means that you will need to call `stop()` again for Deno to be able to exit. This feature was contributed by [@lucacasonato](https://github.com/lucacasonato).

* Fix code splitting edge case ([#1252](https://github.com/evanw/esbuild/issues/1252))

    This release fixes an edge case where bundling with code splitting enabled generated incorrect code if multiple ESM entry points re-exported the same re-exported symbol from a CommonJS file. In this case the cross-chunk symbol dependency should be the variable that holds the return value from the `require()` call instead of the original ESM named `import` clause item. When this bug occurred, the generated ESM code contained an export and import for a symbol that didn't exist, which caused a module initialization error. This case should now work correctly.

* Fix code generation with `declare` class fields ([#1242](https://github.com/evanw/esbuild/issues/1242))

    This fixes a bug with TypeScript code that uses `declare` on a class field and your `tsconfig.json` file has `"useDefineForClassFields": true`. Fields marked as `declare` should not be defined in the generated code, but they were incorrectly being declared as `undefined`. These fields are now correctly omitted from the generated code.

* Annotate module wrapper functions in debug builds ([#1236](https://github.com/evanw/esbuild/pull/1236))

    Sometimes esbuild needs to wrap certain modules in a function when bundling. This is done both for lazy evaluation and for CommonJS modules that use a top-level `return` statement. Previously these functions were all anonymous, so stack traces for errors thrown during initialization looked like this:

    ```
    Error: Electron failed to install correctly, please delete node_modules/electron and try installing again
        at getElectronPath (out.js:16:13)
        at out.js:19:21
        at out.js:1:45
        at out.js:24:3
        at out.js:1:45
        at out.js:29:3
        at out.js:1:45
        at Object.<anonymous> (out.js:33:1)
    ```

    This release adds names to these anonymous functions when minification is disabled. The above stack trace now looks like this:

    ```
    Error: Electron failed to install correctly, please delete node_modules/electron and try installing again
        at getElectronPath (out.js:19:15)
        at node_modules/electron/index.js (out.js:22:23)
        at __require (out.js:2:44)
        at src/base/window.js (out.js:29:5)
        at __require (out.js:2:44)
        at src/base/kiosk.js (out.js:36:5)
        at __require (out.js:2:44)
        at Object.<anonymous> (out.js:41:1)
    ```

    This is similar to Webpack's development-mode behavior:

    ```
    Error: Electron failed to install correctly, please delete node_modules/electron and try installing again
        at getElectronPath (out.js:23:11)
        at Object../node_modules/electron/index.js (out.js:27:18)
        at __webpack_require__ (out.js:96:41)
        at Object../src/base/window.js (out.js:49:1)
        at __webpack_require__ (out.js:96:41)
        at Object../src/base/kiosk.js (out.js:38:1)
        at __webpack_require__ (out.js:96:41)
        at out.js:109:1
        at out.js:111:3
        at Object.<anonymous> (out.js:113:12)
    ```

    These descriptive function names will additionally be available when using a profiler such as the one included in the "Performance" tab in Chrome Developer Tools. Previously all functions were named `(anonymous)` which made it difficult to investigate performance issues during bundle initialization.

* Add CSS minification for more cases

    The following CSS minification cases are now supported:

    * The CSS `margin` property family is now minified including combining the `margin-top`, `margin-right`, `margin-bottom`, and `margin-left` properties into a single `margin` property.

    * The CSS `padding` property family is now minified including combining the `padding-top`, `padding-right`, `padding-bottom`, and `padding-left` properties into a single `padding` property.

    * The CSS `border-radius` property family is now minified including combining the `border-top-left-radius`, `border-top-right-radius`, `border-bottom-right-radius`, and `border-bottom-left-radius` properties into a single `border-radius` property.

    * The four special pseudo-elements `::before`, `::after`, `::first-line`, and `::first-letter` are allowed to be parsed with one `:` for legacy reasons, so the `::` is now converted to `:` for these pseudo-elements.

    * Duplicate CSS rules are now deduplicated. Only the last rule is kept, since that's the only one that has any effect. This applies for both top-level rules and nested rules.

* Preserve quotes around properties when minification is disabled ([#1251](https://github.com/evanw/esbuild/issues/1251))

    Previously the parser did not distinguish between unquoted and quoted properties, since there is no semantic difference. However, some tools such as [Google Closure Compiler](https://developers.google.com/closure/compiler) with "advanced mode" enabled attach their own semantic meaning to quoted properties, and processing code intended for Google Closure Compiler's advanced mode with esbuild was changing those semantics. The distinction between unquoted and quoted properties is now made in the following cases:

    ```js
    import * as ns from 'external-pkg'
    console.log([
      { x: 1, 'y': 2 },
      { x() {}, 'y'() {} },
      class { x = 1; 'y' = 2 },
      class { x() {}; 'y'() {} },
      { x: x, 'y': y } = z,
      [x.x, y['y']],
      [ns.x, ns['y']],
    ])
    ```

    The parser will now preserve the quoted properties in these cases as long as `--minify-syntax` is not enabled. This does not mean that esbuild is officially supporting Google Closure Compiler's advanced mode, just that quoted properties are now preserved when the AST is pretty-printed. Google Closure Compiler's advanced mode accepts a language that shares syntax with JavaScript but that deviates from JavaScript semantics and there could potentially be other situations where preprocessing code intended for Google Closure Compiler's advanced mode with esbuild first causes it to break. If that happens, that is not a bug with esbuild.

## 0.11.18

* Add support for OpenBSD on x86-64 ([#1235](https://github.com/evanw/esbuild/issues/1235))

    Someone has asked for OpenBSD to be supported on x86-64. It should now be supported starting with this release.

* Fix an incorrect warning about top-level `this`

    This was introduced in the previous release, and happens when using a top-level `async` arrow function with a compilation target that doesn't support it. The reason is that doing this generates a shim that preserves the value of `this`. However, this warning message is confusing because there is not necessarily any `this` present in the source code. The warning message has been removed in this case. Now it should only show up if `this` is actually present in the source code.

## 0.11.17

* Fix building with a large `stdin` string with Deno ([#1219](https://github.com/evanw/esbuild/issues/1219))

    When I did the initial port of esbuild's node-based API to Deno, I didn't realize that Deno's `write(bytes)` function doesn't actually write the provided bytes. Instead it may only write some of those bytes and needs to be repeatedly called again until it writes everything. This meant that calling esbuild's Deno-based API could hang if the API request was large enough, which can happen in practice when using the `stdin` string feature. The `write` API is now called in a loop so these hangs in Deno should now be fixed.

* Add a warning about replacing `this` with `undefined` in ESM code ([#1225](https://github.com/evanw/esbuild/issues/1225))

    There is existing JavaScript code that sometimes references top-level `this` as a way to access the global scope. However, top-level `this` is actually specified to be `undefined` inside of ECMAScript module code, which makes referencing top-level `this` inside ESM code useless. This issue can come up when the existing JavaScript code is adapted for ESM by adding `import` and/or `export`. All top-level references to `this` are replaced with `undefined` when bundling to make sure ECMAScript module behavior is emulated correctly regardless of the environment in which the resulting code is run.

    With this release, esbuild will now warn about this when bundling:

    ```
     > example.mjs:1:61: warning: Top-level "this" will be replaced with undefined since this file is an ECMAScript module
        1 │ export let Array = (typeof window !== 'undefined' ? window : this).Array
          ╵                                                              ~~~~
       example.mjs:1:0: note: This file is considered an ECMAScript module because of the "export" keyword here
        1 │ export let Array = (typeof window !== 'undefined' ? window : this).Array
          ╵ ~~~~~~
    ```

    This warning is not unique to esbuild. Rollup also already has a similar warning:

    ```
    (!) `this` has been rewritten to `undefined`
    https://rollupjs.org/guide/en/#error-this-is-undefined
    example.mjs
    1: export let Array = (typeof window !== 'undefined' ? window : this).Array
                                                                    ^
    ```

* Allow a string literal as a JSX fragment ([#1217](https://github.com/evanw/esbuild/issues/1217))

    TypeScript's JSX implementation allows you to configure a custom JSX factory and a custom JSX fragment, but requires that they are both valid JavaScript identifier member expression chains. Since esbuild's JSX implementation is based on TypeScript, esbuild has the same requirement. So `React.createElement` is a valid JSX factory value but `['React', 'createElement']` is not.

    However, the [Mithril](https://mithril.js.org/jsx.html) framework has decided to use `"["` as a JSX fragment, which is not a valid JavaScript identifier member expression chain. This meant that using Mithril with esbuild required a workaround. In this release, esbuild now lets you use a string literal as a custom JSX fragment. It should now be easier to use esbuild's JSX implementation with libraries such as Mithril.

* Fix `metafile` in `onEnd` with `watch` mode enabled ([#1186](https://github.com/evanw/esbuild/issues/1186))

    This release fixes a bug where the `metafile` property was incorrectly undefined inside plugin `onEnd` callbacks if `watch` mode is enabled for all builds after the first build. The `metafile` property was accidentally being set after calling `onEnd` instead of before.

## 0.11.16

* Fix TypeScript `enum` edge case ([#1198](https://github.com/evanw/esbuild/issues/1198))

    In TypeScript, you can reference the inner closure variable in an `enum` within the inner closure by name:

    ```ts
    enum A { B = A }
    ```

    The TypeScript compiler generates the following code for this case:

    ```ts
    var A;
    (function (A) {
      A[A["B"] = A] = "B";
    })(A || (A = {}));
    ```

    However, TypeScript also lets you declare an `enum` value with the same name as the inner closure variable. In that case, the value "shadows" the declaration of the inner closure variable:

    ```ts
    enum A { A = 1, B = A }
    ```

    The TypeScript compiler generates the following code for this case:

    ```ts
    var A;
    (function (A) {
      A[A["A"] = 1] = "A";
      A[A["B"] = 1] = "B";
    })(A || (A = {}));
    ```

    Previously esbuild reported a duplicate variable declaration error in the second case due to the collision between the `enum` value and the inner closure variable with the same name. With this release, the shadowing is now handled correctly.

* Parse the `@-moz-document` CSS rule ([#1203](https://github.com/evanw/esbuild/issues/1203))

    This feature has been removed from the web because it's actively harmful, at least according to [this discussion](https://bugzilla.mozilla.org/show_bug.cgi?id=1035091). However, there is one exception where `@-moz-document url-prefix() {` is accepted by Firefox to basically be an "if Firefox" conditional rule. Because of this, esbuild now parses the `@-moz-document` CSS rule. This should result in better pretty-printing and minification and no more warning when this rule is used.

* Fix syntax error in TypeScript-specific speculative arrow function parsing ([#1211](https://github.com/evanw/esbuild/issues/1211))

    Because of grammar ambiguities, expressions that start with a parenthesis are parsed using what's called a "cover grammar" that is a super-position of both a parenthesized expression and an arrow function parameter list. In JavaScript, the cover grammar is unambiguously an arrow function if and only if the following token is a `=>` token.

    But in TypeScript, the expression is still ambiguously a parenthesized expression or an arrow function if the following token is a `:` since it may be the second half of the `?:` operator or a return type annotation. This requires speculatively attempting to reduce the cover grammar to an arrow function parameter list.

    However, when doing this esbuild eagerly reported an error if a default argument was encountered and the target is `es5` (esbuild doesn't support lowering default arguments to ES5). This is problematic in the following TypeScript code since the parenthesized code turns out to not be an arrow function parameter list:

    ```ts
    function foo(check, hover) {
      return check ? (hover = 2, bar) : baz();
    }
    ```

    Previously this code incorrectly generated an error since `hover = 2` was incorrectly eagerly validated as a default argument. With this release, the reporting of the default argument error when targeting `es5` is now done lazily and only when it's determined that the parenthesized code should actually be interpreted as an arrow function parameter list.

* Further changes to the behavior of the `browser` field ([#1209](https://github.com/evanw/esbuild/issues/1209))

    This release includes some changes to how the `browser` field in `package.json` is interpreted to better match how Browserify, Webpack, Parcel, and Rollup behave. The interpretation of this map in esbuild is intended to be applied if and only if it's applied by any one of these bundlers. However, there were some cases where esbuild applied the mapping and none of the other bundlers did, which could lead to build failures. These cases have been added to my [growing list of `browser` field test cases](https://github.com/evanw/package-json-browser-tests) and esbuild's behavior should now be consistent with other bundlers again.

* Avoid placing a `super()` call inside a `return` statement ([#1208](https://github.com/evanw/esbuild/issues/1208))

    When minification is enabled, an expression followed by a return statement (e.g. `a(); return b`) is merged into a single statement (e.g. `return a(), b`). This is done because it sometimes results in smaller code. If the return statement is the only statement in a block and the block is in a single-statement context, the block can be removed which saves a few characters.

    Previously esbuild applied this rule to calls to `super()` inside of constructors. Doing that broke esbuild's class lowering transform that tries to insert class field initializers after the `super()` call. This transform isn't robust and only scans the top-level statement list inside the constructor, so inserting the `super()` call inside of the `return` statement means class field initializers were inserted before the `super()` call instead of after. This could lead to run-time crashes due to initialization failure.

    With this release, top-level calls to `super()` will no longer be placed inside `return` statements (in addition to various other kinds of statements such as `throw`, which are now also handled). This should avoid class field initializers being inserted before the `super()` call.

* Fix a bug with `onEnd` and watch mode ([#1186](https://github.com/evanw/esbuild/issues/1186))

    This release fixes a bug where `onEnd` plugin callbacks only worked with watch mode when an `onRebuild` watch mode callback was present. Now `onEnd` callbacks should fire even if there is no `onRebuild` callback.

* Fix an edge case with minified export names and code splitting ([#1201](https://github.com/evanw/esbuild/issues/1201))

    The names of symbols imported from other chunks were previously not considered for renaming during minified name assignment. This could cause a syntax error due to a name collision when two symbols have the same original name. This was just an oversight and has been fixed, so symbols imported from other chunks should now be renamed when minification is enabled.

* Provide a friendly error message when you forget `async` ([#1216](https://github.com/evanw/esbuild/issues/1216))

    If the parser hits a parse error inside a non-asynchronous function or arrow expression and the previous token is `await`, esbuild will now report a friendly error about a missing `async` keyword instead of reporting the parse error. This behavior matches other JavaScript parsers including TypeScript, Babel, and V8.

    The previous error looked like this:

    ```
     > test.ts:2:8: error: Expected ";" but found "f"
        2 │   await f();
          ╵         ^
    ```

    The error now looks like this:

    ```
     > example.js:2:2: error: "await" can only be used inside an "async" function
        2 │   await f();
          ╵   ~~~~~
       example.js:1:0: note: Consider adding the "async" keyword here
        1 │ function f() {
          │ ^
          ╵ async
    ```

## 0.11.15

* Provide options for how to handle legal comments ([#919](https://github.com/evanw/esbuild/issues/919))

    A "legal comment" is considered to be any comment that contains `@license` or `@preserve` or that starts with `//!` or `/*!`. These comments are preserved in output files by esbuild since that follows the intent of the original authors of the code.

    However, some people want to remove the automatically-generated license information before they distribute their code. To facilitate this, esbuild now provides several options for how to handle legal comments (via `--legal-comments=` in the CLI and `legalComments` in the JS API):

    * `none`: Do not preserve any legal comments
    * `inline`: Preserve all statement-level legal comments
    * `eof`: Move all statement-level legal comments to the end of the file
    * `linked`: Move all statement-level legal comments to a `.LEGAL.txt` file and link to them with a comment
    * `external`: Move all statement-level legal comments to a `.LEGAL.txt` file but to not link to them

    The default behavior is `eof` when bundling and `inline` otherwise.

* Add `onStart` and `onEnd` callbacks to the plugin API

    Plugins can now register callbacks to run when a build is started and ended:

    ```js
    const result = await esbuild.build({
      ...
      incremental: true,
      plugins: [{
        name: 'example',
        setup(build) {
          build.onStart(() => console.log('build started'))
          build.onEnd(result => console.log('build ended', result))
        },
      }],
    })
    await result.rebuild()
    ```

    One benefit of `onStart` and `onEnd` is that they are run for all builds including rebuilds (relevant for incremental mode, watch mode, or serve mode), so they should be a good place to do work related to the build lifecycle.

    More details:

    * `build.onStart()`

        You should not use an `onStart` callback for initialization since it can be run multiple times. If you want to initialize something, just put your plugin initialization code directly inside the `setup` function instead.

        The `onStart` callback can be `async` and can return a promise. However, the build does not wait for the promise to be resolved before starting, so a slow `onStart` callback will not necessarily slow down the build. All `onStart` callbacks are also run concurrently, not consecutively. The returned promise is purely for error reporting, and matters when the `onStart` callback needs to do an asynchronous operation that may fail. If your plugin needs to wait for an asynchronous task in `onStart` to complete before any `onResolve` or `onLoad` callbacks are run, you will need to have your `onResolve` or `onLoad` callbacks block on that task from `onStart`.

        Note that `onStart` callbacks do not have the ability to mutate `build.initialOptions`. The initial options can only be modified within the `setup` function and are consumed once the `setup` function returns. All rebuilds use the same initial options so the initial options are never re-consumed, and modifications to `build.initialOptions` that are done within `onStart` are ignored.

    * `build.onEnd()`

        All `onEnd` callbacks are run in serial and each callback is given access to the final build result. It can modify the build result before returning and can delay the end of the build by returning a promise. If you want to be able to inspect the build graph, you should set `build.initialOptions.metafile = true` and the build graph will be returned as the `metafile` property on the build result object.

## 0.11.14

* Implement arbitrary module namespace identifiers

    This introduces new JavaScript syntax:

    ```js
    import {'🍕' as food} from 'file'
    export {food as '🧀'}
    ```

    [The proposal for this feature](https://github.com/bmeck/proposal-arbitrary-module-namespace-identifiers) appears to not be going through the regular TC39 process. It is being done as a subtle [direct pull request](https://github.com/tc39/ecma262/pull/2154) instead. It seems appropriate for esbuild to support this feature since it has been implemented in V8 and has now shipped in Chrome 90 and node 16.

    According to the proposal, this feature is intended to improve interop with non-JavaScript languages which use exports that aren't valid JavaScript identifiers such as `Foo::~Foo`. In particular, WebAssembly allows any valid UTF-8 string as to be used as an export alias.

    This feature was actually already partially possible in previous versions of JavaScript via the computed property syntax:

    ```js
    import * as ns from './file.json'
    console.log(ns['🍕'])
    ```

    However, doing this is very un-ergonomic and exporting something as an arbitrary name is impossible outside of `export * from`. So this proposal is designed to fully fill out the possibility matrix and make arbitrary alias names a proper first-class feature.

* Implement more accurate `sideEffects` behavior from Webpack ([#1184](https://github.com/evanw/esbuild/issues/1184))

    This release adds support for the implicit `**/` prefix that must be added to paths in the `sideEffects` array in `package.json` if the path does not contain `/`. Another way of saying this is if `package.json` contains a `sideEffects` array with a string that doesn't contain a `/` then it should be treated as a file name instead of a path. Previously esbuild treated all strings in this array as paths, which does not match how Webpack behaves. The result of this meant that esbuild could consider files to have no side effects while Webpack would consider the same files to have side effects. This bug should now be fixed.

## 0.11.13

* Implement ergonomic brand checks for private fields

    This introduces new JavaScript syntax:

    ```js
    class Foo {
      #field
      static isFoo(x) {
        return #foo in x // This is an "ergonomic brand check"
      }
    }
    assert(Foo.isFoo(new Foo))
    ```

    [The TC39 proposal for this feature](https://github.com/tc39/proposal-private-fields-in-in) is currently at stage 3 but has already been shipped in Chrome 91 and has also landed in Firefox. It seems reasonably inevitable given that it's already shipping and that it's a very simple feature, so it seems appropriate to add this feature to esbuild.

* Add the `--allow-overwrite` flag ([#1152](https://github.com/evanw/esbuild/issues/1152))

    This is a new flag that allows output files to overwrite input files. It's not enabled by default because doing so means overwriting your source code, which can lead to data loss if your code is not checked in. But supporting this makes certain workflows easier by avoiding the need for a temporary directory so doing this is now supported.

* Minify property accesses on object literals ([#1166](https://github.com/evanw/esbuild/issues/1166))

    The code `{a: {b: 1}}.a.b` will now be minified to `1`. This optimization is relatively complex and hard to do safely. Here are some tricky cases that are correctly handled:

    ```js
    var obj = {a: 1}
    assert({a: 1, a: 2}.a === 2)
    assert({a: 1, [String.fromCharCode(97)]: 2}.a === 2)
    assert({__proto__: obj}.a === 1)
    assert({__proto__: null}.a === undefined)
    assert({__proto__: null}.__proto__ === undefined)
    assert({a: function() { return this.b }, b: 1}.a() === 1)
    assert(({a: 1}.a = 2) === 2)
    assert(++{a: 1}.a === 2)
    assert.throws(() => { new ({ a() {} }.a) })
    ```

* Improve arrow function parsing edge cases

    There are now more situations where arrow expressions are not allowed. This improves esbuild's alignment with the JavaScript specification. Some examples of cases that were previously allowed but that are now no longer allowed:

    ```js
    1 + x => {}
    console.log(x || async y => {})
    class Foo extends async () => {} {}
    ```

## 0.11.12

* Fix a bug where `-0` and `0` were collapsed to the same value ([#1159](https://github.com/evanw/esbuild/issues/1159))

    Previously esbuild would collapse `Object.is(x ? 0 : -0, -0)` into `Object.is((x, 0), -0)` during minification, which is incorrect. The IEEE floating-point value `-0` is a different bit pattern than `0` and while they both compare equal, the difference is detectable in a few scenarios such as when using `Object.is()`. The minification transformation now checks for `-0` vs. `0` and no longer has this bug. This fix was contributed by [@rtsao](https://github.com/rtsao).

* Match the TypeScript compiler's output in a strange edge case ([#1158](https://github.com/evanw/esbuild/issues/1158))

    With this release, esbuild's TypeScript-to-JavaScript transform will no longer omit the namespace in this case:

    ```ts
    namespace Something {
      export declare function Print(a: string): void
    }
    Something.Print = function(a) {}
    ```

    This was previously omitted because TypeScript omits empty namespaces, and the namespace was considered empty because the `export declare function` statement isn't "real":

    ```ts
    namespace Something {
      export declare function Print(a: string): void
      setTimeout(() => Print('test'))
    }
    Something.Print = function(a) {}
    ```

    The TypeScript compiler compiles the above code into the following:

    ```js
    var Something;
    (function (Something) {
      setTimeout(() => Print('test'));
    })(Something || (Something = {}));
    Something.Print = function (a) { };
    ```

    Notice how `Something.Print` is never called, and what appears to be a reference to the `Print` symbol on the namespace `Something` is actually a reference to the global variable `Print`. I can only assume this is a bug in TypeScript, but it's important to replicate this behavior inside esbuild for TypeScript compatibility.

    The TypeScript-to-JavaScript transform in esbuild has been updated to match the TypeScript compiler's output in both of these cases.

* Separate the `debug` log level into `debug` and `verbose`

    You can now use `--log-level=debug` to get some additional information that might indicate some problems with your build, but that has a high-enough false-positive rate that it isn't appropriate for warnings, which are on by default. Enabling the `debug` log level no longer generates a torrent of debug information like it did in the past; that behavior is now reserved for the `verbose` log level instead.

## 0.11.11

* Initial support for Deno ([#936](https://github.com/evanw/esbuild/issues/936))

    You can now use esbuild in the [Deno](https://deno.land/) JavaScript environment via esbuild's official Deno package. Using it looks something like this:

    ```js
    import * as esbuild from 'https://deno.land/x/esbuild@v0.11.11/mod.js'
    const ts = 'let hasProcess: boolean = typeof process != "null"'
    const result = await esbuild.transform(ts, { loader: 'ts', logLevel: 'warning' })
    console.log('result:', result)
    esbuild.stop()
    ```

    It has basically the same API as esbuild's npm package with one addition: you need to call `stop()` when you're done because unlike node, Deno doesn't provide the necessary APIs to allow Deno to exit while esbuild's internal child process is still running.

* Remove warnings about non-bundled use of `require` and `import` ([#1153](https://github.com/evanw/esbuild/issues/1153), [#1142](https://github.com/evanw/esbuild/issues/1142), [#1132](https://github.com/evanw/esbuild/issues/1132), [#1045](https://github.com/evanw/esbuild/issues/1045), [#812](https://github.com/evanw/esbuild/issues/812), [#661](https://github.com/evanw/esbuild/issues/661), [#574](https://github.com/evanw/esbuild/issues/574), [#512](https://github.com/evanw/esbuild/issues/512), [#495](https://github.com/evanw/esbuild/issues/495), [#480](https://github.com/evanw/esbuild/issues/480), [#453](https://github.com/evanw/esbuild/issues/453), [#410](https://github.com/evanw/esbuild/issues/410), [#80](https://github.com/evanw/esbuild/issues/80))

    Previously esbuild had warnings when bundling about uses of `require` and `import` that are not of the form `require(<string literal>)` or `import(<string literal>)`. These warnings existed because the bundling process must be able to statically-analyze all dynamic imports to determine which files must be included. Here are some real-world examples of cases that esbuild doesn't statically analyze:

    * From [`mongoose`](https://www.npmjs.com/package/mongoose):

        ```js
        require('./driver').set(require(global.MONGOOSE_DRIVER_PATH));
        ```

    * From [`moment`](https://www.npmjs.com/package/moment):

        ```js
        aliasedRequire = require;
        aliasedRequire('./locale/' + name);
        ```

    * From [`logform`](https://www.npmjs.com/package/logform):

        ```js
        function exposeFormat(name) {
          Object.defineProperty(format, name, {
            get() { return require(`./${name}.js`); }
          });
        }
        exposeFormat('align');
        ```

    All of these dynamic imports will not be bundled (i.e. they will be left as-is) and will crash at run-time if they are evaluated. Some of these crashes are ok since the code paths may have error handling or the code paths may never be used. Other crashes are not ok because the crash will actually be hit.

    The warning from esbuild existed to let you know that esbuild is aware that it's generating a potentially broken bundle. If you discover that your bundle is broken, it's nice to have a warning from esbuild to point out where the problem is. And it was just a warning so the build process still finishes and successfully generates output files. If you didn't want to see the warning, it was easy to turn it off via `--log-level=error`.

    However, there have been quite a few complaints about this warning. Some people seem to not understand the difference between a warning and an error, and think the build has failed even though output files were generated. Other people do not want to see the warning but also do not want to enable `--log-level=error`.

    This release removes this warning for both `require` and `import`. Now when you try to bundle code with esbuild that contains dynamic imports not of the form `require(<string literal>)` or `import(<string literal>)`, esbuild will just silently generate a potentially broken bundle. This may affect people coming from other bundlers that support certain forms of dynamic imports that are not compatible with esbuild such as the [Webpack-specific dynamic `import()` with pattern matching](https://webpack.js.org/api/module-methods/#dynamic-expressions-in-import).

## 0.11.10

* Provide more information about `exports` map import failures if possible ([#1143](https://github.com/evanw/esbuild/issues/1143))

    Node has a new feature where you can [add an `exports` map to your `package.json` file](https://nodejs.org/api/packages.html#packages_package_entry_points) to control how external import paths map to the files in your package. You can change which paths map to which files as well as make it impossible to import certain files (i.e. the files are private).

    If path resolution fails due to an `exports` map and the failure is not related to import conditions, esbuild's current error message for this just says that the import isn't possible:

    ```
     > example.js:1:15: error: Could not resolve "vanillajs-datepicker/js/i18n/locales/ca" (mark it as external to exclude it from the bundle)
        1 │ import ca from 'vanillajs-datepicker/js/i18n/locales/ca'
          ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
       node_modules/vanillajs-datepicker/package.json:6:13: note: The path "./js/i18n/locales/ca" is not exported by package "vanillajs-datepicker"
        6 │   "exports": {
          ╵              ^
    ```

    This error message matches the error that node itself throws. However, the message could be improved in the case where someone is trying to import a file using its file system path and that path is actually exported by the package, just under a different export path. This case comes up a lot when using TypeScript because the TypeScript compiler (and therefore the Visual Studio Code IDE) [still doesn't support package `exports`](https://github.com/microsoft/TypeScript/issues/33079).

    With this release, esbuild will now do a reverse lookup of the file system path using the `exports` map to determine what the correct import path should be:

    ```
     > example.js:1:15: error: Could not resolve "vanillajs-datepicker/js/i18n/locales/ca" (mark it as external to exclude it from the bundle)
         1 │ import ca from 'vanillajs-datepicker/js/i18n/locales/ca'
           ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
       node_modules/vanillajs-datepicker/package.json:6:13: note: The path "./js/i18n/locales/ca" is not exported by package "vanillajs-datepicker"
         6 │   "exports": {
           ╵              ^
       node_modules/vanillajs-datepicker/package.json:12:19: note: The file "./js/i18n/locales/ca.js" is exported at path "./locales/ca"
        12 │     "./locales/*": "./js/i18n/locales/*.js",
           ╵                    ~~~~~~~~~~~~~~~~~~~~~~~~
       example.js:1:15: note: Import from "vanillajs-datepicker/locales/ca" to get the file "node_modules/vanillajs-datepicker/js/i18n/locales/ca.js"
         1 │ import ca from 'vanillajs-datepicker/js/i18n/locales/ca'
           │                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ╵                "vanillajs-datepicker/locales/ca"
    ```

    Hopefully this should enable people encountering this issue to fix the problem themselves.

## 0.11.9

* Fix escaping of non-BMP characters in property names ([#977](https://github.com/evanw/esbuild/issues/977))

    Property names in object literals do not have to be quoted if the property is a valid JavaScript identifier. This is defined as starting with a character in the `ID_Start` Unicode category and ending with zero or more characters in the `ID_Continue` Unicode category. However, esbuild had a bug where non-BMP characters (i.e. characters encoded using two UTF-16 code units instead of one) were always checked against `ID_Continue` instead of `ID_Start` because they included a code unit that wasn't at the start. This could result in invalid JavaScript being generated when using `--charset=utf8` because `ID_Continue` is a superset of `ID_Start` and contains some characters that are not valid at the start of an identifier. This bug has been fixed.

* Be maximally liberal in the interpretation of the `browser` field ([#740](https://github.com/evanw/esbuild/issues/740))

    The `browser` field in `package.json` is an informal convention followed by browser-specific bundlers that allows package authors to substitute certain node-specific import paths with alternative browser-specific import paths. It doesn't have a rigorous specification and the [canonical description](https://github.com/defunctzombie/package-browser-field-spec) of the feature doesn't include any tests. As a result, each bundler implements this feature differently. I have tried to create a [survey of how different bundlers interpret the `browser` field](https://github.com/evanw/package-json-browser-tests) and the results are very inconsistent.

    This release attempts to change esbuild to support the union of the behavior of all other bundlers. That way if people have the `browser` field working with some other bundler and they switch to esbuild, the `browser` field shouldn't ever suddenly stop working. This seemed like the most principled approach to take in this situation.

    The drawback of this approach is that it means the `browser` field may start working when switching to esbuild when it was previously not working. This could cause bugs, but I consider this to be a problem with the package (i.e. not using a more well-supported form of the `browser` field), not a problem with esbuild itself.

## 0.11.8

* Fix hash calculation for code splitting and dynamic imports ([#1076](https://github.com/evanw/esbuild/issues/1076))

    The hash included in the file name of each output file is intended to change if and only if anything relevant to the content of that output file changes. It includes:

    * The contents of the file with the paths of other output files omitted
    * The output path of the file the final hash omitted
    * Some information about the input files involved in that output file
    * The contents of the associated source map, if there is one
    * All of the information above for all transitive dependencies found by following `import` statements

    However, this didn't include dynamic `import()` expressions due to an oversight. With this release, dynamic `import()` expressions are now also counted as transitive dependencies. This fixes an issue where the content of an output file could change without its hash also changing. As a side effect of this change, dynamic imports inside output files of other output files are now listed in the metadata file if the `metafile` setting is enabled.

* Refactor the internal module graph representation

    This release changes a large amount of code relating to esbuild's internal module graph. The changes are mostly organizational and help consolidate most of the logic around maintaining various module graph invariants into a separate file where it's easier to audit. The Go language doesn't have great abstraction capabilities (e.g. no zero-cost iterators) so the enforcement of this new abstraction is unfortunately done by convention instead of by the compiler, and there is currently still some code that bypasses the abstraction. But it's better than it was before.

    Another relevant change was moving a number of special cases that happened during the tree shaking traversal into the graph itself instead. Previously there were quite a few implicit dependency rules that were checked in specific places, which was hard to follow. Encoding these special case constraints into the graph itself makes the problem easier to reason about and should hopefully make the code more regular and robust.

    Finally, this set of changes brings back full support for the `sideEffects` annotation in `package.json`. It was previously disabled when code splitting was active as a temporary measure due to the discovery of some bugs in that scenario. But I believe these bugs have been resolved now that tree shaking and code splitting are done in separate passes (see the previous release for more information).

## 0.11.7

* Fix incorrect chunk reference with code splitting, css, and dynamic imports ([#1125](https://github.com/evanw/esbuild/issues/1125))

    This release fixes a bug where when you use code splitting, CSS imports in JS, and dynamic imports all combined, the dynamic import incorrectly references the sibling CSS chunk for the dynamic import instead of the primary JS chunk. In this scenario the entry point file corresponds to two different output chunks (one for CSS and one for JS) and the wrong chunk was being picked. This bug has been fixed.

* Split apart tree shaking and code splitting ([#1123](https://github.com/evanw/esbuild/issues/1123))

    The original code splitting algorithm allowed for files to be split apart and for different parts of the same file to end up in different chunks based on which entry points needed which parts. This was done at the same time as tree shaking by essentially performing tree shaking multiple times, once per entry point, and tracking which entry points each file part is live in. Each file part that is live in at least one entry point was then assigned to a code splitting chunk with all of the other code that is live in the same set of entry points. This ensures that entry points only import code that they will use (i.e. no code will be downloaded by an entry point that is guaranteed to not be used).

    This file-splitting feature has been removed because it doesn't work well with the recently-added top-level await JavaScript syntax, which has complex evaluation order rules that operate at file boundaries. File parts now have a single boolean flag for whether they are live or not instead of a set of flags that track which entry points that part is reachable from (reachability is still tracked at the file level).

    However, this change appears to have introduced some subtly incorrect behavior with code splitting because there is now an implicit dependency in the import graph between adjacent parts within the same file even if the two parts are unrelated and don't reference each other. This is due to the fact each entry point that references one part pulls in the file (but not the whole file, only the parts that are live in at least one entry point). So liveness must be fully computed first before code splitting is computed.

    This release splits apart tree shaking and code splitting into two separate passes, which fixes certain cases where two generated code splitting chunks ended up each importing symbols from the other and causing a cycle. There should hopefully no longer be cycles in generated code splitting chunks.

* Make `this` work in static class fields in TypeScript files

    Currently `this` is mis-compiled in static fields in TypeScript files if the `useDefineForClassFields` setting in `tsconfig.json` is `false` (the default value):

    ```js
    class Foo {
      static foo = 123
      static bar = this.foo
    }
    console.log(Foo.bar)
    ```

    This is currently compiled into the code below, which is incorrect because it changes the value of `this` (it's supposed to refer to `Foo`):

    ```js
    class Foo {
    }
    Foo.foo = 123;
    Foo.bar = this.foo;
    console.log(Foo.bar);
    ```

    This was an intentionally unhandled case because the TypeScript compiler doesn't handle this either (esbuild's currently incorrect output matches the output from the TypeScript compiler, which is also currently incorrect). However, the TypeScript compiler might fix their output at some point in which case esbuild's behavior would become problematic.

    So this release now generates the correct output:

    ```js
    const _Foo = class {
    };
    let Foo = _Foo;
    Foo.foo = 123;
    Foo.bar = _Foo.foo;
    console.log(Foo.bar);
    ```

    Presumably the TypeScript compiler will be fixed to also generate something like this in the future. If you're wondering why esbuild generates the extra `_Foo` variable, it's defensive code to handle the possibility of the class being reassigned, since class declarations are not constants:

    ```js
    class Foo {
      static foo = 123
      static bar = () => Foo.foo
    }
    let bar = Foo.bar
    Foo = { foo: 321 }
    console.log(bar())
    ```

    We can't just move the initializer containing `Foo.foo` outside of the class body because in JavaScript, the class name is shadowed inside the class body by a special hidden constant that is equal to the class object. Even if the class is reassigned later, references to that shadowing symbol within the class body should still refer to the original class object.

* Various fixes for private class members ([#1131](https://github.com/evanw/esbuild/issues/1131))

    This release fixes multiple issues with esbuild's handling of the `#private` syntax. Previously there could be scenarios where references to `this.#private` could be moved outside of the class body, which would cause them to become invalid (since the `#private` name is only available within the class body). One such case is when TypeScript's `useDefineForClassFields` setting has the value `false` (which is the default value), which causes class field initializers to be replaced with assignment expressions to avoid using "define" semantics:

    ```js
    class Foo {
      static #foo = 123
      static bar = Foo.#foo
    }
    ```

    Previously this was turned into the following code, which is incorrect because `Foo.#foo` was moved outside of the class body:

    ```js
    class Foo {
      static #foo = 123;
    }
    Foo.bar = Foo.#foo;
    ```

    This is now handled by converting the private field syntax into normal JavaScript that emulates it with a `WeakMap` instead.

    This conversion is fairly conservative to make sure certain edge cases are covered, so this release may unfortunately convert more private fields than previous releases, even when the target is `esnext`. It should be possible to improve this transformation in future releases so that this happens less often while still preserving correctness.

## 0.11.6

* Fix an incorrect minification transformation ([#1121](https://github.com/evanw/esbuild/issues/1121))

    This release removes an incorrect substitution rule in esbuild's peephole optimizer, which is run when minification is enabled. The incorrect rule transformed `if(a && falsy)` into `if(a, falsy)` which is equivalent if `falsy` has no side effects (such as the literal `false`). However, the rule didn't check that the expression is side-effect free first which could result in miscompiled code. I have removed the rule instead of modifying it to check for the lack of side effects first because while the code is slightly smaller, it may also be more expensive at run-time which is undesirable. The size savings are also very insignificant.

* Change how `NODE_PATH` works to match node ([#1117](https://github.com/evanw/esbuild/issues/1117))

    Node searches for packages in nearby `node_modules` directories, but it also allows you to inject extra directories to search for packages in using the `NODE_PATH` environment variable. This is supported when using esbuild's CLI as well as via the `nodePaths` option when using esbuild's API.

    Node's module resolution algorithm is well-documented, and esbuild's path resolution is designed to follow it. The full algorithm is here: https://nodejs.org/api/modules.html#modules_all_together. However, it appears that the documented algorithm is incorrect with regard to `NODE_PATH`. The documentation says `NODE_PATH` directories should take precedence over `node_modules` directories, and so that's how esbuild worked. However, in practice node actually does it the other way around.

    Starting with this release, esbuild will now allow `node_modules` directories to take precedence over `NODE_PATH` directories. This is a deviation from the published algorithm.

* Provide a better error message for incorrectly-quoted JSX attributes ([#959](https://github.com/evanw/esbuild/issues/959), [#1115](https://github.com/evanw/esbuild/issues/1115))

    People sometimes try to use the output of `JSON.stringify()` as a JSX attribute when automatically-generating JSX code. Doing so is incorrect because JSX strings work like XML instead of like JS (since JSX is XML-in-JS). Specifically, using a backslash before a quote does not cause it to be escaped:

    ```jsx
    //     JSX ends the "content" attribute here and sets "content" to 'some so-called \\'
    //                                            v
    let button = <Button content="some so-called \"button text\"" />
    //                                                        ^
    //         There is no "=" after the JSX attribute "text", so we expect a ">"
    ```

    It's not just esbuild; Babel and TypeScript also treat this as a syntax error. All of these JSX parsers are just following [the JSX specification](https://facebook.github.io/jsx/). This has come up twice now so it could be worth having a dedicated error message. Previously esbuild had a generic syntax error like this:

    ```
     > example.jsx:1:58: error: Expected ">" but found "\\"
        1 │ let button = <Button content="some so-called \"button text\"" />
          ╵                                                           ^
    ```

    Now esbuild will provide more information if it detects this case:

    ```
     > example.jsx:1:58: error: Unexpected backslash in JSX element
        1 │ let button = <Button content="some so-called \"button text\"" />
          ╵                                                           ^
       example.jsx:1:45: note: Quoted JSX attributes use XML-style escapes instead of JavaScript-style escapes
        1 │ let button = <Button content="some so-called \"button text\"" />
          │                                              ~~
          ╵                                              &quot;
       example.jsx:1:29: note: Consider using a JavaScript string inside {...} instead of a quoted JSX attribute
        1 │ let button = <Button content="some so-called \"button text\"" />
          │                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          ╵                              {"some so-called \"button text\""}
    ```

## 0.11.5

* Add support for the `override` keyword in TypeScript 4.3 ([#1105](https://github.com/evanw/esbuild/pull/1105))

    The latest version of TypeScript (now in beta) adds a new keyword called `override` that can be used on class members. You can read more about this feature in [Microsoft's blog post about TypeScript 4.3](https://devblogs.microsoft.com/typescript/announcing-typescript-4-3-beta/#override-and-the-noimplicitoverride-flag). It looks like this:

    ```ts
    class SpecializedComponent extends SomeComponent {
      override show() {
        // ...
      }
    }
    ```

    With this release, esbuild will now ignore the `override` keyword when parsing TypeScript code instead of treating this keyword as a syntax error, which means esbuild can now support TypeScript 4.3 syntax. This change was contributed by [@g-plane](https://github.com/g-plane).

* Allow `async` plugin `setup` functions

    With this release, you can now return a promise from your plugin's `setup` function to delay the start of the build:

    ```js
    let slowInitPlugin = {
      name: 'slow-init',
      async setup(build) {
        // Delay the start of the build
        await new Promise(r => setTimeout(r, 1000))
      },
    }
    ```

    This is useful if your plugin needs to do something asynchronous before the build starts. For example, you may need some asynchronous information before modifying the `initialOptions` object, which must be done before the build starts for the modifications to take effect.

* Add some optimizations around hashing

    This release contains two optimizations to the hashes used in output file names:

    1. Hash generation now happens in parallel with other work, and other work only blocks on the hash computation if the hash ends up being needed (which is only if `[hash]` is included in `--entry-names=`, and potentially `--chunk-names=` if it's relevant). This is a performance improvement because `--entry-names=` does not include `[hash]` in the default case, so bundling time no longer always includes hashing time.

    2. The hashing algorithm has been changed from SHA1 to [xxHash](https://github.com/Cyan4973/xxHash) (specifically [this Go implementation](https://github.com/cespare/xxhash)) which means the hashing step is around 6x faster than before. Thanks to [@Jarred-Sumner](https://github.com/Jarred-Sumner) for the suggestion.

* Disable tree shaking annotations when code splitting is active ([#1070](https://github.com/evanw/esbuild/issues/1070), [#1081](https://github.com/evanw/esbuild/issues/1081))

    Support for [Webpack's `"sideEffects": false` annotation](https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free) in `package.json` is now disabled when code splitting is enabled and there is more than one entry point. This avoids a bug that could cause generated chunks to reference each other in some cases. Now all chunks generated by code splitting should be acyclic.

## 0.11.4

* Avoid name collisions with TypeScript helper functions ([#1102](https://github.com/evanw/esbuild/issues/1102))

    Helper functions are sometimes used when transforming newer JavaScript syntax for older browsers. For example, `let {x, ...y} = {z}` is transformed into `let _a = {z}, {x} = _a, y = __rest(_a, ["x"])` which uses the `__rest` helper function. Many of esbuild's transforms were modeled after the transforms in the TypeScript compiler, so many of the helper functions use the same names as TypeScript's helper functions.

    However, the TypeScript compiler doesn't avoid name collisions with existing identifiers in the transformed code. This means that post-processing esbuild's output with the TypeScript compiler (e.g. for lowering ES6 to ES5) will cause issues since TypeScript will fail to call its own helper functions: [microsoft/TypeScript#43296](https://github.com/microsoft/TypeScript/issues/43296). There is also a problem where TypeScript's `tslib` library overwrites globals with these names, which can overwrite esbuild's helper functions if code bundled with esbuild is run in the global scope.

    To avoid these problems, esbuild will now use different names for its helper functions.

* Fix a chunk hashing issue ([#1099](https://github.com/evanw/esbuild/issues/1099))

    Previously the chunk hashing algorithm skipped hashing entry point chunks when the `--entry-names=` setting doesn't contain `[hash]`, since the hash wasn't used in the file name. However, this is no longer correct with the change in version 0.11.0 that made dynamic entry point chunks use `--chunk-names=` instead of `--entry-names=` since `--chunk-names=` can still contain `[hash]`.

    With this release, chunk contents will now always be hashed regardless of the chunk type. This makes esbuild somewhat slower than before in the common case, but it fixes this correctness issue.

## 0.11.3

* Auto-define `process.env.NODE_ENV` when platform is set to `browser`

    All code in the React world has the requirement that the specific expression `process.env.NODE_ENV` must be replaced with a string at compile-time or your code will immediately crash at run-time. This is a common stumbling point for people when they start using esbuild with React. Previously bundling code with esbuild containing `process.env.NODE_ENV` without defining a string replacement first was a warning that warned you about the lack of a define.

    With this release esbuild will now attempt to define `process.env.NODE_ENV` automatically instead of warning about it. This will be implicitly defined to `"production"` if minification is enabled and `"development"` otherwise. This automatic behavior only happens when the platform is `browser`, since `process` is not a valid browser API and will never exist in the browser. This is also only done if there are no existing defines for `process`, `process.env`, or `process.env.NODE_ENV` so you can override the automatic value if necessary. If you need to disable this behavior, you can use the `neutral` platform instead of the `browser` platform.

* Retain side-effect free intermediate re-exporting files ([#1088](https://github.com/evanw/esbuild/issues/1088))

    This fixes a subtle bug with esbuild's support for [Webpack's `"sideEffects": false` annotation](https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free) in `package.json` when combined with re-export statements. A re-export is when you import something from one file and then export it again. You can re-export something with `export * from` or `export {foo} from` or `import {foo} from` followed by `export {foo}`.

    The bug was that files which only contain re-exports and that are marked as being side-effect free were not being included in the bundle if you import one of the re-exported symbols. This is because esbuild's implementation of re-export linking caused the original importing file to "short circuit" the re-export and just import straight from the file containing the final symbol, skipping the file containing the re-export entirely.

    This was normally not observable since the intermediate file consisted entirely of re-exports, which have no side effects. However, a recent change to allow ESM files to be lazily-initialized relies on all intermediate files being included in the bundle to trigger the initialization of the lazy evaluation wrappers. So the behavior of skipping over re-export files is now causing the imported symbols to not be initialized if the re-exported file is marked as lazily-evaluated.

    The fix is to track all re-exports in the import chain from the original file to the file containing the final symbol and then retain all of those statements if the import ends up being used.

* Add a very verbose `debug` log level

    This log level is an experiment. Enabling it logs a lot of information (currently only about path resolution). The idea is that if you are having an obscure issue, the debug log level might contain some useful information. Unlike normal logs which are meant to mainly provide actionable information, these debug logs are intentionally mostly noise and are designed to be searched through instead.

    Here is an example of debug-level log output:

    ```
     > debug: Resolving import "react" in directory "src" of type "import-statement"
       note: Read 26 entries for directory "src"
       note: Searching for "react" in "node_modules" directories starting from "src"
       note: Attempting to load "src/react" as a file
       note: Failed to find file "src/react"
       note: Failed to find file "src/react.tsx"
       note: Failed to find file "src/react.ts"
       note: Failed to find file "src/react.js"
       note: Failed to find file "src/react.css"
       note: Failed to find file "src/react.svg"
       note: Attempting to load "src/react" as a directory
       note: Failed to read directory "src/react"
       note: Parsed package name "react" and package subpath "."
       note: Checking for a package in the directory "node_modules/react"
       note: Read 7 entries for directory "node_modules/react"
       note: Read 393 entries for directory "node_modules"
       note: Attempting to load "node_modules/react" as a file
       note: Failed to find file "node_modules/react"
       note: Failed to find file "node_modules/react.tsx"
       note: Failed to find file "node_modules/react.ts"
       note: Failed to find file "node_modules/react.js"
       note: Failed to find file "node_modules/react.css"
       note: Failed to find file "node_modules/react.svg"
       note: Attempting to load "node_modules/react" as a directory
       note: Read 7 entries for directory "node_modules/react"
       note: Resolved to "node_modules/react/index.js" using the "main" field in "node_modules/react/package.json"
       note: Read 7 entries for directory "node_modules/react"
       note: Read 7 entries for directory "node_modules/react"
       note: Primary path is "node_modules/react/index.js" in namespace "file"
    ```

## 0.11.2

* Fix missing symbol dependency for wrapped ESM files ([#1086](https://github.com/evanw/esbuild/issues/1086))

    An internal graph node was missing an edge, which could result in generating code that crashes at run-time when code splitting is enabled. Specifically a part containing an import statement must depend on the imported file's wrapper symbol if the imported file is wrapped, regardless of whether it's a wrapped CommonJS or ESM file. Previously this was only the case for CommonJS files but not for ESM files, which is incorrect. This bug has been fixed.

* Fix an edge case with entry points and top-level await

    If an entry point uses `import()` on itself, it currently has to be wrapped since `import()` expressions call the wrapper for the imported file. This means the another call to the wrapper must be inserted at the bottom of the entry point file to start the lazy evaluation of the entry point code (otherwise nothing will be evaluated, since the entry point is wrapped). However, if this entry point then contains a top-level await that means the wrapper is `async` and must be passed to `await` to catch and forward any exceptions thrown during the evaluation of the entry point code. This `await` was previously missing in this specific case due to a bug, but the `await` should now be added in this release.

## 0.11.1

* Fix a missing space before internal `import()` when minifying ([#1082](https://github.com/evanw/esbuild/issues/1082))

    Internal `import()` of a CommonJS module inside the bundle turns into a call to `Promise.resolve().then(() => require())`. However, a space was not inserted before the `Promise` token when minifying, which could lead to a syntax error. This bug has been fixed.

* Fix code generation for unused imported files without side effects ([#1080](https://github.com/evanw/esbuild/issues/1080))

    When esbuild adds a wrapping closure around a file to turn it from a statically-initialized file to a dynamically-initialized file, it also needs to turn import statements in other files that import the wrapped file into calls to the wrapper so that the wrapped file is initialized in the correct ordering. However, although tree-shaking is disabled for wrapped CommonJS files because CommonJS exports are dynamic, tree-shaking is still enabled for wrapped ESM files because ESM exports are static.

    This caused a bug when files that have been marked with [`"sideEffects": false`](https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free) end up being completely unused in the resulting bundle. In that case the file is removed entirely, but esbuild was still turning `import` statements to that file into calls to the ESM wrapper. These wrapper calls should instead be omitted if the file was completely removed from the bundle as dead code. This bug has been fixed.

* Allow top-level await in supported environments

    Top-level await (i.e. using the `await` keyword outside of an `async` function) is not yet part of the JavaScript language standard. The [feature proposal](https://github.com/tc39/proposal-top-level-await) is still at stage 3 and has not yet advanced to stage 4. However, V8 has already implemented it and it has shipped in Chrome 89 and node 14.8. This release allows top-level await to be used when the `--target=` flag is set to those compilation targets.

* Convert `import()` to `require()` if `import()` is not supported ([#1084](https://github.com/evanw/esbuild/issues/1084))

    This release now converts dynamic `import()` expressions into `Promise.resolve().then(() => require())` expressions if the compilation target doesn't support them. This is the case for node before version 13.2, for example.

## 0.11.0

**This release contains backwards-incompatible changes.** Since esbuild is before version 1.0.0, these changes have been released as a new minor version to reflect this (as [recommended by npm](https://docs.npmjs.com/cli/v6/using-npm/semver/)). You should either be pinning the exact version of `esbuild` in your `package.json` file or be using a version range syntax that only accepts patch upgrades such as `~0.10.0`. See the documentation about [semver](https://docs.npmjs.com/cli/v6/using-npm/semver/) for more information.

The changes in this release mostly relate to how entry points are handled. The way output paths are generated has changed in some cases, so you may need to update how you refer to the output path for a given entry point when you update to this release (see below for details). These breaking changes are as follows:

* Change how `require()` and `import()` of ESM works ([#667](https://github.com/evanw/esbuild/issues/667), [#706](https://github.com/evanw/esbuild/issues/706))

    Previously if you call `require()` on an ESM file, or call `import()` on an ESM file with code splitting disabled, esbuild would convert the ESM file to CommonJS. For example, if you had the following input files:

    ```js
    // cjs-file.js
    console.log(require('./esm-file.js').foo)

    // esm-file.js
    export let foo = bar()
    ```

    The previous bundling behavior would generate something like this:

    ```js
    var require_esm_file = __commonJS((exports) => {
      __markAsModule(exports);
      __export(exports, {
        foo: () => foo
      });
      var foo = bar();
    });
    console.log(require_esm_file().foo);
    ```

    This behavior has been changed and esbuild now generates something like this instead:

    ```js
    var esm_file_exports = {};
    __export(esm_file_exports, {
      foo: () => foo
    });
    var foo;
    var init_esm_file = __esm(() => {
      foo = bar();
    });
    console.log((init_esm_file(), esm_file_exports).foo);
    ```

    The variables have been pulled out of the lazily-initialized closure and are accessible to the rest of the module's scope. Some benefits of this approach:

    * If another file does `import {foo} from "./esm-file.js"`, it will just reference `foo` directly and will not pay the performance penalty or code size overhead of the dynamic property accesses that come with CommonJS-style exports. So this improves performance and reduces code size in some cases.

    * This fixes a long-standing bug ([#706](https://github.com/evanw/esbuild/issues/706)) where entry point exports could be broken if the entry point is a target of a `require()` call and the output format was ESM. This happened because previously calling `require()` on an entry point converted it to CommonJS, which then meant it only had a single `default` export, and the exported variables were inside the CommonJS closure and inaccessible to an ESM-style `export {}` clause. Now calling `require()` on an entry point only causes it to be lazily-initialized but all exports are still in the module scope and can still be exported using a normal `export {}` clause.

    * Now that this has been changed, `import()` of a module with top-level await ([#253](https://github.com/evanw/esbuild/issues/253)) is now allowed when code splitting is disabled. Previously this didn't work because `import()` with code splitting disabled was implemented by converting the module to CommonJS and using `Promise.resolve().then(() => require())`, but converting a module with top-level await to CommonJS is impossible because the CommonJS call signature must be synchronous. Now that this implemented using lazy initialization instead of CommonJS conversion, the closure wrapping the ESM file can now be `async` and the `import()` expression can be replaced by a call to the lazy initializer.

    * Adding the ability for ESM files to be lazily-initialized is an important step toward additional future code splitting improvements including: manual chunk names ([#207](https://github.com/evanw/esbuild/issues/207)), correct import evaluation order ([#399](https://github.com/evanw/esbuild/issues/399)), and correct top-level await evaluation order ([#253](https://github.com/evanw/esbuild/issues/253)). These features all need to make use of deferred evaluation of ESM code.

    In addition, calling `require()` on an ESM file now recursively wraps all transitive dependencies of that file instead of just wrapping that ESM file itself. This is an increase in the size of the generated code, but it is important for correctness ([#667](https://github.com/evanw/esbuild/issues/667)). Calling `require()` on a module means its evaluation order is determined at run-time, which means the evaluation order of all dependencies must also be determined at run-time. If you don't want the increase in code size, you should use an `import` statement instead of a `require()` call.

* Dynamic imports now use chunk names instead of entry names ([#1056](https://github.com/evanw/esbuild/issues/1056))

    Previously the output paths of dynamic imports (files imported using the `import()` syntax) were determined by the `--entry-names=` setting. However, this can cause problems if you configure the `--entry-names=` setting to omit both `[dir]` and `[hash]` because then two dynamic imports with the same name will cause an output file name collision.

    Now dynamic imports use the `--chunk-names=` setting instead, which is used for automatically-generated chunks. This setting is effectively required to include `[hash]` so dynamic import name collisions should now be avoided.

    In addition, dynamic imports no longer affect the automatically-computed default value of `outbase`. By default `outbase` is computed to be the [lowest common ancestor](https://en.wikipedia.org/wiki/Lowest_common_ancestor) directory of all entry points. Previously dynamic imports were considered entry points in this calculation so adding a dynamic entry point could unexpectedly affect entry point output file paths. This issue has now been fixed.

* Allow custom output paths for individual entry points

    By default, esbuild will automatically generate an output path for each entry point by computing the relative path from the `outbase` directory to the entry point path, and then joining that relative path to the `outdir` directory. The output path can be customized using `outpath`, but that only works for a single file. Sometimes you may need custom output paths while using multiple entry points. You can now do this by passing the entry points as a map instead of an array:

    * CLI
        ```
        esbuild out1=in1.js out2=in2.js --outdir=out
        ```

    * JS
        ```js
        esbuild.build({
          entryPoints: {
            out1: 'in1.js',
            out2: 'in2.js',
          },
          outdir: 'out',
        })
        ```

    * Go

        ```go
        api.Build(api.BuildOptions{
          EntryPointsAdvanced: []api.EntryPoint{{
            OutputPath: "out1",
            InputPath: "in1.js",
          }, {
            OutputPath: "out2",
            InputPath: "in2.js",
          }},
          Outdir: "out",
        })
        ```

    This will cause esbuild to generate the files `out/out1.js` and `out/out2.js` inside the output directory. These custom output paths are used as input for the `--entry-names=` path template setting, so you can use something like `--entry-names=[dir]/[name]-[hash]` to add an automatically-computed hash to each entry point while still using the custom output path.

* Derive entry point output paths from the original input path ([#945](https://github.com/evanw/esbuild/issues/945))

    Previously esbuild would determine the output path for an entry point by looking at the post-resolved path. For example, running `esbuild --bundle react --outdir=out` would generate the output path `out/index.js` because the input path `react` was resolved to `node_modules/react/index.js`. With this release, the output path is now determined by looking at the pre-resolved path. For example, running `esbuild --bundle react --outdir=out` now generates the output path `out/react.js`. If you need to keep using the output path that esbuild previously generated with the old behavior, you can use the custom output path feature (described above).

* Use the `file` namespace for file entry points ([#791](https://github.com/evanw/esbuild/issues/791))

    Plugins that contain an `onResolve` callback with the `file` filter don't apply to entry point paths because it's not clear that entry point paths are files. For example, you could potentially bundle an entry point of `https://www.example.com/file.js` with a HTTP plugin that automatically downloads data from the server at that URL. But this behavior can be unexpected for people writing plugins.

    With this release, esbuild will do a quick check first to see if the entry point path exists on the file system before running plugins. If it exists as a file, the namespace will now be `file` for that entry point path. This only checks the exact entry point name and doesn't attempt to search for the file, so for example it won't handle cases where you pass a package path as an entry point or where you pass an entry point without an extension. Hopefully this should help improve this situation in the common case where the entry point is an exact path.

In addition to the breaking changes above, the following features are also included in this release:

* Warn about mutation of private methods ([#1067](https://github.com/evanw/esbuild/pull/1067))

    Mutating a private method in JavaScript is not allowed, and will throw at run-time:

    ```js
    class Foo {
      #method() {}
      mutate() {
        this.#method = () => {}
      }
    }
    ```

    This is the case both when esbuild passes the syntax through untransformed and when esbuild transforms the syntax into the equivalent code that uses a `WeakSet` to emulate private methods in older browsers. However, it's clear from this code that doing this will always throw, so this code is almost surely a mistake. With this release, esbuild will now warn when you do this. This change was contributed by [@jridgewell](https://github.com/jridgewell).

* Fix some obscure TypeScript type parsing edge cases

    In TypeScript, type parameters come after a type and are placed in angle brackets like `Foo<T>`. However, certain built-in types do not accept type parameters including primitive types such as `number`. This means `if (x as number < 1) {}` is not a syntax error while `if (x as Foo < 1) {}` is a syntax error. This release changes TypeScript type parsing to allow type parameters in a more restricted set of situations, which should hopefully better resolve these type parsing ambiguities.

## 0.10.2

* Fix a crash that was introduced in the previous release ([#1064](https://github.com/evanw/esbuild/issues/1064))

    This crash happens when code splitting is active and there is a CSS entry point as well as two or more JavaScript entry points. There is a known issue where CSS bundling does not work when code splitting is active (code splitting is still a work in progress, see [#608](https://github.com/evanw/esbuild/issues/608)) so doing this will likely not work as expected. But esbuild obviously shouldn't crash. This release fixes the crash, although esbuild still does not yet generate the correct CSS output in this case.

* Fix private fields inside destructuring assignment ([#1066](https://github.com/evanw/esbuild/issues/1066))

    Private field syntax (i.e. `this.#field`) is supported for older language targets by converting the code into accesses into a `WeakMap`. However, although regular assignment (i.e. `this.#field = 1`) was handled destructuring assignment (i.e. `[this.#field] = [1]`) was not handled due to an oversight. Support for private fields inside destructuring assignment is now included with this release.

* Fix an issue with direct `eval` and top-level symbols

    It was previously the case that using direct `eval` caused the file containing it to be considered a CommonJS file, even if the file used ESM syntax. This was because the evaluated code could potentially attempt to interact with top-level symbols by name and the CommonJS closure was used to isolate those symbols from other modules so their names could be preserved (otherwise their names may need to be renamed to avoid collisions). However, ESM files are no longer convertable to CommonJS files due to the need to support top-level await.

    This caused a bug where scope hoisting could potentially merge two modules containing direct `eval` and containing the same top-level symbol name into the same scope. These symbols were prevented from being renamed due to the direct `eval`, which caused a syntax error at run-time due to the name collision.

    Because of this, esbuild is dropping the guarantee that using direct `eval` in an ESM file will be able to access top-level symbols. These symbols are now free to be renamed to avoid name collisions, and will now be minified when identifier minification is enabled. This is unlikely to affect real-world code because most real-world uses of direct `eval` only attempt to access local variables, not top-level symbols.

    Using direct `eval` in an ESM file when bundling with esbuild will generate a warning. The warning is not new and is present in previous releases of esbuild as well. The way to avoid the warning is to avoid direct `eval`, since direct `eval` is somewhat of an anti-pattern and there are better alternatives.

## 0.10.1

* Expose `metafile` to `onRebuild` in watch mode ([#1057](https://github.com/evanw/esbuild/issues/1057))

    Previously the build results returned to the watch mode `onRebuild` callback was missing the `metafile` property when the `metafile: true` option was present. This bug has been fixed.

* Add a `formatMessages` API ([#1058](https://github.com/evanw/esbuild/issues/1058))

    This API lets you print log messages to the terminal using the same log format that esbuild itself uses. This can be used to filter esbuild's warnings while still making the output look the same. Here's an example of calling this API:

    ```js
    import esbuild from 'esbuild'

    const formatted = await esbuild.formatMessages([{
      text: '"test" has already been declared',
      location: { file: 'file.js', line: 2, column: 4, length: 4, lineText: 'let test = "second"' },
      notes: [{
        text: '"test" was originally declared here',
        location: { file: 'file.js', line: 1, column: 4, length: 4, lineText: 'let test = "first"' },
      }],
    }], {
      kind: 'error',
      color: true,
      terminalWidth: 100,
    })

    process.stdout.write(formatted.join(''))
    ```

* Remove the file splitting optimization ([#998](https://github.com/evanw/esbuild/issues/998))

    This release removes the "file splitting optimization" that has up to this point been a part of esbuild's code splitting algorithm. This optimization allowed code within a single file to end up in separate chunks as long as that code had no side effects. For example, bundling two entry points that both use a disjoint set of code from a shared file consisting only of code without side effects would previously not generate any shared code chunks at all.

    This optimization is being removed because the top-level await feature was added to JavaScript after this optimization was added, and performing this optimization in the presence of top-level await is more difficult than before. The correct evaulation order of a module graph containing top-level await is extremely complicated and is specified at the module boundary. Moving code that is marked as having no side effects across module boundaries under these additional constraints is even more complexity and is getting in the way of implementing top-level await. So the optimization has been removed to unblock work on top-level await, which esbuild must support.

## 0.10.0

**This release contains backwards-incompatible changes.** Since esbuild is before version 1.0.0, these changes have been released as a new minor version to reflect this (as [recommended by npm](https://docs.npmjs.com/cli/v6/using-npm/semver/)). You should either be pinning the exact version of `esbuild` in your `package.json` file or be using a version range syntax that only accepts patch upgrades such as `~0.9.0`. See the documentation about [semver](https://docs.npmjs.com/cli/v6/using-npm/semver/) for more information.

That said, there are no breaking API changes in this release. The breaking changes are instead about how input files are interpreted and/or how output files are generated in some cases. So upgrading should be relatively straightforward as your API calls should still work the same way, but please make sure to test your code when you upgrade because the output may be different. These breaking changes are as follows:

* No longer support `module` or `exports` in an ESM file ([#769](https://github.com/evanw/esbuild/issues/769))

    This removes support for using CommonJS exports in a file with ESM exports. Previously this worked by converting the ESM file to CommonJS and then mixing the CommonJS and ESM exports into the same `exports` object. But it turns out that supporting this is additional complexity for the bundler, so it has been removed. It's also not something that works in real JavaScript environments since modules will never support both export syntaxes at once.

    Note that this doesn't remove support for using `require` in ESM files. Doing this still works (and can be made to work in a real ESM environment by assigning to `globalThis.require`). This also doesn't remove support for using `import` in CommonJS files. Doing this also still works.

* No longer change `import()` to `require()` ([#1029](https://github.com/evanw/esbuild/issues/1029))

    Previously esbuild's transform for `import()` matched TypeScript's behavior, which is to transform it into `Promise.resolve().then(() => require())` when the current output format is something other than ESM. This was done when an import is external (i.e. not bundled), either due to the expression not being a string or due to the string matching an external import path.

    With this release, esbuild will no longer do this. Now `import()` expressions will be preserved in the output instead. These expressions can be handled in non-ESM code by arranging for the `import` identifier to be a function that imports ESM code. This is how node works, so it will now be possible to use `import()` with node when the output format is something other than ESM.

* Run-time `export * as` statements no longer convert the file to CommonJS

    Certain `export * as` statements require a bundler to evaluate them at run-time instead of at compile-time like the JavaScript specification. This is the case when re-exporting symbols from an external file and a file in CommonJS format.

    Previously esbuild would handle this by converting the module containing the `export * as` statement to CommonJS too, since CommonJS exports are evaluated at run-time while ESM exports are evaluated at bundle-time. However, this is undesirable because tree shaking only works for ESM, not for CommonJS, and the CommonJS wrapper causes additional code bloat. Another upcoming problem is that top-level await cannot work within a CommonJS module because CommonJS `require()` is synchronous.

    With this release, esbuild will now convert modules containing a run-time `export * as` statement to a special ESM-plus-dynamic-fallback mode. In this mode, named exports present at bundle time can still be imported directly by name, but any imports that don't match one of the explicit named imports present at bundle time will be converted to a property access on the fallback object instead of being a bundle error. These property accesses are then resolved at run-time and will be undefined if the export is missing.

* Change whether certain files are interpreted as ESM or CommonJS ([#1043](https://github.com/evanw/esbuild/issues/1043))

    The bundling algorithm currently doesn't contain any logic that requires flagging modules as CommonJS vs. ESM beforehand. Instead it handles a superset and then sort of decides later if the module should be treated as CommonJS vs. ESM based on whether the module uses the `module` or `exports` variables and/or the `exports` keyword.

    With this release, files that follow [node's rules for module types](https://nodejs.org/api/packages.html#packages_type) will be flagged as explicitly ESM. This includes files that end in `.mjs` and files within a package containing `"type": "module"` in the enclosing `package.json` file. The CommonJS `module` and `exports` features will be unavailable in these files. This matters most for files without any exports, since then it's otherwise ambiguous what the module type is.

    In addition, files without exports should now accurately fall back to being considered CommonJS. They should now generate a `default` export of an empty object when imported using an `import` statement, since that's what happens in node when you import a CommonJS file into an ESM file in node. Previously the default export could be undefined because these export-less files were sort of treated as ESM but with missing import errors turned into warnings instead.

    This is an edge case that rarely comes up in practice, since you usually never import things from a module that has no exports.

In addition to the breaking changes above, the following features are also included in this release:

* Initial support for bundling with top-level await ([#253](https://github.com/evanw/esbuild/issues/253))

    Top-level await is a feature that lets you use an `await` expression at the top level (outside of an `async` function). Here is an example:

    ```js
    let promise = fetch('https://www.example.com/data')
    export let data = await promise.then(x => x.json())
    ```

    Top-level await only works in ECMAScript modules, and does not work in CommonJS modules. This means that you must use an `import` statement or an `import()` expression to import a module containing top-level await. You cannot use `require()` because it's synchronous while top-level await is asynchronous. There should be a descriptive error message when you try to do this.

    This initial release only has limited support for top-level await. It is only supported with the `esm` output format, but not with the `iife` or `cjs` output formats. In addition, the compilation is not correct in that two modules that both contain top-level await and that are siblings in the import graph will be evaluated in serial instead of in parallel. Full support for top-level await will come in a future release.

* Add the ability to set `sourceRoot` in source maps ([#1028](https://github.com/evanw/esbuild/pull/1028))

    You can now use the `--source-root=` flag to set the `sourceRoot` field in source maps generated by esbuild. When a `sourceRoot` is present in a source map, all source paths are resolved relative to it. This is particularly useful when you are hosting compiled code on a server and you want to point the source files to a GitHub repo, such as [what AMP does](https://cdn.ampproject.org/v0.mjs.map).

    Here is the description of `sourceRoot` from [the source map specification](https://sourcemaps.info/spec.html):

    > An optional source root, useful for relocating source files on a server or removing repeated values in the "sources" entry. This value is prepended to the individual entries in the "source" field. If the sources are not absolute URLs after prepending of the "sourceRoot", the sources are resolved relative to the SourceMap (like resolving script src in a html document).

    This feature was contributed by [@jridgewell](https://github.com/jridgewell).

* Allow plugins to return custom file watcher paths

    Currently esbuild's watch mode automatically watches all file system paths that are handled by esbuild itself, and also automatically watches the paths of files loaded by plugins when the paths are in the `file` namespace. The paths of files that plugins load in namespaces other than the `file` namespace are not automatically watched.

    Also, esbuild never automatically watches any file system paths that are consulted by the plugin during its processing, since esbuild is not aware of those paths. For example, this means that if a plugin calls `require.resolve()`, all of the various "does this file exist" checks that it does will not be watched automatically. So if one of those files is created in the future, esbuild's watch mode will not rebuild automatically even though the build is now outdated.

    To fix this problem, this release introduces the `watchFiles` and `watchDirs` properties on plugin return values. Plugins can specify these to add additional custom file system paths to esbuild's internal watch list. Paths in the `watchFiles` array cause esbuild to rebuild if the file contents change, and paths in the `watchDirs` array cause esbuild to rebuild if the set of directory entry names changes for that directory path.

    Note that `watchDirs` does not cause esbuild to rebuild if any of the contents of files inside that directory are changed. It also does not recursively traverse through subdirectories. It only watches the set of directory entry names (i.e. the output of the Unix `ls` command).
