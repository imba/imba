class Randomized

	@lazy get id
		Math.random()

class Logger
	loggerval = 1


	get value
		10

	def log ...params
		console.log("Logger:",...params,constructor.name)

class Item
	isa Randomized
	isa Logger

	itemval = 2

	def constructor
		num = 2

	get value
		num + super

class Base
	get stuff
		1

	
test "basics" do
	let item = new Item
	eq item.value,12
	ok item isa Logger
	ok item isa Randomized
	eq item.id,item.id
	eq item.itemval,2
	eq item.loggerval,1


test "reopen" do
	class Base
		get a
			1
	
	class Model
		isa Base

	let item = new Model
	eq item.a,1

	extend class Base
		get b
			2

	eq item.b,2
	ok item isa Base

test do
	let val = 0
	class Base
		base = (val += 1)

	class Mixin < Base
		mixin = 1

	class Model < Base
		model = 1
		isa Mixin
	
	let item = new Model
	eq item.base,1
	eq item.mixin,1
	eq item.model,1
