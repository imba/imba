import 'imba/spec'
# test do
let val = 0

# Should this only be run once?
class Base
	base = (val += 1)

class Logger
	def log
		yes 

	@lazy get stuff
		[1,2,3,4]

class Mixin < Base
	isa Logger
	mixin = 1
	get mixed
		'mixed'

class Model < Base
	model = 1
	isa Mixin
	isa Logger

let item = new Model

L item.mixin

test do 
	eq item.base,1
	eq item.mixin,1
	eq item.model,1


test "same superclass" do
	class A
		a = 1
		def @stuff
			{}

	global class B < A
		b = 1
		item @stuff

	try
		# should not work because A is not in chain
		global class C
			isa B

		let item = new C
		ok 0
	catch e
		ok 1