# Control Flow

## For-In Loops

For in is the basic syntax for looping through arrays and any other object that has a `length` property and allows accessing their members through `object[index]`. This includes `Array`, `NodeList`, `DOMTokenList`, `String` and more. It was created before `for of` iterables became standard in ES2015, but is still a practical alternative to using `for of` in many cases. Imba `for in` is not to be confused with `for in` [in javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in).

```imba
for num in [1,2,3]
    num * 2
```

### Index parameter

If you include a second parameter in the source it will automatically refer to the index of the current iteration.

```imba
for num,index in [1,2,3]
    console.log num * index
# => [1,4,9]
```

### Stepping with `by`

To step through an iterable in fixed-size chunks, use `by`

```imba
# go through every other element
for num in [1,2,3] by 2
    num * 2
```

### Filtering with `when`

You can include a condition using the `when` clause. This will make sure the iteration only executes for members that match said condition.

```imba
# go through every other element
for num,i in [1,2,3] when i % 2
    console.log num
```

### For-In with ranges

```imba
# from 0 up to (including) 3
for num in [0 .. 3]
    num
# => [0,1,2,3]
```

```imba
# from 0 up to (excluding) 3
for num in [0 ... 3]
    num
# => [0,1,2]
```

> Ranges **must include spaces** around `..` and `...`

### For-In with non-arrays

When Imba cannot infer that an object is an array during compilation it will behind the scenes look for a `toIterable` method on the object before looping. This way one can make any type of object easily support being iterated using a `for in` loop.

```imba
class LabelString
    def constructor label
        label = label

    def toIterable
        console.log 'called toIterable'
        label.split(',')

let labels = new LabelString 'idea,proposal,duplicate'

for label in labels
    console.log label.toUpperCase!
```

## For-Of Loops

The for...of statement creates a loop iterating over iterable objects, including: built-in String, Array, array-like objects (e.g., arguments or NodeList), TypedArray, Map, Set, and user-defined iterables. This maps directly to `for of` [in javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of) with a few convenient additions.

### Iterating over an `Array` [preview=console]

```imba
let iterable = [10,20,30]
for value of iterable
    console.log value
```

### Iterating over a `String` [snippet] [preview=console]

```imba
let iterable = 'imba'
for value of iterable
    console.log value
```

### Iterating over a `TypedArray` [snippet] [preview=console]

```imba
let iterable = new Uint8Array([0x00,0xff])
for value of iterable
    console.log value
```

### Iterating over a `Map` [snippet] [preview=console]

```imba
let iterable = new Map([['a',1],['b',2],['c',3]])
for entry of iterable
    console.log entry

# destructuring
for [key,value] of iterable
    console.log value
```

### Iterating over a `Set` [snippet] [preview=console]

```imba
let iterable = new Set([1, 1, 2, 2, 3, 3])
for value of iterable
    console.log value
```

### Iterating over the arguments object [snippet] [preview=console]

```imba
def fn
    for arg of arguments
        arg * 2
console.log fn(1,2,3) # => [2,4,6]
```

### Iterating with index parameter

In Imba you can supply a second parameter to `for ... of`. This will be populated with the current iteration number (starting at 0), just like the second argument in `Array#map` and `Array#forEach`.

```imba
let iterable = new Map([['a',1],['b',2],['c',3]])
for entry,idx of iterable
    console.log entry,idx
for [key,value],idx of iterable
    console.log key,value,idx
```


### For-Own-Of

A pretty common need is to loop through the key-value pairs of objects. The default recommended way to do this in JavaScript is:

```javascript
let obj = { a: 1, b: 2, c: 3 };
for (const [key, value] of Object.entries(obj)) {
	console.log(`${key}: ${value}`);
}
```

Since this is a common pattern - Imba has specific support for this using `for own ... of`. This statement creates a loop iterating over key-value pairs of objects.

```imba
let obj = {a: 1, b: 2, c: 3}
for own key,value of obj
    console.log "{key} is {value}"
```

