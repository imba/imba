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
