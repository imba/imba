# Identifiers

In imba, identifiers are case-sensitive and can contain Unicode letters, `$`, `_`, `-`, and digits (`0-9`), but may *not* start with a digit. 

An identifier can end with `?` to make it a predicate identifier, thus helping make clear that the value should resolve to a boolean `get empty? do !array.length`. See [Predicate filters](#identifiers-predicate-identifiers)

`$0 .. $n` are reserved identifiers used as shorthands for function arguments with $0 refering to the set of arguments. See [Identifiers with special meanings](#identifiers-identifiers-with-special-meanings)

## Dashed Identifiers
Dashes inside identifiers are perfectly valid in Imba and is often preferred for readability and that it allows to easily skip to each segment of the identifier.

```imba
let my-dashed-var = yes
let object = {dashed-key: 1, other-key: 2}

class Item
    full-name\string

    def rename new-name
        full-name = new-name
```

The only caveat to look out for is that the subtraction operator has to be spaced:
```imba
let number = 100
let wrong = number-items.length # wrong!
let right = number - items.length # right!
```

> [amber] Dashes in identifiers are converted to the greek symbol Ksi `Ξ` when compiled to js.

## Predicate Identifiers

Imba also allows `?` at the end of identifiers for methods, properties, and variables. These are called predicate identifiers and should always represent boolean values. They are used to represent a checkable state and provides improved readability over other approaches like predicate prefixes like `isEmpty`.

```imba
tag sized-list
    items = []
    size = 10

    get empty?
        !items.length
```

Using these types of identifiers is entirely optional, and may feel weird initially.

> [tip] In JavaScript, optional chaining uses the `?.` operator. For optional chaining in Imba, use `..` like `object..some..key`

## Meta Properties

Identifiers that start with with one or more `#` are called meta properties in Imba. Meta properties are implemented as [symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol). They do not show up on an Object using `for in`, `for of`, `Object.getOwnPropertyNames` or `Object.keys`, and they will never conflict with string-based / plain properties on your classes & instances.

```imba
const user = {name: 'Jane', #clearance: 'high'}
user.name # => Jane
user.#clearance # => high
JSON.stringify(user) # => {"name": "Jane"}
```

These properties are especially useful for adding metadata (hence the name) to objects without risking collisions or altering the `public` appearance of the objects. They are used extensively in the imba runtime itself, to extend Element and other core interfaces without fear of conflicts with JS frameworks and libraries.

To access the symbol of a meta property you can call `Symbol.for("#mymetaprop")`.

```imba
const user = {name: 'Jane', #clearance: 'high'}
user.#clearance # => high
user[Symbol.for('#clearance')] # => high
```


## Argument Identifiers

Identifiers `$0`, `$1`, `$2` and so forth are not valid variable names – as they refer to the nth argument in the current function. `$0` is an alias for `arguments` from js, and refers to all the arguments passed into a function.

```imba
# $(n) is a shorter way to reference known arguments
['a','b','c','d'].map do $1.toUpperCase!
['a','b','c','d'].map do(item) item.toUpperCase!
```

## Global Identifiers

Identifiers starting with an uppercase letter are global-first,
meaning that they will not be implicitly scoped.
See [implicit self](/docs/basic-syntax/variables#implicit-self)
for more information.

## Reserved Identifiers

There are a few identifiers that are reserved as keywords in certain contexts. `get`, `set` and `attr` are perfectly valid to use as variables, arguments, and properties, but in class definitions they have a special meaning. Essentially all reserved keywords can still be used as properties.

```imba
a.import
a['import']
a = { import: 'test' }
```
