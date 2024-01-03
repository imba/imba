# Changelog

## Unreleased

* Fix tooling for `item isa (a or b or c)` syntax

* Fix sourcemapping for tag declaration superclass

* Allow compile-time env flags in front of class fields and methods.

```imba
class Something
    $node$ def onlyForNode
        yes

    $web$ def onlyForWeb
        yes
```

## 2.0.0-alpha.235

* Call MyMixin.mixes(class) for every class that mixes in MyMixin (if mixes function is defined).

* Add support for generator functions. Any method that contains a `yield` statement is compiled to a generator function.

## 2.0.0-alpha.234

* Improve memory efficiency for tooling

## 2.0.0-alpha.233

* Fixed sourcemapping for import/export declarations to improve tooling hints

* Fixed issue with super() being injected too late in classes using mixins

* Fixed issue with `instanceof` operator for mixins

* Fixed `export default global class` typescript output

* Allow `def` / `get` / `set` declarations without body

* Prepare support for `mixin` and `interface` keywords

## 2.0.0-alpha.232

* Lots of internal changes preparing for beta launch.

* Small utility functions are now defined in a single file and imported from 'imba/runtime' in compiled output. This allows the bundlers to much more efficiently deduplicate the output.

### Typescript output for tooling

Now outputting typescript instead of jsdoc-laden javascript to improve consistency, performance, and functionality of the tooling (languageservice). It will now be trivial to allow defining types and interfaces directly in imba files.

As a temporary solution to not depend on typescript you can add raw complex types in multiline block comments starting with @ts:

```imba
### @ts
type FirstType = { prop1: number; };
type SecondType = { prop2: string;};
type CombinedType = FirstType & SecondType;
declare global { var SomeGlobalNumber: number; }
###

# Use the types in code
let item\CombinedType
```

Generic arguments are also supported (experimental). Looking at a better syntax, currently it just accepts raw typescript generics.

```
# define generics for classes
class Wrapper<T=any>
# type arguments
let items = new Array<Model>
# Typed spawner method
def spawn<Type>\InstanceType<Type> type\Type
    return new type

###
This type of pattern is really common in typescript. In imba you can
refer to $1,$2,$3... to refer to argument _type_ 1,2,3,... just like
$1 in code refers to argument _value_. So that type of function can
in Imba be written as:
###
def spawn\InstanceType<$1> type
    return new type
```

### Experimental support for mixins / multiple inheritance

Will be refined and improved closer to final 2.0 launch. The best thing about mixins is that in combination with the new tooling all typings and completions should just work, consistently.

```imba
# Any class can be used as a mixin
class Logger
    def log ...vals
        console.log(self,...vals)

class Model
    isa Logger # injects Logger functionality

let model = new Model
model.log(123) # logs out

# Reopening the logger to add functionality
extend class Logger
    def warn ...vals
        console.warn(self,...vals)

model.warn(123) # classes are kept in sync with mixins

# You can even open existing classes and add mixins
class Inspectable
    isa Logger
    def inspect
        log "inspect",some-info

# Extend all elements
extend tag element
    isa Inspectable

```

### Support for `static let/const`

Add support for `static let/const` variables inside of methods. These variables will stay alive across multiple calls. When used on instances, they are scoped to their instance. Example:

```
# useful for memoization - w/o cluttering up the global namespace
def slugify str
    static let map = {}
    map[str] ||= complexSlugifyOperation(str)

class Item
    def tap
        static let count = 0
        count++
        console.log "You tapped 100 times!" if count == 100
```



## 2.0.0-alpha.231

* Allow using `$vite$` in compiler for vite-only code.

* Various fixes for vite integration.

* Add `rescue` keyword

    Acts like a combined try-catch wrapper for arbitrary expressions. It will return the result of the expression, _or_ the error if the expression throws. Very useful for catching rejected promises and other errors.

    ```imba
    # if this crashes you'd better have wrapped your code in a try/catch(!)
    let res = await server.save(...)

    let res = rescue await server.save(...)
    if res isa Error
        ...
    # if an error was thrown inside server.save, the error is assigned to res
    ```

    You could previously do something like this with try-catch:

    ```imba
    let res = try
        await server.save(...)
    catch e
        e
    ```

    But this only worked for assignments, and try/catch did not consistently
    work inside of expressions. Syntactically rescue acts just as a regular
    function call like `update(id, rescue(validate!))`

* Accessors are no longer inited in constructor

* Runtime helpers are imported instead of inlined - so bundling will not lead to many duplicated tiny functions.

## 2.0.0-alpha.230

* Improved integration with vite

* `.env` traverse up file tree from file instead of cwd

* Add `@standalone` and `@browser` style modifiers

* Add custom `@mutate` event that wraps `MutationObserver` the same way `@resize` wraps `ResizeObserver` and `@intersect` wraps `IntersectionObserver`

* Add built-in `@bound` decorator. This will bind methods to their class instance.

    ```
    class Item
        # method is automatically bound to instance and can be passed around
        # without changing self when called.
        @bound def setup
            yes
    ```

* Add built-in `@thenable` decorator. Very useful - wait for docs :)

* Add `ease-styles` style property and make the alias `e` a shorthand for `ease-styles` instead of `ease-all`.

    It's quite common to just want smooth generic easing of styles. Previously you could just do `e:200ms` or `e:300ms ease-in-out` etc, but that would add easing to _all_ properties. Many properties like `z-index`, `position`, `display` should usually not be eased, and can cause major performance issues. The default shorthand now only eases the visual properties you would usually want to ease.

* Initial work on stdlib that adds functionality to builtins like String, Number, Array, Set and more. Use via `import 'imba/std'`.

* Add `kb`, `mb` and `gb` units. Including these units after a literal number
will compile to number of bytes. Ie:

    ```
    2mb # 2097152
    1kb # 1024
    file.size < 500kb # check a filesize
    new Uint8Array(8mb) # Allocating an 8mb UintArray
    ```

* Various fixes and quality-of-life improvements.

## 2.0.0-alpha.229

* Fixed regression with style values inside parenthesis

* Made `bdx` and `bdy` aliases work as intended

## 2.0.0-alpha.228

* Fixed issue with certain scoped selectors compiling incorrectly

* Fixed `@odd`, `@even`, `@not-first` and `@not-last` selectors

