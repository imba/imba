extern describe, test, ok, eq, it

# import two specific items from module
import Item,hello from './module'

# import everything from module into a local namespace/variable 'm'
import './module' as m

class Sub < Item

	def name
		"sub" + super
		

describe "Syntax - Modules" do

	test "modules" do
		var item = Item.new
		eq item.name, "item"

		var item = m.Item.new
		eq item.name, "item"

		eq m.Item, Item

		eq hello(), "world"


		# subclassing an imported class
		var sub = Sub.new
		eq sub.name, "subitem"


		eq m.A.new.name, "a"
		eq m.B.new.name, "b"


export Item
