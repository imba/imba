# Decorators

> [tip box yellow] This is considered an [experimental](/experimental) feature.

Decorators are special functions which can alter the functionality of a method call by replacing or wrapping it with some other code. Decorators do this by modifying a property (usually a method) with a new [descriptor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#description) at runtime.

Imba includes some built-in decorators such as [@observable](/docs/observable). This page teaches you how to build your own.

The following example defines a decorators which replaces decorated function, to display a message.

```imba
# [preview=console]
# Defining a contrived 'silence' decorator:
def @silence target, name, descriptor
	descriptor.value = do
		console.log "'{name}' was called, but it is being silenced."
	return descriptor

# Using the 'silence' decorator
class Person
	@silence def sayHi
		console.log("Hello, I hope I'm not silenced!")

const someone = new Person()
someone.sayHi!
```

Skip to [Technical Details](#technical-details).

## Guide to Understanding

Let's walk through why and how decoractors work with an example.

Imagine you have a method which returns the result of a calculation like this:

```imba
class EasyMath
	def multiply
		return 5 * 3
```

You later realize you want to log the result of that calculation for debugging purposes, now you need to assign the calculation to a variable, then you can log the value, then return it.

```imba
# [preview=console]
class EasyMath
	def multiply
		console.log "Running the multiply method"
		const result = 5 * 3
		console.log(result)
		return result

new EasyMath().multiply!
```

We can make a convenient, reusable decorator that automatically logs the return value, instead of having to modify the function with additional code.

Here's how we can define such a decorator:

```imba
def @logResult target, name, descriptor

	# The original method is stored in descriptor.value
	const originalMethod = descriptor.value

	# We'll overwrite the value with a new function
	descriptor.value = do(...originalArguments)

		# call the original method
		let result = originalMethod(...originalArguments)

		# do the custom logging
		console.log
			"Calling {name}({originalArguments.join(', ')}) returned {result}"

	return descriptor
```

And here's how to use it:

```imba
# [preview=console]
def @logResult target, name, descriptor

	# The original method is stored in descriptor.value
	const originalMethod = descriptor.value

	# We'll overwrite the value with a new function
	descriptor.value = do(...originalArguments)

		# call the original method
		let result = originalMethod(...originalArguments)

		# do the logging (this is the additional functionality added by the decorator)
		console.log "Calling {name}({originalArguments.join(', ')}) returned {result}"

	return descriptor
# ---
class EasyMath
	@logResult def multiply a, b
		return a * b

	@logResult def quadruple n do n * 4

const myMath = new EasyMath()
myMath.multiply(3,5)
myMath.quadruple(10)
```

Now that the `@logResult` decorator function is defined, you are able to add `@logResult` in front of any method definition to make use of the decorator.

## Decorator Parameters

The parameters of a decorator are as follows:

#### Target

Target is the class constructor's prototype. It's not often needed.

#### Name

`name`, (sometimes called `key`), is the name of the property being decorated. In the example below, the `name` sent to the `@bar` decorator would be the string `"baz"`.

```imba
class Foo
	@bar def baz
		return 'baz!'
```

#### Descriptor

The descriptor value for this property. You can read an overview of descriptors here: [descriptors on mdn](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#description).

In JavaScript, when you write:

```imba
obj[key] = value
```

You could say that `obj` has a _property_ named `key`.
However, it is not as simple as just a new key mapping to a value.
There is some additional metadata associated with this property which is called the descriptor.

The descriptor is an object which indicates whether the property is enumerable or not,
writeable or not, etc.

The main descriptor properties we use are:

-   `descriptor.value` for functions.
-   `descriptor.get` for getters.
-   `descriptor.set` for setters.

In this example, the `descriptor.value` sent to the `@bar` decorator would be the `baz` function itself.

```imba
class Foo
	@bar def baz
		return 'baz!'
```

`descriptor.value` would just be the `calc` function itself.

#### Return value

The return value is a new descriptor.
If the return value is null, the original descriptor is used,
side effects included.

```imba
# [preview=console]
def @log target, name, desc
	desc.value = do
		console.log "This will log."
	return null

class Test
	@log def main
		console.log "In main."

let test = new Test!
test.main()
```

For clarity,
notice that the following code will log twice even though we're
not calling any functions because the decorated properties are
replaced at runtime:

```imba
# [preview=console]
def @example target, name, desc
	console.log "This will be logged once for each decorated property at runtime."

class Test
	@example def main
		return
	@example def test
		return
```

## Technical Details

#### Placement

You can place decorators either above a property or before a property as demonstrated in the next example.

```imba
class Foo
	@bar
	def first
		console.log "this works"

	@bar def second
		console.log "This works too!"
```

#### Decorator Arguments

Arguments can be passed to the decorator and are bound as `this` in the decorator.

```imba
# [preview=console]
def @example
	# arguments are available as 'this'
	console.log this

class Test
	@example(1, 2, 3) def main do return
```

#### Multiple decorators

Multiple decorators can be used on a single method.

```imba
class Test
	@one @two @three def foo
		console.log "Called foo."

	@one
	@two
	def bar
		console.log "Called bar."

```

#### Implicit returns

Imba implicitly returns the last statement in a function,
so even though side effects can be used to modify the
descriptor, if the last statement is `desc.value = do ...`,
the `do` function will be implicitly returned.

Be sure to explicitly return the `desc` value if that is your intention.

#### Execution context

You might be wondering why we need to use
[apply](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)
instead of just calling the function directly:

```imba
const result = prev.apply(this, args)
```

That has to do with the execution context of the function.
It's an odd topic, but if you look at the output of this example:

```imba
# [preview=console]
def @log target, name, desc
	let prev = desc.value
	desc.value = do
		console.log "`this` in @log: {this}"
		prev!
	desc

class Test
	@log def one
		console.log "`this` in one: {this}"

	def two
		console.log "`this` in two: {this}"

let test = new Test!
test.one!
test.two!
```

You'll notice that even though it seems like we're calling
`one` and `two` in the same manner,
since `one` is being called inside of this function:

```imba
	desc.value = do
		console.log "In @log: {this}"
		prev!
```

It loses its execution context. More on `this` can be found on [mdn](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this).

#### Implementation

For those interested, this is slightly simplified
version of how decorators work behind the scenes:

```imba
# [preview=console]
# inserted at compile time
def decorate decorator,target,key
	let desc = Object.getOwnPropertyDescriptor target,key
	let new_desc = decorator(target,key,desc) or desc
	new_desc and Object.defineProperty target,key,new_desc

def log target,key,desc
	desc.value = do
		console.log "Called {key}."
	return

class Test

	# inserted at compile time
	static def init
		decorate log.bind(["args"]),this.prototype,'main'

	def main
		console.log "Original."

# inserted at compile time
Test.init!

new Test!.main!
```
