import 'imba/spec'

let calls = 0
let runs = 0

class Base
	@observable array = []

	@computed get size
		calls++
		array.slice(0).length

	@autorun def stuff
		runs++
		array.slice(0).length


test do
	let base = new Base
	base.size
	imba.atomic do
		for i in [0 ... 100]
			base.array.push(10)
	base.size
	base.size

	eq base.size, 100
	ok calls == 2
	eq runs, 2

SPEC.run!
