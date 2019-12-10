
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