## While Loops

Executes repeatedly as long as condition is truthy.

```imba
let ary = [1,2,3]
while let item = ary.pop!
    console.log item
```

## Until Loops

Executes repeatedly **until** condition is truthy.

```imba
let ary = [1,2,3]
until ary.length == 0
    console.log ary.pop!
```

## Continue

`continue` is supported in all loop types (`for in`, `for of` and `for own of`)

```imba
let res = for num in [1,2,3,4,5]
    continue if num == 3
    num * 2
console.log res # [2,4,8,10]
```

```imba
let res = for num in [1,2,3,4,5]
    break if num == 3
    num * 2
# => [2,4]
```

### Continue with value

When supplying an argument to continue, this value will be added to the resulting array, essentially like an early return would do in an `Array#map` function.

```imba
let res = for num in [1,2,3,4,5]
    continue -1 if num == 3
    num * 2
# continue with an argument acts like early return within Array#map
# => [2,4,-1,8,10]
```

## Break

`break` is supported in all loop types (`for in`, `for of` and `for own of`)

```imba
let res = for num in [1,2,3,4,5]
    break if num == 3
    num * 2
# => [2,4]
```

### Break with value

You can also supply an argument to break. When supplying an argument to break, this value will be added to the resulting array. This is especially useful when you want to return until some condition is met, but also want to include the item at which condition was met.

```imba
let res = for num in [1,2,3,4,5]
    break -1 if num == 3
    num * 2
```

## Conditionals

### If [snippet]

The if statement executes the indented code if a specified condition is truthy.

```imba
# indented
if condition
    console.log 'yes!'
```

### Unless [snippet]

The unless statement executes the indented code if a specified condition is _not_ truthy.

```imba
unless condition
    console.log 'condition was not truthy'
```

> The unless statement executes the indented code if a specified condition is _not_ truthy.

### Else [snippet]

If the condition is falsy, code inside the connected else block will execute.

```imba
if condition
    console.log 'yes!'
else
    console.log 'no!'
```

### Chaining conditionals [snippet]

To conveniently chain multiple conditionals, use `elif`. No `elif` or `else` statements will be executed after the first truthy condition.

```imba
if expr > 10
    console.log 'over 10'
elif expr > 5
    console.log 'over 5'
elif expr
    console.log 'not falsy'
```

### Trailing condition [snippet]

If & unless can also be used at the end of a single line expression

```imba
console.log 'yes' if condition
console.log 'no' unless condition
```

### Ternary operator [snippet]

The [Ternary operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator) is a useful way to write compact if / else statements.

```imba
condition ? console.log('yes!') : console.log('no!')
```

## Switch

```imba
switch value
    when 10
        yes
    when 5
        no
    else
        throw 'nope'
```

## Await

Imba supports the `await` keyword, which compiles directly to async/await in JavaScript. The only difference is that you do not need to mark your functions as async. Any function that contains an await will automatically be compiled to an async function.

```imba await.imba
def load url
    let res = await window.fetch url
    return res.json

let data = await load "/some/url"
```

#### Without await using promises
```imba
def load url
    window.fetch(url).then do(res)
        return res.json

load("/some/url").then do(data)
    # do something with data
```

> async/await is already supported in every major browser. If you are targeting IE11 users you need to babelify the compiled code.

## Error Handling

For error handling you can throw exceptions using the `throw` statement and handle them using the `try` and `catch` statements. Adding a `try` without a `catch` block will silently swallow the error.

```imba app.imba
def run
    # adding a try without a catch block will silently swallow an error
    let test = try Math.rEndom!
    return test # returns undefined as Math.rEndom! is not a function
console.log run! # undefined
```

```imba
def parse input
    try
        return JSON.parse input
    catch e
        console.error "Invalid json passed to parser: ", e.message

parse('<invalid json, error here we come!>')
```
> Invalid json passed to parser:  Unexpected token < in JSON at position 0
