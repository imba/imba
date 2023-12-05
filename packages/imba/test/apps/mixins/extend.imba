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

# SPEC.run!