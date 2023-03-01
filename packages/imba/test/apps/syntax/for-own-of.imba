let items = {
	a: {id: 1}
	b: {id: 2}
	c: {id: 3}
}
let ids = [1,2,3]

describe 'For own ... of' do
	test 'iterating over an Object' do
		let res = for own key,item of items
			item.id
		eq res, ids

	test 'destructuring args' do
		let res = for own key, {id} of items
			id
		eq res, ids

	# with condition