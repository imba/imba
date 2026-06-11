# Variables

Variables are declared using the `let` and `const` keywords. `let` variables can be changed through reassignment, while `const` variables are readonly after the initial declaration. Unlike javascript, multiple declarations per line is not allowed.

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

## Implicit Self

Any identifier starting with a lowercase letter or `$` that is not previously declared will be treated as an accessor on `self`. This is a crucial concept to understand, especially when coming from JavaScript, where any undeclared variable implicitly refers to the global scope.

```imba
let declared = yes
declared # => yes
undeclared # => the same as this.undeclared
```

As you can see from the examples in this documentation, implicit accessors and resolved variables are highlighted with different colors. This type of semantic highlighting is also supported in the [vscode tooling](https://marketplace.visualstudio.com/items?itemName=scrimba.vsimba).

```imba
const scale = 1

class Rectangle
    def check forced
        forced # found variable named arg - no implicit self
        scale # resolves to variable declared in root
        width # implicit self (no variable named width)
        self.width # explicit self
```

If this concept feels strange and unknown, feel free to explicitly use `self.` as you would in js.

> [tip] Uppercased identifiers are not treated as accessors. So `Array`, `Map`, or `SomeIdentifier` will always resolve the same way they do in JavaScript.

Variables are _not_ hoisted in Imba. This means that a reference to a variable before its declaration will behave is if there is no declaration - and instead be an implicit access on self.

```imba
def method
	data # not in scope - same as self.data
	let data = {a:1,b:2}
	data # in scope
```

## Global variables

In addition to identifiers starting with an uppercase letter, there are a few global variables that are always resolved.

<api-list>imba.Globals.own.properties</api-list>
<api-list>imba.Globals.own.methods</api-list>

These identifiers will **not** use implicit self, since they are resolved as global variables. This means that if you have an object with a property `window` or a method named `setTimeout`, you will need to use `self.` when referencing them.

```imba
class Loader
    window

    def setup
        window # Ooops, reference to the global window
        self.window # Pheew, reference to Loader.window
```

## Block Scopes

`if`, `elif`, `else`, `do`, `for`,`while`,`until`,`switch`,`do` create block scopes. This means that any variable declared in the indented code inside these statements are only available within that scope.

```imba
# global scope
let x = 1
if true
	# block scope
	let y = 2
y # not a variable in scope
```

## This vs Self

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