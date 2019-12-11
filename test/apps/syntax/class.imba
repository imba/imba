

class Item
	prop hello

	def constructor title
		@title = title

	def archive
		@archived = yes

	# static def type
	# 	'Item'

class Todo < Item
	def due
		yes

global class GlobalTodo < Todo
	def due
		yes

extend class Todo
	
	def extended
		yes

describe 'Defining classes' do

	test 'Class declarations' do
		class Rectangle
			def constructor height, width
				@height = height
				@width = width

		ok Rectangle.new

	test 'Class expressions' do
		# unnamed
		var expr = class
			def constructor height, width
				@height = height
				@width = width
		ok expr.new
		ok expr.name == 'expr'

		# named
		var expr = class NamedClass
			def constructor height, width
				@height = height
				@width = width
		ok expr.new
		ok expr.name == 'NamedClass'

describe 'Class body and method definitions' do

	test 'Prototype methods' do

		class Rectangle
			# constructor
			def constructor height, width
				@height = height
				@width = width

			# Getter
			get area
				@calcArea()

			# Method
			def calcArea
				return @height * @width

	test 'Static methods' do

		class Point
			# constructor
			def constructor x, y
				@x = x
				@y = y


			static def distance a,b
				const dx = a.x - b.x
				const dy = a.y - b.y
				Math.hypot(dx, dy)

		const p1 = Point.new(5, 5)
		const p2 = Point.new(10, 10)

		eq Point.distance(p2,p1), Math.hypot(5,5)


	test 'Dynamic methods' do
		let method = 'hello'
		class Example

			static def [method]
				return 'static'

			def [method]
				return 'member'

		ok Example.new.hello() == 'member'
		ok Example.hello() == 'static'

describe 'Subclassing' do
	test do
		yes
