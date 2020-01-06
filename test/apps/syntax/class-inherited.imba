var inherited = []

###
When a class inherits from another in Imba
the static 'inherited' method will be called on
the superclass (if one exists)
###

def dynamic
	return Item

class Item
	static def inherited other
		inherited.push(other)

	static def hello
		console.log 'hello!'

	def build
		self

class Todo < Item

	def build
		self

class Other < dynamic()

	def build
		self

test 'calling superclass.inherited' do
	eq inherited, [Todo,Other]