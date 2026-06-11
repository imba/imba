# Classes

Classes are general-purpose, flexible constructs that become the building blocks of your program's code. You define properties and methods to add functionality to your classes using the same syntax you use to define constants, variables, and functions. Classes in Imba are compiled directly to native [JavaScript Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes).

## Defining Classes

```imba
class Rect
    # custom constructor
    constructor w,h
        width = w
        height = h

    # class method
    def expand hor,ver = hor
        width += hor
        height += ver

    # getter
    get area
        width * height

    # setter
    set area size
        width = height = Math.sqrt size
```

## Creating Instances

The `new` keyword will let you create an instance of your class. This instance inherits properties and methods from its class.

```imba
let fido = new Dog
```

## Class Constructors

Use the `constructor` keyword to declare a custom constructor method for your class. This method will be executed whenever an instance of the class is created (using the `new` keyword).

```imba
class Rect
    constructor w,h
        width = w
        height = h
    # ...
```

## Instance Methods

You can add methods to your class instances using the `def` keyword, followed by the method name and optional arguments.

```imba
class Rect
    def expand hor,ver = hor
        width += hor
        height += ver
```

## Class Fields

Instance fields exist on every created instance of a class. By declaring a field, you can ensure the field is always present, and the class definition is more self-documenting. See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields) for more details.

```imba
class Rect
	width = 10
	height = 10
```

> instances of Rect will always be initialized with width and height set to 10.

The scope after `=` in a class field refers to the instance itself, so class fields can also reference other properties and methods.

```imba
class Rect
	width = 10
	height = 10
	area = width * height

console.log (new Rect).area # 100
```

## Computed Properties

You can add computed properties to your class instances using the `get` keyword followed by the name of the property. The `get` syntax binds an object property to a function that will be called when that property is looked up

```imba
class Rect
    get area
        width * height
```

Using `set` you can define a function that will be called when there is an attempt to set that property.

```imba
class Rect
    set sides value
        width = value
        height = value
```

You can define setters which are to be called whenever there is an attempt to set that property.

## Lazy Getters [wip]

Any getter is bound only when first accessed. A lazy getter will in addition only determine its value the first time it is accessed and from then on return the initial value which can be memoized. This is done with a falsy assignment `||=`.

```imba
class Component
    # The symbol #ref is only set the first time Component.ref is accessed
    get ref
        #ref ||= utils.uuid! 
```

## Computed Names

You can define methods, getters and setters with computed names using `[]`.

```imba
let method = 'items'
let getter = 'title'

class Todo
    get [getter]
        data[getter]

    def [method]
        console.log "called method {method}"

let todo = new Todo
todo.items! # called method items
todo.title
```

## Meta Properties

Upcoming versions of JavaScript has support for "private fields" using the `#` prefix for properties. Imba has a similar syntax that serves a similar purpose. See [Meta Properties]. Meta properties can be used in classes for method, fields, and other properties.

Meta properties are implemented as symbols, They do not show up on an Object using `for in`, `for of`, `Object.getOwnPropertyNames` or `Object.keys`, and they will never conflict with string-based / plain properties on your classes & instances. These are useful for a wide variety of things and are used extensively in the imba runtime itself.

You may often find yourself defining setters because you want to do something when a property is set. The problem is that a property with a setter cannot also store an actual value with the same name. The idiomatic way to store underlying values in setters is to use a meta property with the same name:

```imba
class Todo
    set title value
        # do something here
        #title = value

    get title
        #title
```

This is also useful if you want to declare memoized / lazy fields, where the value of the field should not be initialized until the first time it is accessed.

```imba
class Component
    get ref
        #ref ||= utils.uuid!
```

Let's say we want to add a `#ref` property to _all objects_ - that returns a unique id for every object. As in the example above, we only want to create the id if/when it is accessed. We don't want to pollute every object with a visible textual `ref` property that may interfere with other code and libraries, so we use a meta property for this.

```imba
const map = new WeakMap

extend class Object
    get #ref
        map.set(self,utils.uuid!) unless map.has(self)
        return map.get(self)
```