* Changed behaviour of `@hotkey` with multiple handlers

    If multiple elements bind to the same `@hotkey` combo Imba would
    previously always trigger them in reverse order (ie, last dom element first). If some but not all of the handlers are bound to visible elements (ie has offsetParent) it will only trigger on those.

    This is useful if you have multiple pages / sections that bind to the same
    hotkeys, and you show / hide the elements using css instead of adding and removing them from the dom.

## 2.0.0-alpha.227

* Fix regression which caused `.!classname` and `@!hover` negated modifiers to break.

* Fix issue where css selector could not start with `^` parent reference.

## 2.0.0-alpha.226

We've reworked a core part of how style selectors are compiled in terms of specificity++. If your existing styles break in any way, please let us know on discord!

* Fixed reference to missing index.css.map when building projects.

* Fixed issue with reactivity when error was thrown inside reactive function.

* Fixed issue with routed elements inside slots.

* Fixed tooling to make it work with latest vscode.

* Add numerous 3-letter display values for all common flex layouts.

* Include `min-width` and `min-height` in list of easing properties.

* Add field descriptor syntax for declaring advanced get/set wrappers for properties on classes and tags.

* Add new css aliases:

    ```
    tof: text-overflow
    tuf: text-underline-offset
    mih: min-height
    mah: max-height
    miw: min-width
    maw: max-width
    ```

* Add experimental support for `.env` files (docs coming)

* Changed how `..@hover` and `..outer-class` selectors work.

    They now rely on browser-support for `:matches` and `:is` which is still at ~95% support globally.

* Use literaly `@` in html classes for modifiers.

    If you previously relied on the fact that `d@custom-modifier:block` compiled to `.mod-custom-modifier { display: block }` you need to follow new conventions.

* Add support for `^` in style modifiers for advanced targeting.

    ```imba
    # color of span is blue when button is hovered
    <button> <span[c^@hover:blue]>
    # opacity of nested i is 1 only when button is foxused
    <button> <span> <i[o:0 o^^@focus:1]>
    ```

## 2.0.0-alpha.225

* Automatically prefix certaib css properties for better browser compatibility.

* When errors are thrown inside event handlers - a subsequent `@error` event will be triggered from the element of the throwing handler.

* All new `imba create` command (by @familyfriendlymikey)

* Remove support for old `prop name @set ...` syntax for watching when property is changed. Implement using descriptors instead.

## 2.0.0-alpha.224

* Fixed parsing of nested template literal strings.

* Enable sourcemapping by default when running scripts.

* Added `imba.awaits`

* Make sure automatic `import {...} from 'imba'` is inserted at the very top.

* Make empty catch block return the error

    Useful to be able to handle things like error handling for asynchronous promises in a more compact manner:

    ```imba
    # will just swallow potential errors like before
    let res = try await some-function
    # ending with catch will return the error instead of the result
    let res = try await some-function catch
    if res isa Error
        ...
    ```

* Various fixes

## 2.0.0-alpha.223

* Include safari15 as a target when compiling for web.

    We recently started using class static initialization blocks to simplify
    some internals, and this is not yet supported in safari.

* Allow two parameters in `ja`/`justify-align` property to set justify/align independently.

## 2.0.0-alpha.222

* Enable `x` and `y` shorthands for all border properties.

* Add `s` shorthand for `size`.

* Deprecate `j` and `a` shorthands.

* Streamlined more css shorthands and added more tests for styling

## 2.0.0-alpha.221

* Add shorthands for `outline-*` css properties.

