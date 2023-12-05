class Base

	def num
		1

class One < Base

class Two < One
	set name value
		_name = value

	def handle
		_handled = yes

extend class Two
	set name value
		_extname = value
		super

	set origname value
		super.name = value

	def handle
		super
		_exthandled = yes

	def setup
		super.name = "hello"

	def num
		4 + super

test do
	let item = new Two
	item.handle!
	ok item._handled
	ok item._exthandled

	item.origname = 'a'
	eq item._name, 'a'
	eq item._extname, undefined

	item.name = 'b'
	eq item._name, 'b'
	eq item._extname, 'b'

test do
	let item = new Two
	eq item.num!, 5

# extend dynamically
describe "dynamic extend" do
	class Hello
		def one
			1
		def two
			2

	test "basics" do
		let item = new Hello
		eq item.one!, 1
		eq item.two!, 2

	test "extend in loop" do
		# now extend the class
		let updates = {one: 10, two: 20}
		let stuff = []
		for own k2,v2 of updates
			stuff.push do return [k2,v2]

		for own k2,v2 of updates
			yes
			# stuff.push do return [k2,v2]

		for own k,v of updates
			extend class Hello
				def [k]
					super + v

		let item2 = new Hello
		eq item2.one!, 11
		eq item2.two!, 22

	test "extend in function" do
		# fully dynamic extend
		class Item
			def one
				1

		let patch = do(cls,key,value)
			extend class cls
				def [key]
					super + value

		let item = new Item
		eq item.one!, 1
		patch(Item,'one',10)
		eq item.one!, 11