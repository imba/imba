let data =
	user:
		name: 'hello'
		login: do 200
	method: do 1
		
test do
	eq data..user..name, 'hello'
	ok !data..user..age

test do
	eq data..method!,1

test do
	eq data..none!,undefined

test do
	eq (data..test! 10),undefined
	eq data..missing..none,undefined
	eq data..missing..none!,undefined
	eq data..missing..none(),undefined

test do
	eq data..unknown..method!, undefined

test do
	let key = 'name'
	eq data.user..[key],'hello'

window.imba..commit!