* Unify `ease` and `transition` css properties.

    This is a breaking change. Going forward it is recommended to use the `ease` properties for all transitioning. See [documentation](https://imba.io/docs/css/easing).

* Add support for custom colors in predefined box-shadows.

    See [documentation](https://imba.io/docs/css/properties/box-shadow) for details.

* Improvements to the router.

* Rely more on esbuild to generate simpler code (ie using static blocks in classes).

* Add `inherited` hook for classes.

    Whenever a class is extended, the `inherited` method on the parent class will be called, with the subclass as the only argument, if one is defined.

    ```imba
    class Model
        static def inherited subclass
            console.log subclass,'inherited from',self

    class Item < Model
    ```

## 2.0.0-alpha.219

* Add import handler for `?serviceworker` suffix.

    These assets are built without hashes in filename and to the root of the public folder, as is required for serviceworkers.

* Deprecate `shadow` shorthand for `box-shadow` - use `bxs` instead.

* Deprecate `ts` shorthand for `text-shadow` - use `txs` instead.

* Support two parameters in css property `gap`

## 2.0.0-alpha.216

Last version (with new features) before `beta.1`. This release contains breaking changes in the bundler that need to be tested thoroughly before beta.

* Use the latest version of esbuild

    We are finally using the latest version of esbuild. All of our custom logic
    for hashing, resolving and chunking is now done by esbuild instead.

* Support path aliases from `[js|ts]config.json`

    Now that we are using the latest version of esbuild we finally support [path aliases](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping) declared in `[js|ts]config.json` files. This also works with assets, ie. declaring `"icons/*": ["assets/svg/*","assets/codicons/*]` in your tsconfig would allow `<svg src="icons/some-icon.svg">` to work anywhere in your project.

* Remove support for path aliases in `imbaconfig.json`

    If you had declared path aliases in an `imbaconfig.json` these should be moved into a `[js|ts]config.json` instead.

* Remove backwards compatible transforms from compiler itself.

    Previously we included a bunch of logic for transforming conditional assignments like `??=`,`&&=`, and `||=` to support older browsers and node versions. Now we compile these statements as is and rely on esbuild to transform when needed.

* Remove support for `?=` operator - use `??=` instead.

* Drop commonjs target from compiler

    The imba compiler will now always compile import/export statements natively
    to import/export in javascript, and instead rely on esbuild to convert the output to cjs when needed.

* Simplify output from `imba build`

    The output of imba build is now possible to run directly through node (and soon Bun). We

* Allow running html file directly with `imba some-entry.html`

    This will spawn a dev-server for this html file and its referenced scripts and stylesheets.

* Allow testing client-side scripts with `imba --web some-entry.imba`

    This will spawn a dev-server, a html entrypoint and all that is needed to run a script in the browser.

* Copy static assets over from `public` when building

    If you have a `public` directory in your project, files from this will be copied over to the public folder of your output dir (default `dist`) when building.

* Allow prefixing asset paths via `--base` option

    Ie, when building for github pages you would run `imba build --base /my-repo-name -o docs index.html` to build your files and assets with the correct prefix, into the `docs/` folder of your project to adhere to github pages convetions.

* Support loading workers following vite conventions

    ```
    import MyWorker from './some/script?worker'
    import MySharedWorker from './some/script?sharedworker'
    import url from './some/script?worker&url'
    ```

* Set node14.13.0 as the default minimum target when building for node.

    This can be overridden by supplying your version of node through the `--node.target` option. Ie `imba build --node.target node12 my/script.imba`

* Fixed regression in router that caused routed elements inside the root component to fail.

## 2.0.0-alpha.214

* Treat routes ending with `/` as exact routes.

    The `<div route='/'>` would previously match any path. You could define exact routes by including a `$` at the end of the route. This lead to a lot
    of confusion. Now, any route that ends with a `/` will only match the exact path. Use `*` to bypass

    ```imba
    <div route='/'> # matches / _only_
    <div route='/*'> # matches any path

    <div route='/items'> # matches /items, /items/1 etc
    <div route='/items/'> # matches /items only
    ```

* Only show first matching element if multiple siblings match a route.

    ```imba
    <div>
        <div route='/items/new'>
        <div route='/items/:id'> # if /items/new matched - this will not show
        <div route='/'> # matches if url is exactly '/'
        <div route='*'> # matches if none of the above matches
    ```

## 2.0.0-alpha.213

* Make `@event.emit('...')` on `<global/teleport>` dispath event inside their literal parent (fixes #693)

## 2.0.0-alpha.210

* Add number units for `minutes`, `hours`, and `days`

* Fixed issue where identical nested selectors were incorrectly optimized away

* Support `silent: true` option for `imba.autorun` to not call imba.commit

* Fixed issue where @autorun methods threw error when element was re-mounted (#684)

## 2.0.0-alpha.209

* Fixed bug with observables not unsubscribing correctly in certain cases

* Expose `imba.reportObserved`, `imba.reportChanged` and `imba.createAtom` (still experimental)

* Add `imba.hotkeys.addKeycodes(...)` (#677)

* Made `@touch.hold(dur)=handler` trigger handler after duration without waiting for additioanl events (#664)

## 2.0.0-alpha.207

* Don't try to implicitly return debugger statement

* Improve compilation of `extend` statements for tooling

## 2.0.0-alpha.206

* Disallow iterating over falsy values using `for in`

* Compile literal bigints correctly

* Minor improvements to type definitions

## 2.0.0-alpha.205

* Support `for await ... of` syntax

* Support tagged templates

    Works like in plain js, but `{}` is still used for interpolation instead of `${}`.

    ```imba
        import md from 'tag-markdown'
        const html = md`## Welcome to {name}`
    ```

* Add internal `#__patch__(props)` method for class instances to update fields

* Stop shimming top-level await (delegates responsibility to esbuild)

## 2.0.0-alpha.204

* Fixed operator precedence for ternary expressions

* Revert automatic `calc` wrapping for css values introduced in alpha 200

    Introduced a lot of bugs and challenges related to `/` being a valid part of css values. `calc` will still be automatically be added around top-level parenthesis in css values, so `width:(100vw - 20px)` will still compile as `calc(100vw - 20px)`, but properties like `grid-column: 1 / 3` will now compile without calc again.

## 2.0.0-alpha.203

* Fixed regression with negated breakpoint modifiers like `display@!600:none`

## 2.0.0-alpha.202

* Fixed performance regression for tag trees introduced in alpha 191

* Fixed compilation of css properties wrapped in parenthesis

* Make unresolved decorators resolve to `imba.@decorator`

    ```imba
    class Order
        @lazy get lines
            ...
    ```

    If `@lazy` is not found in the file above, the compiler will essentially include
    `import {@lazy} from 'imba` when compiling.

* Introduced experimental state management decorators

    A minimal set of decorators heavily inspired by MobX that allows you to mark classes
    and objects as observable, and run code upon changes. This feature will be kept under
    wraps until it has been battle-tested.

## 2.0.0-alpha.201

* Fixed regression where css colors `rgb(0 0 0 / alpha)` would compile incorrectly

## 2.0.0-alpha.200

* Allow `@hotkey('*')` to listen to all hotkey events

    This is perfect for disabling all other hotkeys in certain contexts.

    ```imba
    tag ConfirmDialog
        # when this dialog is mounted - all hotkey handlers preceding
        # it in the dom tree will be blocked by the `*` listener
        <self @hotkey('*').global>
            <button @hotkey('esc')> "Cancel"
            <button @hotkey('enter')> "Ok"
    ```

* Automatically wrap style expressions in `calc()`

    ```imba
    css div width: calc(100vw - 40px)
    # can now be written as
    css div width: 100vw - 40px
    ```

* Make bind=data.property work for textarea when value is `undefined`

* Allow nested parentheticals in css calc

* Fixed issue where removing class names using `el.flags.remove` would not work

* Made `@touch.flag` support selector in second argument to match `@event.flag`

* Allow second argument to `el.flags.incr(flag, dur = 0)`

    With this argument you can automatically decrement the flag after a certain duration.

* Allow negated style modifiers

    ```imba
    css div
        @!hover o:0.5 # div:not(:hover) { opacity: 0.5 }
        @!md d:none # @media (max-width: 767px) { div { display:none } }
    # also works for classes
    css div
        @.!disabled o:0.5 # div:not(.disabled){ opacity:0.5 }
    ```

## 2.0.0-alpha.199

* Fix regression where content of `<teleport>` and `<global>` was not rendered (#643)

## 2.0.0-alpha.198

* Change how css specificity is forced in generated selectors

    Older browsers do not support complex selectors within `:not()`, so the style `:not(#_#_#_)` which is used for "inline" styles would not work in these browsers. We have now reverted to using multiple not selectors like `:not(#_):not(#_):not(#_)`. This is more verbose but the size is negligible, especially with compression. Debugging styles in the browser is a bit more clumsy.

* Change css specificity for component rules

    Selectors inside tag declarations are now compiled with a higher specificity than global selectors.

    ```imba
    tag App
        # scoped selectors have higher precedence than global styles
        css .selector d:block
    ```

* Fixed case where a generated class-name is added multiple times on elements

## 2.0.0-alpha.197

* Fixed issue with bracketless multiline object and certain operators

    ```imba
    let x = null
    x ||=
        one: 1
        two: 2
    # would previously compile incorrectly to x ||= {one: 1}
    ```

## 2.0.0-alpha.196

* Introduced `@event.closest(sel)` modifier

    Works like `@event.sel(selector)`, but checks for `target.closest(...)` instead of `target.matches(...)`.
    In the cases where you want to just handle clicks that do _not_ match a selector you can negate the modifier using `.!closest(...)`.

    ```imba
    tag App
        <self>
            # all clicks outside of button tags
            <div @click.!closest('button')>
                <button> <span> "Click"
                <p> "blabla"
    ```

## 2.0.0-alpha.195

* Fixed compilation issue for functional tags without arguments

* Throw error when trying to use bind on functional tags

## 2.0.0-alpha.194

* Improved syntax for functional tags

    If you supply `()` after a tag name, Imba will now treat it as a functional tag. Ie, `<some-name(1,2)>` is equal to `<( some-name(1,2) )>`. The old syntax may be phased out before final release.

    ```imba
    def List items
        return if items.length == 0

        <section>
            <slot>
            <ul> for item in items
                <li> item.title

    tag App
        def head
            <header> <slot> <h2> "Welcome"

        <self>
            <head()>
            <List(data.newest)> <h2> "Newest posts"
            <List(data.all).large> <h2> "All posts"
    ```

## 2.0.0-alpha.193

* Fix issue where parts of runtime was incorrectly tree-shaked

* Always resolve `node:*` imports as external

* Include changelog.md in npm package

## 2.0.0-alpha.191

There will likely be a few more alpha releases fixing regressions and issues related to the new features in alpha 191, but after these potential issues have been resolved we're moving to beta 🥳! This release does contain a few breaking changes, both in relation to styles and memoization. We'll update the docs at imba.io and publish a screencast going over the changes to make it easier to transition to this new version. Changes;

* Rename $key to key

    To give elements a stable identity (usually inside lists) you should now use `<el key=value>` instead of `<el $key=value>`. `$key` is deprecated and will be removed in `beta.1`.

* Allow using any object as `<element key=...>` value

    Keyed elements now use a `Map` instead of a plain object to keep track of unique elements. This means that any value (both objects and primitive values) may be used as keys.

    ```imba
    const items = [{title: "One"},{title: "Two"}]

    tag App
        <self> for item in items
            # objects themselves can be used as keys now
            <AppItem key=item data=item>
    ```

* New (improved) syntax for rendering functional components / tag trees

    This was the main change holding us back from reaching beta, as it is a breaking change for most users. When you want to include external live dom elements from getters or methods outside of the render-tree, wrap the expression in `<(expression)>`.

    Besides simplifying the way memoization works it also allows you to add classes and styles to these external fragments, making it vastly more flexible than before.

    ```imba
    tag App
        get body
            <div> "This is body"

        def list title, items
            <section>
                <h2> title
                <ul> for item in items
                    <li> item.title

        <self>
            <( body )>
            <( list 'Top', data.popular ).large [mt:2]>
            <( list 'New', data.posts.slice(0,10) )>
    ```

* Log warnings to console when building/running without minification

    Added runtime checks that notify about erroneous behaviour when building/running w/o minification. Initially it will only warn about non-memoized elements being created during rendering. Eventually we'll use these conventions to add much more elobrate checks and readable error messages for the most common issues users can run into.

* Allow instantiating elements w/o memoization using `new`

    Imba will automagically allow any element (literal tag) in any method to be memoized.

    ```imba
    def wrap text
        let div = <div.item> text
        return div

    imba.mount do <section>
        <( wrap "One" )>
        <( wrap "Two" )>
    ```

    If you call a method or access a getter that returns an element (like `def wrap`) it will look up a memoization context and just reuse/update the div for that particular context. If you call it directly without being in a context, Imba will warn you. There are however some situations where you actually just want to create new elements. In this case, use `new` in front of the element. If the root is not memoized, the children won't either, so you only need to add `new` in front of the top element.

    ```imba
    def wrap text
        let div = new <div.item> text
        return div
    ```

* Allow non-global tag types in dynamic tag names

    Local tag types are now allowed in `<{tag-type} ...>` syntax. Previously it would only work when `tag-type` evaluated to a string, and there was a globally defined web component or native tag with that name. Now it works with classes as well.

    ```imba
    import {PostView,ArticleView} from './views'

    const items = [
        { type: Post, title: "My post"}
        { type: Article, title: "My article"}
    ]

    tag App
        <self>
            for item in items
                <{item.type} data=item>
    ```

* Only allow named elements inside `<self>`

    Using named elements (`<div$myname>`) outside of self would previously introduce subtle bugs and conflicts. They are now only allowed inside of `<self>`.

* Changed css specificity

    Styles declared in tag declaration body now has lower specificity than class selectors.

    ```imba
    css .warn hue:red
    css .large p:4 fs:lg

    tag Button
        css p:2 fs:sm hue:blue

    # styles from classes take precedence
    <Button.warn.large>
    ```

* Scoped selectors no longer applies to self

    Now, selectors like `.warn` declared in tag declaration body only applies to elements _inside_ `Button`, not the button itself. To target the button itself, use `&` in the selector.

    ```imba
    tag Button
        css bg:blue2
        css .warn bg:red2
        css &.large fs:lg

        <self.warn.large> "Still blue bg - but large"
    ```

* Add `declare` keyword for declaring fields (with type annotations) without generating any code for that field

    ```imba
    class Foo
        declare a\number
    ```

* Allow multiline conditionals when lines start with `and`,`or`,`||`, or `&&`

    This is a temporary solution for a larger challenge. It simply ignores new-lines whenever your line starts with these operators.

    ```imba
    if condition
    and test
    or force
        return ...
    ```

* Allow third argument in `for in` loops referencing length

    If you need to know the length of a collection you are iterating over, you can now access the total length of the collection by supplying a third argument. This is not available in `for of`, only `for in`.

    ```imba
    for member,index,len in list
        # len refers to the length of the iterable list
        if index == len - 1
            yes # this is the last element
    ```

* Exposed `imba.hotkeys.humanize` for converting hotkey combos to readable shortcuts

* Exposed `imba.hotkeys.htmlify` for converting hotkey combos to readable shortcuts as html

## 2.0.0-alpha.190

* Fixed regression related to implicit parenthesis in tag trees

* Renamed `@hotkey.capture` to `@hotkey.force`

## 2.0.0-alpha.189

* Introduced `@hotkey.repeat` modifier

    When a user presses a key and then keeps holding it, keydown/keypress
    events will be generated every n milliseconds. For hotkeys you usually
    only want to trigger once when the user press the combination.

    If you want the handler to keep firing while user holds down the keys
    you can now use the `.repeat` modifier:

    ```imba
    # will only toggle when pressing space, no matter how long you
    # keep it pressed.
    <div @hotkey('space')=togglePlayback>
    # holding the right arrow will call fastForward repeatedly
    <div @hotkey('right').repeat=fastForward>
    ```

* Changed rules for implicit parenthes / calling in tag trees

    Indented code under a tag-tree will no longer be compiled as an invocation.

    ```imba
    <div> data.name
        "something"
    if data.name
        "something"
    ```

    The code above would previously compile to div `data.name("something")`. Now
    indentation in tag trees will behave like they do in statements like if/for/while etc.
    This fixes #630, so you can now add css blocks like this:

    ```imba
    <div> data.name
        css d:block # style for the div
    ```

* Added `@first-child` and `@last-child` css modifiers

    We already have `@first` and `@last` as shorter aliases, but since all other standard pseudo-selectors exist it makes sense to include the longer versions of these as well.

* Fixed issue with nested loops in tag trees

    It is now possible to use nested loops without wrapping the inner loops in a fragment.

    ```imba
    <div>
        for item in data.items
            for label in item.labels
                <div> label
    ```

* Allow declaring variables and global tags with the same name

    Global web components should not be registered as regular variables.
    Previously the compiler would throw an error if `tag app` and `let app = ...`
    were declared in the same file.

* Allow optional chaining with dynamic keys - #638

    ```imba
    user..[key]
    ```

* Mark imported SVGs as @__PURE__

    This allows efficient tree-shaking so that one can include all icons from a collection
    and only bundle the ones that are used.

    ```imba
    import * as icons from 'imba-codicons'

    <svg src=icons.volume-up>
    # you get completions and previews for all icons, but only volume-up
    # will be bundled in your code now
    ```

* Don't round x,y in `@touch.reframe` and `@touch.fit` by default (#639)

## 2.0.0-alpha.187

* Call `dehydrate` on compononents when rendering components from the server.

* Updated type declarations.

## 2.0.0-alpha.186

* Don't add html class name for named elements

    Previously when naming an element like `<div$title> ...`, imba would automatically
    add a `title` class name to the element. This can lead to confusing issues. If you
    have used this undocumented behaviour previously you just need to add the class
    yourself, like `<div$title.title>`.

* Introduced `@mouse.mod` modifier

    Since Mac and Windows/Linux use different keyboard modifiers for most standard actions
    (ctrl+c,ctrl+s,ctrl+click) vs (⌘c,⌘s,⌘+click) etc, it makes sense to have an event
    modifier that takes care of checking the platform. `@mouse.mod` will return true of
    ⌘ is pressed on mac, and Ctrl is pressed on all other platforms.

    ```imba
    <div @click.mod.stop=openInNewWindow @click=openHere>
    ```

* Fixed bug in `@event.throttle` modifier

## 2.0.0-alpha.183

- Remove unneeded class names on tags when building

## 2.0.0-alpha.182

- Fixed issues with using event modifiers with external imba library

## 2.0.0-alpha.177

- Added type declarations into typings/

## 2.0.0-alpha.176

- Deprecated `@touch.moved-dir`

    The direction of the `@touch.moved` modifier can now be specified in the second argument of `@touch.moved` instead of as 6 separate modifiers. These are not used that often and it seems natural to keep inside a single modifier instead.

    ```imba
    <div @touch.moved-left(4px)> # before
    <div @touch.moved(4px,'left')> # after
    ```

- Renamed style property `tint` to `hue`

    Hue is a better name for the newly introduced `tint` style property.

    ```imba
    # hue can be set to any named color from the imba color palette
    <div[hue:orange]>
        <h1[color:hue7]> # refer to a shade/tint of the aliased color
    ```

- Refactored event modifiers

    Foundations to allow defining custom event modifiers down the road. Complex modifiers have access to the context in which it was called, including a state-object that is persisted across events etc. Documentation fo this will be in place before 2.0 final. As an example, a tiny `@keydown.f1` modifier for only passing through F1 can be defined like this:

    ```imba
    extend class KeyboardEvent

      def @f1
        return keyCode == 112
    ```

- Changed behavior of `@event.throttle` modifier

    `throttle` would previously fire once and suppress subsequent events for a certain duration (default 250ms). Now it will re-fire at the end of the throttling if there were any suppressed events during the initial throttle. For events like `@resize` and `@scroll` where you just want to limit how often they fire, the new behavior is much more useful.

    ```imba
    # handler will be called immediately upon scrolling and keep emitting
    # every 100ms until there are no more scroll events.
    <div @scroll.throttle(100ms)=handler>

    # So, clicking this button twice will trigger once immediately,
    # and then again after 1 second. Previously the second click would
    # never trigger.
    <div @click.throttle(1s)=handler>
    ```

- Introduced `@event.cooldown` modifier

    The old `throttle` was renamed to `cooldown`. Ie, if you want subsequent button clicks to be suppressed for `n` time (250ms default) you should now use `cooldown` instead of `throttle`.

    ```imba
    # So, clicking this button twice will trigger once immediately, and
    # the next click will be ignored as long as it happens less than a second later
    <div @click.cooldown(1s)=handler>
    ```

- Allow negated event modifiers

    Certain event modifiers are called guards, like `@keydown.enter`, `@click.self` etc. These are modifiers that essentially evaluate to true/false and decides whether to continue handling an event or not. `@click.self` would only trigger if the target of the event is the same as the element to which the `@click` is bound. Now you can include a `!` in front of any such event handler to only continue if the guard is false.

    Ie. `<div @click.!shift=...>` would only trigger if shiftKey is _not_ pressed.

    ```imba
    #  Only call handler if shiftKey is NOT pressed
    <div @click.!shift=handler>

    #  Only call handler if target does NOT match the selector
    <div @click.!sel('.active')=handler>
    ```

- Introduced `@mouse.left`, `@mouse.middle`, and `@mouse.right` modifiers

    Only trigger if the left,middle, or right mouse button is pressed. Works for all mouse and pointer events, as well as the custom `@touch` event.

     ```imba
    #  Only call handler if the middle mouse button was pressed
    <div @click.middle=handler>

    #  Only start touch handling if the right mouse button was pressed
    <div @touch.right=handler>
    ```

- Introduced `@intersect.flag` modifier

    The `flag` modifier now works differently for `@intersect` event. It will add a css class to the element when it is intersecting and remove it whenever it is not intersecting.

     ```imba
    # the html class showing will be present on div
    # whenever it is intersecting with the viewport
    <div @intersect.flag('showing')>
    ```

- Introduced `@touch.end` modifier

    The `end` guard breaks unless the touch is in its ending state.

    ```imba
    # handler is only called at the end of the touch
    <div @touch.end=handler>
    # handler is only called at the end of the touch if pointer moved
    <div @touch.moved.end=handler>
    ```

- Introduced `@touch.hold(dur=1000ms)` modifier

    The `hold` modifier allows you to require an element to be pressed for some time (default 1000ms) until it starts allow events to come through.

    ```imba
    # handler is only called once the touch has been held for 1000ms
    <div @touch.hold=handler>
    # handler only called if ctrl was pressed and touch held for 250ms
    <div @touch.ctrl.hold(250ms)=handler>
    ```

- Introduced `@touch.apply(target,xprop='x',yprop='y')` modifier

    Like `@touch.sync` but just setting the x,y values on an object directly instead of adding to the previous values.

    ```imba
    const obj = {}
    # apply is essentially shorthand for setting properties:
    <div @touch.apply(obj)>
    <div @touch=(obj.x = e.x, obj.y = e.y)>
    ```

- Added `@event.key(keyOrCode)` modifier for keyboard events

    KeyboardEvent.keyCode is deprecated but still useful in many cases. If you supply a number to the modifier it will stop handling if `keyCode` does not match this number.

    ```imba
    # Only trigger if F1 is pressed (event.keyCode==112)
    <div @keydown.key(112)=handler>
    ```

    If you supply a string it will compare it against KeyboardEvent.key.

    ```imba
    # Only trigger if PrintScreen is pressed (event.key=='PrintScreen')
    <div @keydown.key('PrintScreen')=handler>
    ```

- Changed behavior of `@touch.moved` modifier

    Now, if you add a `moved-left(threshold = 4px)` modifier, the event handling will be cancelled if the touch has moved more in any other direction (in this case up,down, or right) _before_ moving 4px left.

    ```imba
    # If user moves more than 10px up/down before left/right
    # the touch will not be handled
    <div @touch.moved-x(10px)=draghandle>
    ```

- Improved behaviour of `@touch` and `@click` events

    `@click` events on nested children of an element with a `@touch` handler would previously be prevented. This made `@touch` pretty challenging to use for things like dragging elements with buttons etc.

    Now `@click` events will be triggered unless the `@touch` handler has a `prevent` modifier, a `moved(-x|y|up|down)` modifier that has activated, or a `hold` modifier that has activated.

    ```imba
    # button click is triggered onless touch is held more than 500ms
    <li @touch.hold(500ms)=draghandle> <button @click=handle>
    ```

- Improved behaviour of `@touch` and scrolling on touch devices
    Previously, scrolling (and clicking) would be disabled for any element with a `@touch` handler on iOS. Ie. if you added `@touch` to a custom slider, scrolling would not work if the user happened to touch down on the slider while flicking down the page.

    Scrolling is disabled by the `prevent` modifier, an activated `moved` modifier or activated `hold` modifier.

    ```imba
    # Scrolling will now work fine when touching the div and flicking up/down.
    # Only if the user holds still on the element for 500ms will scrolling and
    # default behavior be prevented.
    <div @touch.hold(500ms)=draghandler>
    ```

- Add support for additional file extensions in bundler (webm, weba, avi, mp3, mp4, m4a, mpeg, wav, ogg, ogv, oga, opus, bmp)

## 2.0.0-alpha.175
- Fix: `@in` transitions for nested elements works
- Experimental support for tweening from/to implicit width/height in transitions
- Experimental `@resize.css` modifier to automatically enable size units
- Allow variables in color opacity like `color:blue4/$alpha`
- Experimental support for `tint:colorname` and using `tint0-9` colors in styles

## 2.0.0-alpha.174
- Named elements (`<div$myname>`) exist immediately in components
- Fix: Spread operator works for any expression in objects
- Fix: Make sure ::before/after comes last in selectors with other pseudo-classes>
- Fix: Allow symbol keys in `prop/attr #my-sym-key`

## 2.0.0-alpha.173

- Fix: Allow binding tag properties to symbol identifiers
- Report correct location for "Cannot redeclare variable" error (#114)
- Experimental support for `@hotkey` events
- Fix: Don't run `imba.commit` on unhandled events>
- Added `@trusted` event guard
- Added `@trap` event modifier

## 2.0.0-alpha.172

- Fix: Rendering list inside conditional
- Support css blocks inside conditionals in tag trees
- Warn about interpolated style values outside of tag trees
- Improved specificity for nested css rules

## 2.0.0-alpha.171

- Fix: Make `<global @resize>` work correctly
- Fix: Variable resolution for `let item = do ... item()`
- Fix: Allow ternary in tag trees
- Fix: Allow `condition && <tag>` in tag trees
- Fix: Ternary parsing `cond ? <div> "a" : "b"`

## 2.0.0-alpha.170

- Added `@in` style modifier for specifying in-only transitions
- Renamed transition hooks to `transition-(in|out)-(end|cancel)`
- Using `<button bind=prop>` without a value acts like `<button bind=prop value=yes>`

## 2.0.0-alpha.169

- Fix: Various dom regressions in SSR
- Updated default ease duration to 300ms

## 2.0.0-alpha.168

- Use setAttribute('class') under the hood for svg elements
- Added `#afterVisit`, `#beforeReconcile`, `#afterReconcile` hooks
- Added experimental easing via `<my-element ease>`, with element hooks
  `#ease-enter`, `#ease-entered`, `#ease-enter-cancel`, and
  `#ease-exit`, `#ease-exited`, `#ease-exit-cancel`
- Added `ease/e`,`ease-opacity/eo`,`ease-transform/et` and `ease-colors/ec`
  style properties for experimental easing feature
- Fix: Passing slots into child components (#607)
- Allow using setters on `#context`

## 2.0.0-alpha.167

- Add support for generic media selectors via `@media(some-media) ...`
- Fix: Interpolated numeric value for `rotate:{val}` works i FF
- Add @all and @speech style modifiers (for @media all/speech)
- Fix: Allow empty css selectors
- Fix: Rebuilt prebuilt imba.mjs for web

## 2.0.0-alpha.166

- Add experimental support for class decorators
- Fix: Apply display:block to global tags without dashed name
- Change: `inset:*` style shorthand sets `position:absolute`
- Added `<teleport to=(sel/element)>` component (#606) by @haikyuu

## 2.0.0-alpha.165

- Reorganize prebuilt files for jspm support

## 2.0.0-alpha.157

- Add jspm configuration in package.json

## 2.0.0-alpha.156

- Add #**inited** hook for class instance initialization
- All custom components defaults to display:block
- Fix: Don't inject hmr.js script into html assets when building
- Fix: Generate html files in public directory

## 2.0.0-alpha.155

- Allow `$envvar$` as first argument of implicit calls (#571)
- Allow `super` in `extend class/tag`
- Add experimental support for `extend someObject`
- Variable / parameter named `self` used for implicit self in scope
- Throw error for non-self tags in tag declaration body
- Allow accessing array elements from end with literal numbers like `array[-1]`

## 2.0.0-alpha.154

- Include precompiled browser-version of library to make it work with jspm
- Fix issue with html parser
- Fix issue with `<input value=...>` not working in certain cases
- Add optional static file serving for `imba serve`

## 2.0.0-alpha.153

- Fix issue with prop watchers not compiling correctly

## 2.0.0-alpha.152

- Correctly parse comments inside multi-line tag literals
- Readable names for generated (internal) variables
- Tag literals act as block scopes for variable declarations

## 2.0.0-alpha.151

- Fix interpolated style values in tag-tree selectors

## 2.0.0-alpha.150

- Remove charset:utf8 option from esbuild

## 2.0.0-alpha.149

- Fix regression with font-size presets (#569)

## 2.0.0-alpha.148

- Allow declaring return type via `def method\returntype arg1, ...`
- Fix crash when inlining sourcemaps on node 16+ (#567)
- Overhaul `extend class` code generation for better tooling support
- BREAKING: Compile predicate identifiers `name?` to unicode `nameΦ` and
  dashed identifiers `one-two-three` to `oneΞtwoΞthree` to avoid potential
  naming collisions and improve tooling support. If you previously relied on
  dashed identifiers converting to camelCase while interacting with an
  external library - this will no longer work. Ie `window.add-event-listener`
  will not work since `window` does not have an `addΞeventΞlistener` property.
  See [#568](https://github.com/imba/imba/pull/568) for more info.

## 2.0.0-alpha.147

- Fix regression resulting in nested assets being rebuilt in incorrect folder

## 2.0.0-alpha.146

- Added `--asset-names` and `--html-names` build options for controlling the generated paths
- Tweaked format of generated manifest
- Fixed issue with generated stylesheets being blank
- Automatically include Link preload headers when serving through imba
- Allow all valid RegExp flags in literal regexes
- Generate class augmentations (`extend class/tag`) in tsc mode
- Use setAttribute for non-idl element attributes

## 2.0.0-alpha.145

- Fix bundler crash when parsing html entrypoints with doctype
- Fix regression where imba `-w` would not detect changes in unhashed outputs

## 2.0.0-alpha.144

- Experimental `<global>` slot to add global listeners from inside tags
- `@event.outside` modifier that works in conjunction with `<global>` slot

## 2.0.0-alpha.143

- Remove use of String#replaceAll (unsupported before node 15.0.0)

## 2.0.0-alpha.142

- Don't crash when loading tags with `@intersect` listener on server
- Fix svg parsing issue for large svg files (#543)
- Fix incorrect dehydration when creating custom element on client directly via document.createElement
- Inject asset imports in correct order relative to regular imports
- Add support for `.eot` font file reference in stylesheets
- Auto-generate combined stylesheet for server and client accessible via `<style src='*'>`
- Stop auto-injecting styles for referenced assets when rendering `<html>` on server

## 2.0.0-alpha.141

- Support webp,avif,apng,gif images in bundler
- Fixed missing first character in non-minified css output
- Expose imba.commit++ on globalThis
- Fix compilation issue with `if false` inside tag tree
- Respect custom palettes in imbaconfig.json when building
- Allow aliasing palettes in imbaconfig.json
- Support inlined svg elements on server

## 2.0.0-alpha.140

- Improve output from `imba create`

## 2.0.0-alpha.139

- Stop bundler from crashing when generating worker

## 2.0.0-alpha.138

- Fix incorrect sourcemap paths with esbuild 0.9.7
- Let server fail gracefully when accessing invalid asset urls

## 2.0.0-alpha.137

- Fix relative path for mac/linux

## 2.0.0-alpha.136

- Raise default browser-target from `edge16` to `edge18` due to esbuild warning
- Make `imba create` executable on mac (#550)
- Set default esbuild target to es2019 to transpile optional chaining++
- Avoid using `-ad` in generated class-names due to adblockers (#531)

## 2.0.0-alpha.135

- Minor improvements to sourcemapping
- Fixed `import type default` compilation

## 2.0.0-alpha.133

- Improved sourcemapping
- Improved support for type annotations
- Fixed crash in bundler

## 2.0.0-alpha.132

- Improve windows compatibility for bundler and `imba create`

## 2.0.0-alpha.131

- Serve hashed (cacheable) assets with `Cache-Control: max-age=31536000`
- Remove `?v=xxxxxx` suffix from asset references generated with `--no-hashing`
- Allow `"external":["builtins",...]` to externalize builtin node modules for other platforms than `node`
- Add `-H` alias for the `--no-hashing` option

## 2.0.0-alpha.130

- Upgraded esbuild to v0.9.2
- Automatically polyfill built-in node modules like buffer,stream,crypto etc when compiling for browser. Still experimental.

## 2.0.0-alpha.129

- Prevent `touchstart` event on iPad Pro in `@touch.prevent`
- Fixed text in svg `<text>` elements (#482)

## 2.0.0-alpha.128

- Fixed image asset urls in SSR
- Make bundler work with client entrypoint without any styles
- Dispatch bubbling `resized` event from ResizeObserver

## 2.0.0-alpha.127

- Overhauled `@touch` to work be more consistent on touch devices
- Add `@touch.round` event modifier

## 2.0.0-alpha.126

- Prevent `touchstart` event on iOS in `@touch.prevent`

## 2.0.0-alpha.125

- Make custom events cancelable by default
- Make `@-webkit-scrollbar-*` style selectors work
- Make core event modifiers work for `@touch` event
- Fix issue where text selection did not work after `@touch`
- Make `@touch.prevent` prevent scrolling via `touch-action:none`
- Add `@important` style modifier

## 2.0.0-alpha.124

- Update built-in colors to follow Tailwind 2.0
- Allow interpolating colors in runtime `<div[c:{mycolor}]>`
- Fix deep selector `>>>` with multiple nested children

## 2.0.0-alpha.123

- Fix router crashing when event-related runtime code is tree-shaken

## 2.0.0-alpha.122

- Fix issue with type inferencing tags in certain cases
- Add `suspend`, `unsuspend` component lifecycle methods
- Improved router interface & internals

## 2.0.0-alpha.121

- Added `imba.serve` to `index.d.ts`
- Fix serious regression in router causing crash

## 2.0.0-alpha.120

- Parse `fn await something` correctly
- Improved router internals
- Add internal `Node#attachToParent` and `Node#detachFromParent` methods
- Preserve signed zero in output (Fixes #497)
- Make hmr reloading work with raw html assets
- Make `--no-hashing` cli option actually work
- Build html entrypoints in correct dist folder
- Add `imba create` command for creating project from template

## 2.0.0-alpha.119

- Add support for object spread syntax `{a:1, ...obj}`
- Fix regression causing crash when generating css

## 2.0.0-alpha.118

- Only call imba.commit when events are actually handled

## 2.0.0-alpha.117

- Alias `tabindex` to `tabIndex` in tag attributes.
- Fix scoping issue with css in tag trees
- Add experimental router aliases/redirects support
- Include preflight.css at root level of package

## 2.0.0-alpha.116

- Convert durations (`1s`, `150ms`, `60fps` etc) to ms-based numbers on compile-time

## 2.0.0-alpha.115

- Add `debounce` event modifier

## 2.0.0-alpha.114

- Add `no-minify` option to cli
- Always compile `html` namespaced attributes to raw `setAttribute`

## 2.0.0-alpha.113

- Add `__realname` as an unaltered alias for `__filename`
- Add support for selectors in tag tree - see [#490](https://github.com/imba/imba/issues/490)

## 2.0.0-alpha.112

- Show full version (including alpha number) in cli `imba --version`

## 2.0.0-alpha.110

- Add experimental `<tag autorender=interval>` inteface
- Add `?v=hash` to asset urls when filename hashing is turned off
- Add experimental support for `.html` entrypoints to `imba serve` and `imba build`
- Add `abs` and `rel` shorthands for `position` style property
- Fix memory leak when using `imba --watch`

## 2.0.0-alpha.109

- Support extending native tags `tag Purchase < form`
- Allow defining global tags without dash in name

## 2.0.0-alpha.108

- Fix issue with `@nth-of-type`, `@nth-child` selectors
- Improve internals of intersect event handling

## 2.0.0-alpha.107

- Add `asset.body` property for accessing raw content of assets

## 2.0.0-alpha.106

- Allow passing `rootMargin` options to intersect event
- Fix issue in router related to hash links

## 2.0.0-alpha.105

- Fix issue with css property order

## 2.0.0-alpha.102

- changelog and docs coming soon. see imba.io

## 2.0.0-alpha.60

- Add `route-to.exact` modifier to router

## 2.0.0-alpha.59

- Add support for numeric separator `100_000`
- Fix multiline regex parsing issues

## 2.0.0-alpha.58

- Allow setting innerHTML in SSR

## 2.0.0-alpha.57

- Update instantiation syntax in tests++

## 2.0.0-alpha.56

- Add `new Foo` instantiation syntax
- Deprecate `Foo.new` instantiation syntax

## 2.0.0-alpha.55

- Allow local/exportable tags (uppercased tag declarations)
- Allow interpolated tags inside strings in tag trees

## 2.0.0-alpha.54

- Allow getters and setters in object literals

## 2.0.0-alpha.53

- Allow media breakpoints in style selectors
- Added max-width breakpoints

## 2.0.0-alpha.52

- Fix issue with nested `$reference` selectors
- Allow router to work for regular links
- Add route-to.replace modifier
- Add route-to.sticky modifier

## 2.0.0-alpha.51

- No longer inheriting from CustomEvent as it is not supported in Safari
- Fix input data binding issue
- Added `before` and `after` style property modifiers
- Added `prefix` as alias for `before.content`
- Added `suffix` as alias for `after.content`

## 2.0.0-alpha.50

- Fix nested selector bug
- Fix focus-within modifier
- Add `:local` pseudo-class for only styling local children of component
- Support `$reference` in selectors for targeting local referenced elements
- Change `display` style property to accept multiple layout aliases
- Add 1-digit color aliases (blue900 -> blue9 etc)

## 2.0.0-alpha.49

- Allow border and border-(top|right|bottom|left) to accept a single color value
- Accept rgb/hsl/hex colors in text and border properties

## 2.0.0-alpha.48

- Added multi-purpose `text` style property for describing font-family, font-size, font-style, font-weight, text-decoration, text-transform, line-height, letter-spacing and color in a single property
- Added shorthand style aliases for border-_ and flex-_

## 2.0.0-alpha.47

- Added x, y, z, rotate, scale, scale-x, scale-y, skew-x, skew-y custom style properties
- Extended transition property to accept colors, styles, sizes as properties and custom easings

## 2.0.0-alpha.46

- Added experimental syntax for css/styling. See [#334](https://github.com/imba/imba/pull/362)
- Broke scoped css comment blocks until further notice

## 2.0.0-alpha.45

- Fix conditional rendering bug (#334)
- Changed event syntax from `<div :click.stop.{method()}>` to `<div @click.stop=method()>`
- Allow comments inside multiline tags
- Include left/right event key modifiers
- Improve resize and intersect events
- Always bind data when using `<tag[my-data]>` syntax

## 2.0.0-alpha.44

- Improved lifecycle methods for components
- Fix sourcemapping for env-flags

## 2.0.0-alpha.43

- Add syntax for element references `<div$reference>`
- Fix problem with missing ResizeObserver in safari

## 2.0.0-alpha.42

- Fixed webpack imba/loader issues with scoped css
- Add event wrapper for ResizeObserver
- Add experimental router code
- Add basic support for setting dom classes outside of templates
- Allow calling imba.mount with a function
- Rename #context api to $context
- Rename parentContext to $parent

## 2.0.0-alpha.40

- Introduce decorators with `@decorator` syntax. See [#334](https://github.com/imba/imba/pull/334)
- Allow declaring tag attributes. See [#335](https://github.com/imba/imba/pull/335)
- Shorthand `!` for invoking parenless methods (`object.mymethod!`)
- Implicit self is back (for good)

## 2.0.0-alpha.0

See [#263](https://github.com/imba/imba/issues/263) for an overview of changes
