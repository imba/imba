# Operators

## Arithmethic Operators [toc-pills]

### + [op=math]

```imba
1 + 2 # 3
```

### - [op=math]

```imba
3 - 1 # 2
```

### / [op=math]

```imba
6 / 3 # 2
```

### \* [op=math]

```imba
3 * 2 # 6
```

### % [op=math]

```imba
5 % 2 # 1
```

### \*\* [op=math]

```imba
2 ** 3 # 8
```

### - [op=math+unary]

```imba
-i # Unary negation
```

### + [op=math+unary]

```imba
+i # Unary plus
```

## Logical Operators [toc-pills]

### && [op=logical]

```imba
null && 10 # null
0 && 10 # 0
1 && 10 # 10
'' && 'str' # ''
```

The logical AND operator is true if all of its operands are true. The operator returns the value of the last truthy operand.

### and [op=logical]

```imba
null and 10 # null
1 and 10 # 10
```

Alias for `&&` operator

### || [op=logical]

```imba
null || 10 # 10
0 || 10 # 10
1 || 10 # 1
```

The logical OR operator is true if one or more of its operands is true. The operator returns the value of the first truthy operand.

### or [op=logical]

```imba
null or 10 # 10
0 or 10 # 10
1 or 10 # 1
```

Alias for `||` operator

### ?? [op=logical+existential]

```imba
null ?? 10 # 10
0 ?? 10 # 0
'' ?? 'str' # ''
```

The nullish coalescing operator `??` is a logical operator that returns its right-hand side operand when its left-hand side operand is `null` or `undefined`, and otherwise returns its left-hand side operand.

### ! [op=unary]

```imba
let a = true
!a # false
!10 # false
!0 # true
```

## Comparison Operators [toc-pills]

### == [op=compare]

```imba
x == y # Equality
```

### != [op=compare]

```imba
x != y # Inequality
```

### === [op=compare]

```imba
x === y # Strict equality
```

### is [op=compare]

```imba
x is y # Also strict equality
```

### !== [op=compare]

```imba
x !== y # Strict inequality
```

### isnt [op=compare]

```imba
x isnt y # Also strict inequality
```

### > [op=compare]

```imba
x > y # Greater than
```

### >= [op=compare]

```imba
x >= y # Greater than or equal
```

### < [op=compare]

```imba
x < y # Less than
```

### <= [op=compare]

```imba
x <= y # Less than or equal
```

### isa [op=compare+keyword+isa]

```imba
honda isa Car #
```

The `isa` operator tests whether the prototype property of a constructor appears anywhere in the prototype chain of an object. Alias for the javascript [instanceof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof) operator.

### !isa [op=compare+keyword+isa]

```imba
princess !isa Car
```

### typeof [op=unary+keyword]

```imba
typeof item
```

## Assignment Operators [op-assign] [toc-pills]

### = [op=assign]

```imba
a = b
```

### ||= [op=assign]

```imba
a ||= b # If falsy assignment
```

### &&= [op=assign]

```imba
a &&= b # If truthy assignment
```

### ??= [op=assign]

```imba
a ??= b # If null assignment
```

### += [op=math+assign]

```imba
a += b # Addition assignment
```

### -= [op=math+assign]

```imba
a -= b # Decrement assignment
```

### \*= [op=math+assign]

```imba
a *= b # Multiplication assignment
```

### /= [op=math+assign]

```imba
a /= b # Division assignment
```

### %= [op=math+assign]

```imba
a %= b # Remainder assignment
```

### \*\*= [op=math+assign]

```imba
a **= b # Exponential assignment
```

### ++ [op=math+assign+unary+post]

```imba
a++ # Increment assignment, returns original value
```

### -- [op=math+assign+unary+post]

```imba
a-- # Decrement assignment, returns original value
```

### ++ [op=math+assign+unary]

```imba
++a # Increment assignment, returns incremented value
```

### -- [op=math+assign+unary]

```imba
--a # Decrement assignment, returns decremented value
```

### =? [op=assign+change+advanced]

```imba
let object = {}
let input = 200
# ---
if object.value =? input
    yes
```

Regular assignment that returns true or false depending on whether the left-hand was changed or not. More concise way of doing:
```imba
let object = {}
let input = 200
# ---
if object.value != input
    object.value = input
    yes
```
The reassignment may seem unnecessary at first, but since memoization is an oft-used pattern in Imba, this is a very convenient addition.

## Bitwise Operators [toc-pills]

### & [op=bitwise]

```imba
a & b # Bitwise AND
```

### !& [op=bitwise]

```imba
a !& b # Bitwise NOT AND
```

> Essentially the same as `(a & b) == 0`

### | [op=bitwise]

```imba
a | b # Bitwise OR
```

### ^ [op=bitwise]

```imba
a ^ b # Bitwise XOR
```

### ~ [op=bitwise+unary]

```imba
~ a # Bitwise NOT
```

### << [op=bitwise]

```imba
a << b # Left shift
```

### >> [op=bitwise]

```imba
a >> b # Sign-propagating right shift
```

### >>> [op=bitwise]

```imba
a >>> b # Zero-fill right shift
```

### <<= [op=bitwise+assign]

