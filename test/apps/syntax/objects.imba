var x = 100
var y = 200

describe 'Object' do

	test do
		var obj = {x,y, a: 10, b: 20, [x]: y}
		ok obj.x == 100 && obj[100] == 200

	test do
		# automatic this
		@hello = 1
		#secret = 2
		var obj = {@hello,y,#secret, a: 10, b: 20}
		ok obj.hello == 1 && obj.y == 200 && obj.secret == 2

	test do

		#t{x} = 3
		ok #t100 == 3
		def key
			key = null
			"one"

		#t{key()} ?= 1
		ok #tone == 1
		# more secret stuff
