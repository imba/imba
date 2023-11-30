import 'imba/spec'
# test do
let val = 0

# Should this only be run once?
global class Base
	base = (val += 1)

	static def inherited sub
		sub.parent = self

global class Left < Base
	get left
		1

global class Right < Base
	get right
		1

global class Laft < Base
	isa Left

	get laft
		1

global class Both < Base
	isa Left
	isa Right

	get right
		super + 2

global class Multi < Base

	isa Both
	isa Left

	get right
		super + 2

global class Second < Base
	isa Laft

let obj = new Both
let obj2 = new Multi
let laft = new Laft
let sec = new Second

eq laft.laft,1
eq laft.left,1

eq sec.laft,1
eq sec.left,1 # fails now
eq sec.lft,undefined

# L Laft.#meta
# L Second.#meta



extend class Left 
	get lft
		1
	
	# should not extend both since it already has a mixed in function for that
	get right
		-1

eq sec.lft,1


eq obj.right, 3

extend class Right
	# This should propagate to all classes has the previous descriptor
	get right
		2

eq obj.right, 4

test do
	ok Both.parent == Base
	ok sec isa Left
test do
	for cls in [Both,Multi]
		# even with two mixins we should only have one mixin layer?
		let up1 = Object.getPrototypeOf(cls.prototype) # mixins
		let up2 = Object.getPrototypeOf(up1)
		ok up2.constructor == Base
		ok Multi.#meta.parent == Base

		let d1 = Object.getOwnPropertyDescriptor(up1,'left')
		let d2 = Object.getOwnPropertyDescriptor(Left.prototype,'left')
		eq d1.get,d2.get


test do eq obj.left,1
test do eq obj.right,4
test do eq obj.lft,1

test do
	eq obj2.right,6
	eq obj2.lft,1
	eq obj2.lft,1

SPEC.run!