# Field Descriptors

> [tip box yellow] This is considered an [experimental](/experimental) feature.

Besides [decorators](/docs/decorators) for methods, Imba has a related syntax for fields. A field declared with a *descriptor* hands complete control over how that property is stored, read, and written to an object that you define:

```imba
class Person
	name @string
	age @number(min: 0, max: 150) = 30
	email @string.trim.lowercase
```

There is nothing special about `@string` and `@number` here — they are not built into the language. They resolve to regular methods (or classes) that you define yourself, making this a fully customizable way to create extensible field types at the language level. Frameworks use this to build rich, self-describing models where a single line like `owner @ref(User)` can imply validation, persistence, indexing and more.

## Defining a descriptor

When you declare `age @number`, the `age` property compiles into a getter/setter pair backed by a *descriptor* — an object created the first time the field is accessed. Every read of the property goes through the descriptor's `$get` method, and every write goes through `$set`.

The descriptor is produced by a *factory* — a method named `@number` looked up on the instance itself. Define it in the class, a superclass, or a mixin:

```imba
# [preview=console]
class Model
	def @number options = {}
		const min = options.min ?? -Infinity
		const max = options.max ?? Infinity
		{
			$set: do(value, target, key)
				target[key] = Math.min(Math.max(value, min), max)
			$get: do(target, key)
				target[key]
		}

class Person < Model
	age @number(min: 0, max: 150)

let person = new Person
person.age = 200
console.log person.age # 150
person.age = -20
console.log person.age # 0
```

Since factories are resolved dynamically through the prototype chain, any class in the hierarchy can add new field types, and subclasses can override the ones they inherit. This is the core of the extensibility.

The arguments to `$get` and `$set` are:

- `value` — the value being assigned (only for `$set`)
- `target` — the object instance the field belongs to
- `key` — a unique symbol for this field. Use `target[key]` as the backing storage — it will never collide with other properties.
- `name` — the name of the field as a string (`'age'`)

## Descriptor lifecycle and caching

The descriptor is created lazily on first access, then passed to the runtime which by default caches it on the class prototype. This means **one descriptor object is shared by all instances of the class** — treat it as per-field configuration, not per-instance state. Per-instance data belongs on `target[key]`.

A descriptor can customize this by implementing `$accessor`:

- `$accessor(target, key, name, slot, context)` — called once when the descriptor is first used. `context` is the class prototype and `slot` is the symbol used for caching. Whatever `$accessor` returns is used as the actual accessor. Assign `context[slot] = self` to cache it like the default does, or skip caching to create fresh state per use.
- If the descriptor has no `$init` method, the runtime assigns `$init = $set` — `$init` is used instead of `$set` when a field value is applied during object initialization.

## Arguments and chained modifiers

Arguments in the declaration are passed to the factory:

```imba
age @number(min: 0, max: 150)
```

Descriptors can also be configured with a chain of modifiers after the factory name:

```imba
email @string.trim.lowercase
nick @string.max(20)
```

Each modifier in the chain configures the descriptor object after it is created. For every `.part`:

- If the descriptor has a *method* with that name, it is called with the supplied arguments — `desc.max(20)`.
- Otherwise the name is set as a plain *property* — `desc.trim = yes`, or `desc.max = 20` when an argument is given.

So the chain above is roughly equivalent to:

```imba
let desc = self.αstring! # created via def @string
desc.trim isa Function ? desc.trim! : (desc.trim = yes)
desc.max isa Function ? desc.max(20) : (desc.max = 20)
```

This lets simple descriptors treat modifiers as flags while more advanced ones expose a fluent configuration API — the declaration site looks the same either way.

## Default values

A field with a descriptor can still declare a default value:

```imba
role @string = "member"
retries @number = 3
```

The default is *not* assigned directly. Instead the compiler attaches it to the descriptor as `desc.default` — a function returning the value. When the default is a literal, the raw value is also available as `desc.default.literal`. Your descriptor decides when and how to apply it:

```imba
# [preview=console]
class Model
	def @string
		{
			$set: do(value, target, key)
				value = String(value)
				value = value.trim! if this.trim
				value = value.toLowerCase! if this.lowercase
				value = value.slice(0, this.max) if this.max
				target[key] = value
			$get: do(target, key)
				let value = target[key]
				if value === undefined and this.default
					value = this.default!
				value
		}

class User < Model
	email @string.trim.lowercase
	nick @string.max(3)
	role @string = "member"

let user = new User
user.email = "  Jane@Example.COM "
console.log user.email # jane@example.com
user.nick = "Roberta"
console.log user.nick # Rob
console.log user.role # member
```

Note that inside `$get` and `$set`, `this` refers to the descriptor object itself — which is how the example above can check the `trim`, `lowercase` and `max` settings from the modifier chain.

## Block callbacks

A field declaration can end with a `do` block. The function is attached to the descriptor as `desc.callback`:

```imba
class Order
	total @memo do
		items.reduce(&, 0) do(sum, item) sum + item.price
```

This is how computed / memoized field types receive the function to evaluate — the descriptor decides when to invoke it and how to cache the result.

## Descriptors as classes

If the descriptor name resolves in the lexical scope — a module-level definition or an import — it is instantiated with `new` instead of being looked up as a method. That means a class works directly as a descriptor factory, giving each field its own instance:

```imba
# [preview=console]
class @logged
	def $set value, target, key, name
		console.log "setting {name} to {value}"
		target[key] = value
	def $get target, key
		target[key]

class Doc
	title @logged
	body @logged

let doc = new Doc
doc.title = "Hello" # setting title to Hello
console.log doc.title # Hello
```

Descriptor factories can be exported and imported like any other identifier:

```imba
import {@prop} from 'imba'

class Person
	name @prop
```

Imba ships with an `Accessor` class (the class behind `@prop`) that implements the protocol with sensible defaults, including a `watch` method for observing changes — it is a convenient base class for your own descriptors:

```imba
import {Accessor} from 'imba'

class @tracked < Accessor
	def $set value, target, key, name
		console.log "{name} changed"
		super
```

## Other details

- Field descriptors work in `tag` declarations exactly like in classes.
- `static` fields support descriptors too — the descriptor is cached on the class itself rather than the prototype.
- An arbitrary expression can be used as a descriptor with `@(expression)` — the expression is evaluated (once, lazily) and its result is used directly as the descriptor object.

## Relation to decorators

Both features share the `@name` syntax but do different jobs: [decorators](/docs/decorators) wrap or replace an already-defined *method* by transforming its property descriptor at class-definition time, while field descriptors define how a *field* behaves by routing every read and write through an object you construct. A decorator runs once when the class is set up; a field descriptor participates in every access.
