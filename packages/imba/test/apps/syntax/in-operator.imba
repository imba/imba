# Inspired by ruby, you can use the `&` operator to concisely create inline functions.
let joe = {id: 1, name: 'joe', age: 28}
let jane = {id: 2, name: 'jane', age: 32}
let pete = {id: 3, name: 'pete', age: 15}
let mike = {id: 4, name: 'mike', age: 30}
let arr = [joe, jane, pete]
let empty = []
let set = new Set(arr)
let map = new Map(arr.map(do [$1,1]))

let OddCollection = {
	# custom method to be called to check if val IN this
	def #has val
		val isa 'number' and (val % 2 == 1)
}

# Lets use it:
test 'in' do
	ok joe in arr
	ok joe in set
	ok joe in map
	ok joe in (empty or arr)
	ok mike !in arr
	ok mike not in set
	ok mike not in map

test '#has' do
	# custom
	ok 120 !in OddCollection
	ok 121 in OddCollection
