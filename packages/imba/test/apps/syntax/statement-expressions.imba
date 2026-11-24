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

# An await in such an expression makes the arrow function async, and the
# method awaits the result of the arrow function.
class Awaiting
	items = [1, 2]

	def id value
		value

	def later value
		new Promise do(resolve) setTimeout(&,1) do resolve(value)

	def numbers n
		for i in [0 ... n]
			yield await later(i)

	def tried
		[id(try await later('value')), (try await later('value')).length]

	def caught
		id(try await Promise.reject(new Error('failed')) catch e e.message)

	def rescued
		id(try (rescue await later('value')).length)

	def lists
		[(for item in items then await later(item * 10)), (switch await later(2)
			when 2 then await later('two')
			else no)]

	def iterated
		id(for await x of numbers(3) then x * 10)

test 'try with await in an expression' do
	eq await (new Awaiting).tried!, ['value', 5]

test 'try with await in an expression catches the rejection' do
	eq await (new Awaiting).caught!, 'failed'

test 'try with rescue await in an expression' do
	eq await (new Awaiting).rescued!, 5

test 'loops and switches with await in expressions' do
	eq await (new Awaiting).lists!, [[10, 20], 'two']

test 'for await in an expression' do
	eq await (new Awaiting).iterated!, [0, 10, 20]
