const object = {one: 10, two: 20}
const eq = global.eq

global.SomeProp = 'global'

describe "implicit self" do

	test do
		class Item
			prop name = 'item'
			prop type = 'any'
			prop SomeProp = 'item'

			def test
				# since `name` does not exist in scope it
				# tries to look up name on self
				let instance = self
				let obj = {}

				eq name, self.name
				eq SomeProp, 'global'
				eq self.SomeProp, 'item'

				# uppercased properties fall back to the global
				# scopem
				let fn = do
					eq instance, self
					eq obj, this

				fn.call(obj)

		let item = new Item
		item.test!
		# eq item.call!, 'item'