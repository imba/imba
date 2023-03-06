
# decorator that adds a method to allow
# using instances of a class as keys in
# regular dictionaries. Useful hack :)
def @indexable target
	extend class target
		def [Symbol.toPrimitive]
			##symbol ||= Symbol!

@indexable
class Model

	def constructor
		seed = Math.random!

describe 'class decorators' do
	test do
		let data = {}
		let one = new Model
		let two = new Model

		data[one] = 1
		data[two] = 2

		eq data[one], 1
		eq data[two], 2