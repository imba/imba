
class Model
	
	prop a
	prop b default: 10

	def initialize nestings = 0
		@gets = 0
		@sets = 0
		@calls = 0
		self

	def ivar= val
		@sets = @sets + 1
		@ivar = val

	def ivar
		@gets = @gets + 1
		@ivar

	def child
		@calls = @calls + 1
		@child

	def gets
		@gets

	def sets
		@sets

	def calls
		@calls

	def reset
		@gets = 0
		@sets = 0
		@calls = 0
		@child.reset if @child
		self

	def testmeth1
		reset
		@ivar = 10
		var ivar = ivar
		ivar
		self


# Assignment
# ----------

# * Assignment
# * Compound Assignment
# * Destructuring Assignment
# * Context Property (@) Assignment
# * Existential Assignment (?=)
describe 'Syntax - Properties' do

	test "default values" do
		var object = Model.new
		eq object.a, undefined
		eq object.b, 10

	test "watch: yes" do
		let track = null
		class Example
			prop name watch: yes

			def nameDidSet value
				track = value

		Example.new.name = 10
		eq track, 10

	test "watch: String" do
		let track = null
		class Example
			prop name watch: 'tracker'
			prop other watch: :tracker
			def tracker value do track = value
		Example.new.name = 10
		eq track, 10

		Example.new.other = 10
		eq track, 10
