import 'imba/spec'
import { @prop } from 'imba'

class User
	name as @prop.weak.watch(do |to,from|
		console.info(`changed {from} {to}`)
	)

let u = new User
u.name = 'John'
u.name = 'Jane'

test "watching" do
	let u = new User
	u.name = 'John'
	u.name = 'Jane'
	eq $1.log, ['changed undefined John','changed John Jane']
