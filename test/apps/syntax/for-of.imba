
describe 'For ... of' do
	test 'iterating over an Array' do
		let res = for item of ['a','b','c']
			item
		eq res, ['a','b','c']

	test 'iterating over a String' do
		let res = for chr of 'abc'
			chr
		eq res, ['a','b','c']

	test 'iterating over a TypedArray' do
		const iterable = Uint8Array.new([0x00, 0xff])
		let res = for value of iterable
			value
		eq res, [0,255]
	
	test 'iterating over a Map' do
		const iterable = Map.new([['a', 1], ['b', 2], ['c', 3]])

		let res = for value of iterable
			value

		eq res, [['a',1],['b',2],['c',3]]

	test 'iterating over a Set' do
		const iterable = Set.new([1, 1, 2, 2, 3, 3])

		let res = for value of iterable
			value

		eq res, [1,2,3]

	test 'iterating over custom object' do
		class Iterable
			def hello
				yes
			def [Symbol.iterator]
				return {
					i: 0
					next: do
						if this.i < 3
							return {value:  this.i++, done: false}
						else
							return {value: undefined, done: true}
				}

		const iterable = Iterable.new
		let res = for value of iterable
			value
		eq res, [0,1,2]

	test 'returning custom iterator' do
		class Iterable
			def constructor items
				items = items

			def toIterable
				items

		const iterable = Iterable.new([1,2,3])
		let res = for value of iterable
			value
		eq res, [1,2,3]
	
	test 'iterating with index var' do
		let res = for chr,index of 'abc'
			chr + index
		eq res, ['a0','b1','c2']
	# test 'destructuring args' do
	# 	let res = for own key, {id} of items
	# 		id
	# 	eq res, ids
	# with condition