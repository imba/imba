import 'imba/spec'
# test do
let val

# Should this only be run once?
class Base
	static def mixed
		val = 'mixed'

class Action < Base

class Widget
	# now Base becomes widget-like
	isa Base

class User < Base


test do
	ok (new User) !isa Action
	ok (new Widget) !isa Action
	ok (new Widget) isa Base
	ok (new User) isa Base
	ok val, 'mixed'
