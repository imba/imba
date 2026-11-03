# A loop, switch or try in an expression runs in an arrow function. The arrow
# function shares self and the variables of the method.
class WrappedBase
	get label
		'base'

class Wrapped < WrappedBase
	items = [1, 2]
	count = 2

	def id value
		value

	def lists
		[(for item in items then item * count), (switch count
			when 2 then label
			else no)]

	def attempt
		id(try 1 < count < 3 catch e no)

	def inherited
		id(try super.label)

test 'loops and switches in expressions read self' do
	eq (new Wrapped).lists!, [[2, 4], 'base']

test 'try in an expression declares its variables' do
	eq (new Wrapped).attempt!, yes

test 'try in an expression reads super' do
	eq (new Wrapped).inherited!, 'base'
