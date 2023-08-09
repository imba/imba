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
