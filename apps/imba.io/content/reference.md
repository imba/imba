# /api

Imba compiles to JavaScript. In the context of APIs you can think of it like TypeScript or CoffeeScript, it naturally supports every class, method and property that you know from JS. This reference is not complete, and will link out to MDN for extensive descriptions of Web APIs.

## imba

The global `imba` object contains functions, constants and classes that are included with Imba. Imba also extends the built-in `Element` with certain properties. All items that are imba-specific are marked with a ★ symbol throughout the documentation.

### Properties

<api-list>imba.own.variables</api-list>

### Functions

<api-list>imba.own.functions</api-list>

### Decorators

<api-list>imba.own.decorators</api-list>

### Interfaces

<api-list>imba.own.interfaces</api-list>

## Global interfaces

<api-list>own.interfaces</api-list>

# /docs/css/properties/display

The display CSS property sets whether an element is treated as a block or inline element and the layout used for its children, such as flow layout, grid or flex.

In addition to the regular display values, Imba defines a bunch of shorthands for common layouts. For flexboxes you
can quickly declare most flex-layouts using a three-letter alias, where the first letter denotes [v]ertical or [h]orizontal. The second character denotes the vertical aligment, and the third character denotes the horizontal alignment.

### Regular display values
[demo](/examples/css/display.basic.imba?preview=styles)
> All regular display properties works just like in css.

### Shorthands for flex-direction:column layouts 
[demo](/examples/css/display.imba?preview=styles)

### Shorthands for flex-direction:row layouts
[demo](/examples/css/display.h.imba?preview=styles)


## Values

<api-list>css.display.all.cssvalues ^[^-]</api-list>

# /docs/css/properties/align-items

<api-list>css.align-items.all.cssvalues ^[^-]</api-list>

# /docs/css/values/timing-function

<api-list>style.type.timing-function ^[^-]</api-list>

# /docs/css/properties/font-weight

```imba
# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-1'}

# ---
css .demo-1 fw:100
css .demo-2 fw:900
css .demo-3 fw:normal
css .demo-4 fw:bold
css .demo-5 fw:lighter
css .demo-6 fw:bolder
# ---

imba.mount do <.inline-demo.typography> <div.{vars.flag}> 'Text'
```

# /docs/css/properties/margin



# /docs/css/properties/color

> For the actual list of built-in colors and more, see **[Colors](/docs/css/colors)**

# /api/Element/@touch

To make it easier and more fun to work with touches, Imba includes a custom touch event that combines `pointerdown` -> `pointermove` -> `pointerup` in one convenient handler, with modifiers for commonly needed functionality.

# /api/imba/commit

The default approach of Imba is to re-render the mounted application after every handled DOM event. If a handler is asynchronous (using await or returning a promise), Imba will also re-render after the promise is finished. Practically all state changes in applications happen as a result of some user interaction.

In the few occasions where you need to manually make sure views are updated, you should call `imba.commit`. It schedules an update for the next animation frame, and things will only be rerendered once even if you call `imba.commit` a thousand times. It returns a promise that resolves after the actual updates are completed, which is practical when you need to ensure that the view is in sync before doing something.

#### commit from websocket

```imba
socket.addEventListener('message',imba.commit)
```

Calling `imba.commit` after every message from socket will ensure that your views are up-to-date when your state changes as a result of some socket message.

#### commit after fetching data

```imba
def load
    let res = await window.fetch("/items")
    state.items = await res.json!
    imba.commit!
```

# /api/imba/locals

`locals` is an instance of a JavaScript Proxy object that provides a convenient and efficient way to interact with the global `localStorage`. It wraps around a `Storage` instance, which in turn wraps around the `localStorage` object.

### Usage

#### Getting a Property

You can get a property from `locals` by simply accessing it like `imba.locals.prop`. This will call the getItem method of the Storage class, which retrieves the value from the `localStorage` (if it exists), or from the cache if it's already been retrieved before.

```imba
let value = imba.locals.prop
```

