
let list = [{id: 1},{id: 2},{id: 3}]
let ids = [1,2,3]

describe 'For ... in' do
	test 'iterating over an Array' do
		let res = for item in list
			item.id
		eq res, ids

	test 'destructuring args' do
		let res = for {id} in list
			id
		eq res, ids