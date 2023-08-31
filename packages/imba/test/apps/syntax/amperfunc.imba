# Inspired by ruby, you can use the `&` operator to concisely create inline functions.
let joe = {id: 1, name: 'joe', age: 28}
let jane = {id: 2, name: 'jane', age: 32}
let pete = {id: 3, name: 'pete', age: 15}
let arr = [joe, jane, pete]

# Short inline functions are pretty common in imba and js
let ids = arr.map(do(item) item.id )
let names = arr.map(do(item) item.name)
let refs = arr.map(do(item) item.name.toUpperCase! )
let old = arr.filter(do(item) item.age > 18 )

# With imba you can refer to unnamed variabes in functions with $1,$2,..., so
# we could make these inline functions a bit more concise
arr.map(do $1.id )
arr.map(do $1.name)
arr.map(do $1.name.toUpperCase! )
arr.filter(do $1.age > 18 )

# But this type of pattern is _really_ common. So imba has an even more concise
# way to achieve the same thing. & will in certain contexts generate an inline
# function where the & references the first argument of said function.
arr.map(&.id)
arr.map(&.name)
arr.map(&.name.toUpperCase! )
arr.filter(&.age > 18)

# &.test compiles to (v)=>{ return v.test }
# & > 10 compiles to (v)=>{return v > 10 }
# ...

# Lets use it:
test do
	eq ids, arr.map(&.id)
	eq names, arr.map(&.name)
	eq refs, arr.map(&.name.toUpperCase! )
	eq old, arr.filter(&.age > 18)
	eq jane, arr.find(&.age == 32)

	let fn = &.id
	ok fn(id: 10) == 10
