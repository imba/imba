import 'imba/spec'
# test do
let val = 0

# Should this only be run once?
class Base
	base = (val += 1)

class Lagger
	def lag
		yes

class Logger
	isa Lagger

	def log
		yes 

	@lazy get stuff
		[1,2,3,4]

class Model < Base
	model = 1

let item = new Model

ok !item.log

# reopen the Model class and add mixins
extend class Model
	isa Logger

ok item.log isa Function

test do
	ok item.log isa Function
	ok item.lag isa Function

	extend class Lagger
		def lag2
			yes
	ok item.lag2 isa Function
