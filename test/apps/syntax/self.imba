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
				
				eq name, self.name
				eq SomeProp, 'global'
				eq self.SomeProp, 'item'
				
				# uppercased properties fall back to the global
				# scopem 
		
		let item = new Item
		item.test!
		# eq item.call!, 'item'
		
describe "specified self" do
	###
	If you declare a parameter or variable named `self`, this will
	be what imba uses as self, both implicit and explicitly.
	###
	test do
		let self = {one: 10, two: 20}
		eq one, 10
		eq two, 20
		
	class Item
		one = 1
		two = 2

		def implicit
			eq one, 1
			eq two, 2
			eq self.one,1
			(do [one,self.two])()
			
		def param self
			eq one, 10
			eq two, 20
			(do [one,self.two])()
			
		def midway target
			eq one, 1
			eq two, 2
			let self = target
			eq one, 10
			eq two, 20
			(do [one,self.two])()

	let item = new Item
	test do eq item.implicit!, [1,2]
	test do eq item.param(object), [10,20]
	test do eq item.midway(object), [10,20]