class @set
	callback = null

	def get target,key
		target[key]
	
	def set value,target,key,name
		let prev = target[key]
		if prev != value
			target[key] = value
			callback.call(target,value,prev,self)
		return


###
A common usecase for getters and setters is to evalute something
when the property changes. This could be done by creating a setter
for the property, but it comes with many problems.
###
describe "Class Field watching" do

	test "scenario" do
		# we have entries, with a name, parent, and potentially children
		class Entry
			prop name = "Entry"
			prop parent = null

		# with the constructor syntax it is easy enough to create these
		let root = new Entry name: "home"
		let item = new Entry name: "example.md", parent: root
		
		# the initializers with defaults work as intended
		eq item.parent, root

		# the parent will show up correctly in iterators etc
		eq Object.keys(item), ['name','parent']

	# Now we want to evaluate some code when the .parent property is set.

	test "basic solution" do
		class Entry
			prop name = "Entry"
			# define a setter for parent
			set parent value
				# need to store the value in another key
				actualParent = value
				# evalute some code here!
			
			# define a corresponding getter
			get parent
				actualParent

		let root = new Entry name: "home"
		let item = new Entry name: "example.md", parent: root
		# we can no longer use the default constructor to set
		# the parent property.
		eq item.parent, undefined
		# so we either need to add a constructor just for this,
		# or set it separately
		item.parent = root
		# also, the getter is not enumerable, but the underlying
		# property used to store the value is!
		eq Object.keys(item), ['name','actualParent']

	test "advanced solution" do
		# if we want to register children with their parent when
		# the property is set, it becomes even more verbose
		class Entry
			prop name = "Entry"
			prop children = new Set

			set parent value
				let oldValue = actualParent
				if value != oldValue
					if value
						value.children.add(self)
					if oldValue
						oldValue.children.delete(self)
					actualParent = value

			get parent
				actualParent

		let root = new Entry name: "home"
		let item = new Entry name: "example.md"

		item.parent = root
		eq item.parent, root
		ok root.children.has(item)
		eq Object.keys(item), ['name','children','actualParent']

	test "using watcher" do
		###
		Since the above scenario is quite common, imba has
		special syntax to easily execute code when the value
		of properties change.
		###
		class Entry
			prop name = "Entry"
			prop children = new Set
			prop parent @set do(val,old)
				val..children..add(self)
				old..children..delete(self)

		# we can again use the property like any other,
		# with default constructor and all that.
		let root = new Entry name: "home"
		let item = new Entry name: "example.md", parent: root

		eq item.parent, root
		ok root.children.has(item)
		# and the enumerable properties behaves as expected
		# eq Object.keys(item), ['name','children','parent']

	test "multiline value" do
		let called = 0
		class Item
			# with complex defaults you need to 
			prop names = ['a','b'].map(do $1.toUpperCase!) @set do called++
		
		let item = new Item
		eq called, 1
		eq item.names,["A","B"]
			
	###
	Imba allows you to include a method body after your
	property declaration which will 
	###
	
	
		



	
			