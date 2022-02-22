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
	eq user.name, "Jane Doe"
	eq runs, 2
	# fn.dispose!

	imba.run do
		user.firstName = "John"
		eq user.name, "John Doe"
		user.lastName = "Dope"

	eq user.name, "John Dope"
	eq runs,3

test 'actions' do
	let runs = 0
	class Order
		@field price = 0
		@field qty = 1

		@memo get total
			price * qty
		
		def incr1
			price += 1
			qty += 1

		@action def incr2
			price += 1
			qty += 1

		@autorun def updated
			runs++
			console.log "total price is now {total}"
		
		
	let order = new Order
	eq runs,1
	order.incr1!
	eq runs,3
	order.incr2!
	eq runs,4



