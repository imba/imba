# evalutes expressions - returning the error if an error is thrown while evaluating

def failingAsyncMethod
	new Promise do(resolve,reject)
		throw new Error('')

test 'rescue' do
	let x = rescue Math.rendom!
	ok x isa Error

test 'rescue returns correct value' do
	let x = rescue 10.toString!
	eq x, "10"

	let y = rescue 10.undefinedMethod!
	ok y isa Error

test 'works with await' do
	let res = [rescue await failingAsyncMethod!]
	ok res[0] isa Error

def resolved value
	Promise.resolve(value)

def rejected message
	Promise.reject(new Error(message))

test 'member access after rescue await reads the awaited value' do
	let data = {name: 'value', items: [1,2], double: do(n) n * 2}
	let name = (rescue await resolved(data)).name
	let optional = (rescue await resolved(data))..name
	let item = (rescue await resolved(data.items))[1]
	let doubled = (rescue await resolved(data)).double(2)
	let called = (rescue await resolved(do 'called'))!
	let direct = rescue(await resolved(data)).name
	eq name, 'value'
	eq optional, 'value'
	eq item, 2
	eq doubled, 4
	eq called, 'called'
	eq direct, 'value'

test 'member access after rescue await reads the error' do
	let message = (rescue await rejected('failed')).message
	let optional = (rescue await rejected('failed'))..message
	eq message, 'failed'
	eq optional, 'failed'
