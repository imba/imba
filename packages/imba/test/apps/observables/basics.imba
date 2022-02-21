let counter = 0

class User
	@field firstName
	@field lastName

	@memo get name
		counter++
		"{firstName} {lastName}"

test 'memoization' do
	counter = 0
	const user = new User(firstName: "John", lastName: "Doe")
	eq user.name, "John Doe"
	user.name
	eq counter, 1
	# ok el.classList.contains('custom-class')

test 'autorun' do
	counter = 0
	const user = new User(firstName: "John", lastName: "Doe")
	eq user.name, "John Doe"
	user.name
	eq counter, 1

	let runs = 0
	let fn = imba.autorun do
		runs++
		user.name

	eq runs, 1
	user.firstName = "Jane"
	eq runs, 2
	fn.dispose!