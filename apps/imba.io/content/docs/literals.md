

# Literal Types

A good way to think of Imba is, "it’s just Javascript". Imba compiles directly to readable JavaScript. This means that every native type with all of their methods, properties and behaviour are the exact same. So, strings are just strings, arrays are just arrays etc. Mozilla Developer Network is a great place to look up extensive documentation for these things.

## Strings

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

## Numbers

```imba
let integer = 42
let float = 42.10
let hex = 0x00
let binary = 0b0010110
```

The Number type is identical to Number in JavaScript. See documentation at [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number).

#### Numeric Separators

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

## Arrays

##### Array Literal

```imba
[1, 2, 3, 4]
```

Arrays can also be declared over multiple lines, where the value of each line represents an entry in the array. Commas are optional when array elements are separated by line breaks.

```imba
const array = [
    'one'
    'two'
    'three'
    'four'
]
```

## Objects

##### Syntax

```imba
let object = {a: 'foo', b: 42, c: {}}
console.log(object.a) # => 'foo'
```
Set dynamic keys using `[]`
```imba
let field = 'age'
let person = {name: 'Bob Smith', [field]: 32, gender: 'male'}
console.log(person.age) # => 32
```

##### Indented

```imba
let person =
    name: 'Bob Smith'
    age: 32
    gender: 'male'
console.log(person.name) # => 'Bob Smith'
```

##### Dot notation

```imba
let person = {name: 'Bob Smith', age: 32, gender: 'male'}
# ---
person.name
person.age = 33
```

##### Bracket notation

```imba
let person = {name: 'Bob Smith', age: 32, gender: 'male'}
# ---
person['name']
person['age'] = 33
```

##### Destructuring

```imba
let a = 'foo'
let b = 42
let c = {}
let object = {a,b,c}
console.log(object) # => {a: 'foo', b: 42 c: {}}
```

## Booleans

```imba
let bool1 = true
let bool2 = yes # alias for true
let bool3 = false
let bool4 = no # alias for false
```

## Null

```imba
let value = null
```

The value `null` represents the intentional absence of any object value. It is one of JavaScript's primitive values and is treated as falsy for boolean operations.

## Undefined

The global `undefined` property represents the primitive value `undefined`. A variable that has not been assigned a value is of type undefined

### Strict equality

Strict equality syntax in Imba is the same as in Javascript.

```imba
0 == '0'  # true
0 === '0' # false
```

## Regular Expressions

The RegExp object is used for matching text with a pattern. Read more at [MDN RegExp Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp). For an introduction to regular expressions, read the [Regular Expressions chapter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) on MDN.

##### Literal

```imba
let regex = /ab+c/i
```

##### Constructor

```imba
let regex = new RegExp('ab+c', 'i')
```

##### Multiline

```imba
let regex = ///
    ab+ # allows comments and whitespace
    c
///
```

## Ranges

Ranges are written like `[0...10]` and can be used to loop through the specified values

```imba
result = ""
for i in [1...5]
    result = "{result}, "

result # => 1, 2, 3, 4
```

## Tags

One of the most unique features of Imba is that DOM elements are true first-class citizens of the language. Read the [Rendering](/tags/basic-syntax) section to learn all about it.

```imba
let myElement = <div.foo title="Greetings"> "Hello World"
```

