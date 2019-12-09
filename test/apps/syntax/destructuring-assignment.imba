# https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment

describe 'Array destructuring' do

	test 'Basic variable assignment' do
		const foo = ['one', 'two', 'three']
		const [red, yellow, green] = foo

		ok red == 'one'
		ok yellow == 'two'
		ok green == 'three'

	test 'Assignment separate from declaration' do
		let a, b
		[a, b] = [1, 2]
		ok a == 1
		ok b == 2

###
	test 'Default values' do
		let a, b
		[a=5, b=7] = [1]
		ok a == 1
		ok b == 7

	test 'Swapping variables' do
		let a = 1
		let b = 3
		
		[a, b] = [b, a]
		ok a == 3
		ok b = 1

		const arr = [1,2,3]
		[arr[2], arr[1]] = [arr[1], arr[2]]
		eq arr, [1,3,2]

	test 'Assigning the rest of an array to a variable' do
		const [a, ...b] = [1, 2, 3]
		eq a, 1
		eq b, [2,3]
###