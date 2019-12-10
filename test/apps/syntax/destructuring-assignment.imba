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

describe 'Object destructuring' do
	test 'Basic assignment' do
		let o = {p: 42, q: true}
		let {p,q} = o

		ok p == 42 and q == true

	test 'Assignment without declaration' do
		let a,b
		{a,b} = {a: 1, b: 2}
		ok a == 1 and b == 2

	test 'Assigning to new variable names' do
		const o = {p: 42, q: true}
		const {p: foo, q: bar} = o
		ok foo == 42 and bar == true

	test 'Default values' do
		const {a = 10, b = 5} = {a: 3}
		ok a == 3 and b == 5

	test 'Assigning to new variables names and providing default values' do
		const {a: aa = 10, b: bb = 5} = {a: 3}
		ok aa == 3 and bb == 5

	test 'Assigning to object' do
		const target = {}
		const o = {a: 1, b: 2}
		{a: target.x, b: target.y} = o
		ok target.x == 1 and target.y == 2

	test 'Unpacking fields from objects passed as function parameter' do
		const user =
			id: 42
			displayName: 'jdoe'
			fullName:
				firstName: 'John'
				lastName: 'Doe'

		def whois {displayName, fullName: {firstName: name}}
			return "{displayName} is {name}"

		ok whois(user) == "jdoe is John"

