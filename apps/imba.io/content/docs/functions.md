# Functions

When we talk about functions in Imba, we refer to anonymous / inline functions declared with the `do` keywords. See methods.

## Defining functions

```imba
# defining a function
const square = do(num) num * num

# inside an object
const util =
    upcase: do(str) str.toUpperCase!
    downcase: do(str) str.toLowerCase!
```

Function scopes are selfless, meaning that `self` inside their function bodies will refer to the closest lexical _selfish_ scope. See more about this in the section on Scoping.

### Default parameters

```imba
const multiply = do(a, b = 1)
    a * b
```

### Rest parameters

```imba
def add num, ...rest
    for item in rest
        num += item
    return num

add 1,2,3,4,5
```

### Destructuring parameters

```imba
def draw {size = 'big', coords = {x:0, y:0}, radius = 25}
	console.log size,coords,radius

draw coords:{x: 18, y:30}, radius:30
```

## Calling functions

Defining a function does not execute it. Defining it simply names the function and specifies what to do when the function is called. Accessing a function does not execute it either. If an object has a property `transform`, `object.transform` merely references that function.

When you call a function with arguments, parenthesis are optional.

```imba
# the following expressions are equivalent
console.log('hello')
console.log 'hello'
```

If you want to call a function without arguments, you have two options. Either with an empty pair of parenthesis, or with a `!`, which we call _bang invocation_ in Imba.

```imba
# the following expressions are equivalent
Math.random()
Math.random!
```

### Callbacks

Many functions expect another function as an argument. These are often referred to as callbacks. To take a classic example, `Array.map` creates a new array populated with the results of calling a provided function on every element.

Since this is a common pattern, inline anonymous functions can be passed in

```imba
[1,2,3].map do(item)
    item * 2 # [2,4,6]
```

The convention is usually to take the callback as the last argument, but not always.

```imba
setTimeout((do
    console.log 'waited!'
    [1,2,3].reduce((do(sum,value)
        sum + value
    ),0)
),1500) # looks pretty messy
```

When functions expect callbacks as their first (or not-last) argument, you can use `&` as a placeholder for the callback. The `&` is simply a reference to the callback that is supplied at the end of the invocation.

```imba
setTimeout(&,1500) do
    console.log 'waited!'
    [1,2,3].reduce(&,0) do(sum, value)
        sum + value
```

### Positional Arguments

You can refer to positional arguments from within functions with `$n` if you don't want to explicitly name them.

```imba
[1,2,3,4,5].filter do $1 > 3
```

## Amperfuncs

Tiny functions that just look something up or check a condition on their argument are incredibly common. Inspired by Ruby, Imba has an even shorter syntax for these — we call them _amperfuncs_. Inside an expression, `&` generates an inline function, where `&` refers to the first argument of that function:

```imba
const people = [
	{name: 'Joe', age: 28}
	{name: 'Jane', age: 32}
	{name: 'Pete', age: 15}
]

people.map(&.name) # ['Joe','Jane','Pete']
people.filter(&.age > 18) # [{name: 'Joe'...}, ...]
```

So `&.name` compiles to `do(v) v.name`. The three callbacks below are equivalent — each style a bit shorter than the previous:

```imba
people.map do(person) person.name
people.map do $1.name
people.map(&.name)
```

The generated function is not limited to a single property lookup. The body extends to the whole surrounding expression — property chains, method calls, comparisons and logical operators are all included, and every `&` in the expression refers to the same argument:

```imba
people.map(&.name.toUpperCase!) # ['JOE','JANE','PETE']
people.find(&.age == 32) # {name: 'Jane', age: 32}
people.filter(&.age > 18 and &.age < 30) # [{name: 'Joe'...}]

const nums = [1,2,3,4,5]
nums.filter(& > 2) # [3,4,5]
nums.filter(& % 2 == 0) # [2,4]
nums.filter(& in [2,3]) # [2,3]
[1,'a',2].filter(& isa 'number') # [1,2]
```

Amperfuncs are plain functions, so you can also assign them to variables and pass them around:

```imba
const getName = &.name
getName(people[1]) # 'Jane'
```

They may also reference variables from the surrounding scope:

```imba
def adults people, limit = 18
    people.filter(&.age >= limit)
```

> When an amperfunc only references its own argument, Imba hoists the generated function and reuses a single instance — `people.map(&.name)` does not allocate a new closure on every call. This also gives the function a stable identity, which plays nicely with Imba's memoized rendering.

Amperfuncs are meant for concise lookups and predicates, not general computation. Arithmetic like `& + 1` or `& * 2` is not supported — use `do $1 + 1` for those. And since `&` always refers to the first argument, reach for `do` with named or positional parameters when you need more than one.

Also note that a lone `&` in an argument list — like `setTimeout(&,1500) do ...` — is the [callback placeholder](#calling-functions-callbacks) described earlier, not an amperfunc. The `&` only generates a function when it is followed by `.` or an operator.