```imba
a <<= 1 # Left shift assignment
```

### >>= [op=bitwise+assign]

```imba
a >>= 1 # Right shift assignment
```

### >>>= [op=bitwise+assign]

```imba
a >>>= 1 # Unsigned right shift assignment
```

### &= [op=bitwise+assign]

```imba
a &= 1 # Bitwise AND assignment
```

### |= [op=bitwise+assign]

```imba
a |= 1 # Bitwise OR assignment
```

### ~= [op=bitwise+assign]

```imba
a ~= 1 # Bitwise NOT assignment (unassignment)
```

### ^= [op=bitwise+assign]

```imba
a ^= 1 # Bitwise XOR assignment
```

### |=? [op=bitwise+assign+change+advanced]

```imba
const STATES = {LOADED: 2}
let data = {state: 0}

# ---
if data.state |=? STATES.LOADED
    yes
```

Bitwise OR assignment that returns true only if the bit(s) was not previously set. Essentially a concise way to do

```imba
const STATES = {LOADED: 2}
let data = {state: 0}

# ---
if (data.state & STATES.LOADED) == 0
    data.state |= STATES.LOADED
    # do something here...
```

### ~=? [op=bitwise+assign+change+advanced]

```imba
const STATES = {LOADED: 2}
let data = {state: 0}

# ---
if data.state ~=? STATES.LOADED
    # went from loaded to not loaded
```

Bitwise unassignment that unsets the right-hand bits from left-hand value and returns true / false depending on whether this actually changed the left-side or not.

```imba
const STATES = {LOADED: 2}
let data = {state: 0}

# ---
if (data.state & STATES.LOADED) == 0
    data.state |= STATES.LOADED
    # do something here...
```

### ^=? [op=bitwise+assign+change+advanced]

```imba
a ^=? 1 # Bitwise XOR assignment
```

## Optional chaining [toc-pills]

Imba uses `..` for [optional chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining). If the optional reference is nullish it will return undefined.

```imba
let object = {one: {value: 1}}
console.log object..two..value
# undefined
console.log object.two.value
# TypeError: Cannot read property 'value' of undefined
```

## Keywords [toc-pills]

### delete [op=keyword+delete+unary]

```imba
let object = {one: 1, two: 2}
delete object.one
```

### class [keyword]

```imba
class Game
	turn
	tiles
	moves
	winner

	def constructor
		moves = []
		tiles = new Array(9)
		turn = 0
```

### switch [keyword]

```imba
switch status
    when "completed"
        console.log "This project has been completed"
    when "archived"
        console.log "This project has been archived"
    else
        console.log "This project is active"
```

### for [keyword]

```imba
for num in [1,2,3]
	num * 2
```

```imba
for item in items
	<li> item.name
```

```imba
for item, i in items
	<li> "{i+1}: {item.name}"
```

### get [keyword]

```imba
class Item
    price = 100
    taxRate = 20

    get totalPrice
        price * (1 + taxRate / 100)

    def render
        <self>
            <input bind=price>
            <input bind=taxRate>
            <p> "Total: {totalPrice}" # 120

```

### set [keyword]

```imba
class Item
    set name value
        console.log "The name has been set to", value
```

### def [keyword]

```imba
  def multiply a, b
    a * b

  # default values
  def method name = 'imba'
    console.log param

  # destructuring parameters
  def method name, {title, desc = 'no description'}
    console.log name,title,desc
```

### attr [keyword]

```imba
<form attr:id="product-form">
```

### tag [keyword]

```imba
# Define a new global tag component
tag page-header
  ...
```

```imba
# Define a new local tag component
tag Header
  ...
```

### if [keyword]

```imba
  if condition
	  console.log 'yes!'
```

### elif [keyword]
```imba
if expr > 10
	console.log 'over 10'
elif expr > 5
	console.log 'over 5'
elif expr
	console.log 'not falsy'
```

### else [keyword]

```imba
if condition
	console.log 'yes!'
else
	console.log 'no!'
```

### try [keyword]

```imba
def fetch
    # adding a try without a catch block will silently swallow an erro
    try
      const result = await axios.get('my-api.com')
```

### catch [keyword]

```imba
  def fetch
    try
      const result = await axios.get('my-api.com')
    catch e
      console.error "There was an error", e
```

### continue [keyword]

```imba
let res = for num in [1,2,3,4,5]
	continue if num == 3
	num * 2
console.log res # [2,4,8,10]
```

```imba
# continue with an argument acts like early return within Array#map
let res = for num in [1,2,3,4,5]
	continue -1 if num == 3
	num * 2
# res => [2,4,-1,8,10]
```

### break [keyword]

```imba
let res = for num in [1,2,3,4,5]
	break if num == 3
	num * 2
# res => [2,4]
```

```imba
# When supplying an argument to break
# this value will be added to the resulting array
let res = for num in [1,2,3,4,5]
	break -1 if num == 3
	num * 2
```

### return [keyword]

```imba
 # In Imba the last statement is returned automatically
 def add a, b
   a + b
```

```imba
# But it can be useful for returning other values or early
def add a, b
  return 0 unless a && b
  a + b
```
