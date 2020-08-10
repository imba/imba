extern describe, test, ok, eq, it

describe "Syntax - Quirks" do
	
	test "ivar in object" do
		let object = {
			@ivar: 10
		}
		
		let other =
			@ivar: 100
			ovar: 10
		
		eq object.@ivar, 10
		eq object@ivar, 10
		
	test "let item = try" do
		var item = 20
		let item = try 1000
		eq item, 1000
		
	test "let item = try catch" do

		let item = try
			Math.rendom # error
			1000
		catch e
			2000

		eq item, 2000
		
	test "let if" do
		let item = if Math.random
			for item in [1,2,3]
				item * item * item
			1000
		else
			1000

		eq item, 1000
		
	test "let item = forin" do
		let item = for v in [1,2,3]
			v * 2
		eq item, [2,4,6]
		
	test "new precedence" do
		class Collection
			prop type
			def initialize type
				@type = type
				
			def create value
				type.new value
				
		class Item
			def hello
				self
				
		var factory = Collection.new(Item)
		var item = factory.create("item")
			