The above approach of using a WeakMap to store the actual metadata is common, and even the way Babel and other transpilers usually implement private fields today. But weakmaps are quite slow and clunky. Remember that meta properties start with one _or more_ `#` characters. The convention in Imba is to always prepend an additional `#` for each nested level of indirectness. So, instead we would extend Object like this:

```imba
extend class Object
    get #ref
        ##ref ||= utils.uuid!
```

Now you will be able to access `#ref` on _all_ objects.

```imba
const object = {}
object.#ref # '... uuid ...'
# Even built in objects now have this property
window.#ref
```

### Extending native types

You can also use meta properties for methods and class fields. Since they are not enumerable, and won't collide with native methods from JavaScript it is great if you want to extend native prototypes. Imba adds a bunch of methods to the native Node / Element classes in your browser, but to be sure that it does not interact with other libraries, these methods are implemented using meta properties.

```imba
extend class Node
    def #append node
        # setup some listeners etc
        appendChild(node)
```

In your own projects you could even add functionality to _all_ objects without worry using meta properties.

```imba
const map = new WeakMap

extend class Object
    get #ref
        map.set(self,Symbol()) unless map.has(self)
        return map.get(self)

# Now you will be able to access `.#ref` on _all_ objects,
# and get a unique symbol back every time.
const object = {}
object.#ref # Symbol()
```

### Private or not?

Unlike in js, these properties are not strictly private. You can access them from outside just like other properties. So if a class has a method called `#synchronize`, you _can_ call it from outside by `instance.#synchronize!`. At the same time, meta properties are usually used for "internals".

## Static Properties

Methods, fields and computed properties can also be defined on the class itself, as opposed to its instances, by including the `static` keyword before each declaration.

```imba
class Rect
	static size = 50
	size = 100
console.log Rect.size # 50
console.log (new Rect).size # 100
```

```imba
class Rect
	static def build side
		let item = new self
		item.width = item.height = side
		return item

Rect.build(10)
```

## Class Inheritance

An important feature of Classes is the ability to inherit from other classes. For example, a Dog is also an Animal, so it makes sense to inherit the properties of an Animal so that if we ever update the Animal class, the Dog's class will also be updated. It will also help us keep our code light.

```imba
class Animal
	constructor name
		name = name

    def move distance = 0
        console.log "Animal moved {distance} meters."

    def speak
        console.log "{name} makes a noise."

class Dog < Animal
    def speak
        console.log "{name} barks."

let dog = new Dog 'Mitzie'
dog.move 10 # Animal moved 10 meters.
dog.speak! # Mitzie barks.
```

An inherited class will inherit all methods and functionality from the parent class.

If the heritor class accesses any variables or functions on self in its constructor, the constructor must first call `super`.

```imba
class Animal
	constructor name
		name = name

class Dog < Animal
    constructor name, breed
        super # calls Animal constructor with the same arguments (name, breed).
        # super(name) # This would be an explit way to achieve the same effect
        breed = breed

let dog = new Dog 'Mitzie', 'Pug'
console.log dog.name
dog.speak! # Mitzie barks.
```

### Using `super`

##### super

```imba
class Designer < Person
	def greet greeting
        console.log 'will greet'
		super # same as super.greet(...arguments)
```

Lone `super` is treated in a special way. It is always equivalent to calling the same method in super class, passing along the arguments from the current method.

##### super ( arguments )

```imba
class Designer < Person
	def greet greeting
		super "Hey {greeting}" # same as super.greet
```

##### super.property

```imba
class Animal
	constructor name
		name = name

    def move distance = 0
        console.log "Animal moved {distance} meters."

    def speak
        console.log "{name} makes a noise."

class Dog < Animal
    def speak
        console.log "{name} barks."

    def move distance = 0
        super.speak! # call the Animal#speak method directly!
        console.log "{name} ran {distance} meters."

let dog = new Dog 'Mitzie'
dog.move 10 # Mitzie makes a noise. Mitzie ran 10 meters.
```