#### Setting a Property

You can set a property on `locals` by simply assigning a value to it like `imba.locals.prop = value`. This will call the `setItem` method of the `Storage` class, which stores the value in the `localStorage` and also updates the cache.

```imba
imba.locals.prop = 'value'
```

#### Deleting a Property

You can delete a property from `locals` by using the `delete` keyword like `delete locals.prop`. This will call the `deleteProperty` method of the `Storage` class, which removes the value from the `localStorage` and also deletes it from the cache.

```imba
delete imba.locals.prop
```

### Applying a Function

You can create a separate namespace or a sub-storage within your `localStorage` by calling it like imba.locals(name). This will call the `apply` method of the `Storage` class, which returns a child Proxy object associated with the given name.

Here's an example of how you can use this feature:

```imba
let child = imba.locals('childName')
child.prop = 'value'
```

# /api/imba/session

Documentation coming

# /docs/css/properties/hue

In addition to the default [built in colors](/docs/css/values/color), `hue0`,`hue1`,`...`,`hue9` refers to the color scale set by the `hue` property. Setting `hue:amber` in css, will make `hue2` refer to `amber2` inside all elements that are affected by this style. The `hue(n)` color values supports an alpha value with the forward-slash syntax like `hue4/40`

### Syntax

```imba
<div[hue:violet color:hue4]>
```

### Usage

Let's say you have a button component with some basic styles:

```imba
# [preview=md]
import 'util/styles'
global css body d:hflex ja:center inset:0
# ---
tag Button
    css px:4 py:2 rd:md cursor:pointer c:white
        text-shadow:0px 1px blue8/70
        bg:blue5 @hover:blue6
        bd:1px solid blue6

    <self> <span> <slot>

imba.mount do <Button> "Button"
```

This is all fine, but what if you want to also have a red button, and a green button? Duplicating all the styles involving colors is impractical, especially if you change the design of the button later. With `hue`, we can replace `blue2` with `hue2`, `blue8/70` with `hue8/70` and so on. Then we can set the color scale using the `hue` property.

```imba
# [preview=md]
import 'util/styles'
global css body d:hflex ja:center inset:0
# ---
tag Button
    css px:4 py:2 rd:md cursor:pointer c:white
        text-shadow:0px 1px hue8/70
        bg:hue5 @hover:hue6
        bd:1px solid hue6

    <self> <span> <slot>

imba.mount do <>
    <Button[hue:blue]> "Button"
    <Button[hue:red]> "Button"
    <Button[hue:green]> "Button"
    <Button[hue:amber hue@hover:purple]> "Hover me"
```

# Style Properties [href=/api/css/properties]

Custom page for style properties here!

# [href=/api/Element/%23parent]

This is some documentation for the parent!

# /api/Element/data

### Syntax

```imba
<element data=value>
```

## Usage

The default convention in imba is to use the data property on elements to pass in the state/data they are supposed to represent. In this example we pass in the movie object through the data property:

```imba
tag movie-item
    # using references to data
    <self> <em> data.title

<div> for movie in movies
    <movie-item data=movie>
```

However, **there is nothing special about the data property**, besides it being declared for all elements. It is just a plain property. If you prefer to use more descriptive properties you are free to do so:

```imba
tag movie-item
    movie
    # using references to data
    <self> <em> movie.title

<div> for movie in movies
    <movie-item movie=movie>
```

Declaring the property with `prop movie` is not strictly needed, but will give you auto-completions and get rid of warnings about a missing `movie` property in the tooling.

### Type annotations

When you are dealing with known data-structures it can be useful to set the type of the data property for better auto-completions and warnings:

```imba
tag movie-item
    data\Movie
    <self> <em> data.title

<div> for movie in movies
    # will warn if movie is not of type Movie
    <movie-item data=movie>
```

### Convenience getters

Sometimes when working with complex data objects it might be useful to define some getters to alias nested properties of your data.

