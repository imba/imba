let counter = 0
# const {test,eq,ok} = imba.spec

class User
	@observable firstName
	@observable lastName

	@computed get name
		counter++
		"{firstName} {lastName}"

test 'memoization' do
	counter = 0
	const user = new User(firstName: "John", lastName: "Doe")
	eq user.name, "John Doe"
	eq counter, 1
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
		@observable price = 0
		@observable qty = 1

		@computed get total
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

test 'arrays' do
	let runs = 0

	class OrderLine
		@observable desc = "Line"
		@observable price = 1
		@observable qty = 1

		@computed get total
			price * qty

	class Order
		@observable lines\OrderLine[] = []

		@computed get total
			let sum = 0
			for line in lines
				sum += line.total
			return sum

		def add price = 1, qty = 1
			let line = new OrderLine(price: price, qty: qty)
			lines.push(line)
			return line

		@autorun def updated
			runs++
			console.log "total price is now {total}"

	let order = new Order
	eq order.total,0
	let line = order.add(10,1)
	eq order.total,10
	eq runs,2
	line.desc = "Stuff"
	eq runs,2
	line.qty = 2
	eq order.total,20
	eq runs,3

test 'Sets' do
	let runs = 0

	class OrderLine
		@observable desc = "Line"
		@observable price = 1
		@observable qty = 1

		@computed get total
			price * qty

	class Order
		@observable lines\Set<OrderLine> = new Set

		@computed get total
			let sum = 0
			for line of lines
				sum += line.total
			return sum

		def add price = 1, qty = 1
			let line = new OrderLine(price: price, qty: qty)
			lines.add(line)
			return line

		@autorun def updated
			runs++
			console.log "total price is now {total}"

	let order = new Order
	eq order.total,0
	let line = order.add(10,1)
	eq order.total,10
	eq runs,2
	line.desc = "Stuff"
	eq runs,2
	line.qty = 2
	eq order.total,20
	eq runs,3

test 'Maps' do
	let runs = 0

	class Entry
		@observable reactions = new Map

		def react emoji
			reactions.set(emoji,(reactions.get(emoji) or 0) + 1)

		@computed get reactionCount
			let sum = 0
			for [emoji,count] of reactions
				sum += count
			return sum

		@autorun def updated
			runs++
			console.log "total price is now {total}"

	let item = new Entry
	eq item.reactionCount,0
	item.react "😀"
	eq item.reactionCount,1
	item.react "😀"
	item.react "😍"
	eq item.reactionCount,3