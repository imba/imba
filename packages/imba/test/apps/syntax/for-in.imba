
let list = [{id: 1},{id: 2},{id: 3}]
let ids = [1,2,3]

describe 'For ... in' do
	test 'iterating over an Array' do
		let res = for item in list
			item.id
		eq res, ids

	test 'iterating with guard' do
		let res = for item in list when item.id > 1
			item.id
		eq res, [2,3]

	test 'destructuring args' do
		let res = for {id} in list
			id
		eq res, ids

	test 'destructuring args with guard' do
		let res = for {id} in list when id > 1
			id
		eq res, [2,3]
	
	
	test 'iterating over range' do
		let res = for item in [0 .. 2]
			item
		eq res, [0,1,2]
		
	test 'iterating over exclusive' do
		let res = for item in [0 ... 2]
			item
		eq res, [0,1]

	test 'throw on undefined iterable' do
		let iterable = null

		try
			for item in iterable
				yes
			ok no
		catch e
			ok yes