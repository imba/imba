# Grammar

## Variables

### Declaring variables

Variables are declared, as in modern javascript, using the `let` and `const` keywords. `let` variables can be changed through reassignment, while `const` variables are readonly after the initial declaration. Unlike javascript, multiple declarations per line is not allowed.

```imba
# readonly constant
const one = 123

# single declaration
let a = 123

# array destructuring
let [e,f,...rest] = [1,2,3,4,5]

# object destructuring
let {g,h,data:i} = {g:1,h:2,data:3}

# in conditionals
if let user = array.find(do $1 isa Person)
	yes
```

> [tip box yellow] In all the examples throughout this documentation you can hover over an identifier to highlight all references to the variable. Identifiers resolving to variables have a different color than identifiers resolving as implicit accessors of self.

## Scoping

### Lexical Scopes

`if`, `elif`, `else`, `do`, `for`,`while`,`until`,`switch`,`do` create block scopes. This means that any variable declared in the indented code inside these statements are only available within that scope.

```imba
# global scope
let x = 1
if true
	# block scope
	let y = 2
y # not a variable in scope
```

### This vs Self

If you come from js, `this` will be a well-known concept. While `this` still exists, working exactly like its js counterpart, `self` is what you should use in imba. It is a very common pattern in js to need to refer to an outer scope when dealing with callbacks, event listeners and more.

```javascript
setup(){
	var self = this;
	[1,2,3].map(function(){
		self.doSomething();
	})
}
```

This is essentially what `self` does under the hood. In imba, `self` is bound to the closest _selfish_ scope. Besides the root scope of a file, only the scopes of `def`, `get` and `set` are selfish.

```imba
class Item
	def setup
		# selfish scope
		[1,2,3].map do |val|
			# selfless scope
			self # the Item
			this # the array
```

If this looks confusing, fear not – `this` is something you will practically never see or use in imba codebases.

### Implicit Self

Imba uses the concept of implicit self. A lone, lowercase identifier will always be treated as an accessor on `self` unless a variable of the same name exists in the current scope or any of the outer scopes.

```imba
const scale = 1
class Rectangle
    def check forced
        forced # found variable named arg - no implicit self
        scale # found in scope! - no implicit self
        width # no variable - equivalent to self.width
        normalize! # not found - method call on self

```

Self is also implicit when setting properties.

```imba
let changes = 0
class Line
    def expand
        changes += 1 # changes += 1
        width += 10 # self.width += 10
```

Self always refers to the closest _selfish_ scope, and lone identifiers not declared in the lexical scope are treated as properties on self. **Uppercased identifiers are not treated as accessors**. So `Array`, `Map`, or `SomeIdentifier` will always resolve the same way they do in JavaScript.

### Global variables [wip]

<!-- Mention the globals. -->

### Variable hoisting

Variables are _not_ hoisted in Imba. This means that a reference to a variable before its declaration will behave is if there is no declaration - and instead be an implicit access on self.

```imba
def method
	data # not in scope - same as self.data
	let data = {a:1,b:2}
	data # in scope
```

## Identifiers

In imba, identifiers are case-sensitive and can contain Unicode letters, `$`, `_`, `-`, and digits (`0-9`), but may *not* start with a digit. 

An identifier can end with `?` to make it a predicate identifier, thus helping make clear that the value should resolve to a boolean `get empty? do !array.length`. See [Predicate filters](#identifiers-predicate-identifiers)

`$0 .. $n` are reserved identifiers used as shorthands for function arguments with $0 refering to the set of arguments. See [Identifiers with special meanings](#identifiers-identifiers-with-special-meanings)

Like css and html, dashes inside identifiers are perfectly valid in Imba and is often preferred for readability and that it allows to easily skip to each segment of the identifier. They are compiled to use the greek symbol Ksi `Ξ` in javascript to be valid but avoid conflict. 

### Predicate Identifiers

Imba also allows `?` at the end of identifiers for methods, properties, and variables. These are predicate identifiers  and should represent a boolean value. They are used to represent a checkable state and provides improved readability over other approaches like predicate prefixes like `isEmpty`.

```imba
tag sized-list
    items = []
    size = 10

    get empty? do !items.length
```

### Identifiers with special meanings

There are a few identifiers that are reserved as keywords in certain contexts. `get`, `set` and `attr` are perfectly valid to use as variables, arguments, and properties, but in class definitions they have a special meaning.

Also, identifiers `$0`, `$1`, `$2` and so forth are not valid variables names – as they refer to the nth argument in the current function. `$0` is an alias for `arguments` from js, and refers to all the arguments passed into a function.

```imba
# $(n) is a shorter way to reference known arguments
['a','b','c','d'].map do $1.toUpperCase!
['a','b','c','d'].map do(item) item.toUpperCase!
```

### Global Identifiers

Identifiers starting with an uppercase letter are global-first, meaning that they will not be implicitly scoped.

> Example showing global identifiers vs local identifiers

### Symbol Identifiers [wip]

[Symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) are values that programs can create and use as property keys without risking name collisions. In Imba symbol identifiers start with one or more `#` in the beginning of the identifier. So `#name` is a type of identifier representing a symbol. Symbol identifiers are not allowed as variable names, and are always scoped to the closest strong scope.

```imba
const obj = {name: 'Jane', #clearance: 'high'}
obj.name
obj.#clearance
```

### Using reserved keywords

Essentially all reserved keywords can still be used as properties.

```imba
a.import
a['import']
a = { import: 'test' }
```