```imba
tag movie-item
    data\Movie
    get director do data.director
    get genres do data.genres

    <self>
        <em> data.title
        <a href="/people/{director.id}"> director.name
        <div> for genre in genres
            <span> genre.title
```

### Overriding

If you want to do something when setting data, you can easily create a setter and getter:

```imba
tag movie-item
    set data value
        #data = value
        console.log "movie was set",value

    get data
        #data
```

The memoized dom works in such a way that the setter will only be triggered when the value actually changes. If you set the property manually outside of rendering, the setter will be called every time, even if the value has not changed:

```imba
tag app
    <self>
        <div> for movie in movies
            # manually set card.data when clicking an item
            <movie-item data=movie @click=($card.data = movie)>
        <movie-card$card>
```

In this case, the movie-item data setter will only be called when their `data` actually changes, even if we render the list a million times. But if you click a movie-item 10 times, the `movie-card.data` property will be set 10 times. This is only really a challenge if you do something computationally expensive in the `data` setter itself. In that case you can just check if something has changed:

```imba
tag movie-card
    set data value
        if #data != value
            #data = value
            # ... load more info about the movie?

    get data
        #data
```

Since Imba embraces the concepts of memoization we have the `=?` operator that is shorthand for the pattern above.

```imba
if item.propname =? value
    # item.propname is now set to value,
    # and was previously set to something else
    yes
```

# /api/String

```imba
let single = 'single quotes'
let double = "double quotes"
let interpolation = "string has {double}"
let template = `current version is {imba.version}`
```

Imba uses `{}` for string interpolation while JavaScript uses `${}`. If you want interpolated strings with literal curly-braces, remember to escape them with `\`. Other than that, the String type is identical to String in JavaScript. See documentation at [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String).

### Multiline Strings

Regular string literals can be written over multiple lines, but line breaks are ignored.

```imba
let string = 'one
two three'
# => 'onetwo three'
```

If you need a string that spans several lines and includes line breaks, use a sequence of characters surrounded by `'''` or `"""`

```imba
let string = '''
This string is written
over multiple lines
'''
# => 'This string\nis written over\nmultiple lines'
```

Multiline strings preserves indentation, but only relative to the least indented line:

```imba
let string = '''
    First level is ignored
        This is indented
    Not indented
    '''
```

### Template Strings

```imba
`string text`
# multiple lines
`string text line 1
 string text line 2`
# interpolated expression
`string text {expression} string text`
# tagged template
method`string text {expression} string text`
```

### Tagged templates [tip]

Tagged templates from JavaScript are on the roadmap, but not currently supported.

### Dimension Strings

```imba
let length = 100px
let progress = 87%
let dynamic = (window.innerWidth)px
```

Dimensions are numbers with a unit attached to it. They are compiled and treated as regular strings. When dealing with styles it is nice to be able to write `offset = (point.x)px` instead of `offset = "{point.x}px"`.

Time-based units `ms`, `s`, and `fps` are compiled to millisecond-based numbers.

```imba
10s # 10000
250ms # 250
5s - 150ms # 4850
60fps # 16.66666
```

# /api/Number

```imba
let integer = 42
let float = 42.10
let hex = 0x00
let binary = 0b0010110
```

The Number type is identical to Number in JavaScript. See documentation at [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number).

### Numeric Separators

You can use `_` as a separator inside numbers for improved readability.

```imba
let budget = 120_000_000
let spent = 123_150_077.59
let hex = 0xA0_B0_C0
let binary = 0b0010_1100
```

#### Numeric Constants

```imba
const biggestNum     = Number.MAX_VALUE
const smallestNum    = Number.MIN_VALUE
const infiniteNum    = Number.POSITIVE_INFINITY
const negInfiniteNum = Number.NEGATIVE_INFINITY
const notANum        = Number.NaN
```

#### Durations

Numbers with time units `ms`, `s`, and `fps` are normalised to milliseconds.

```imba
10s # 10000
250ms # 250
5s - 150ms # 4850
60fps # 16.66666
```
