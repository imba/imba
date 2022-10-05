import 'imba/spec'

let counter = 0

class User
	@observable firstName
	@observable lastName
	@observable desc

	@computed get name
		counter++
		"{firstName} {lastName}"

if false
	let u = global.u = new User(firstName: "John", lastName: "Doe")
	global.aw = imba.awaits do
		console.log 'running'
		u.desc

	global.aw.then do(val)
		console.log 'condition is now tru!',val
		let v2 = await global.aw
		console.log 'immediately now',v2

test 'when' do
	counter = 0
	const user = new User(firstName: "John", lastName: "Doe")

	setTimeout(&,200) do user.firstName = 'Jane'
	let awaited = await imba.awaits do
		console.log 'running awaits'
		user.firstName == 'Jane'

	eq user.name, "Jane Doe"