
describe 'Defining classes' do

	test 'Class declarations' do
		class Rectangle
			def constructor height, width
				self.height = height
				self.width = width

		ok new Rectangle

	test 'Class expressions' do
		# unnamed
		let expr = class
			def constructor height, width
				self.height = height
				self.width = width
				
		ok new expr
		eq expr.name, 'expr'

		# named
		let namedexpr = class NamedClass
			def constructor height, width
				self.height = height
				self.width = width

		ok new namedexpr
		ok namedexpr.name == 'NamedClass'

	test 'new class' do
		let obj = new class
			one = 1
			two = 2

			def hello
				yes
		eq obj.hello!, yes
		eq obj.one, 1

describe 'Class body and method definitions' do

	test 'Prototype methods' do

		class Rectangle
			# constructor
			def constructor height, width
				self.height = height
				self.width = width

			# Getter
			get area
				calcArea!

			# Method
			def calcArea
				return height * width

	test 'Static methods' do

		class Point
			# constructor
			def constructor x, y
				self.x = x
				self.y = y


			static def distance a,b
				const dx = a.x - b.x
				const dy = a.y - b.y
				Math.hypot(dx, dy)

		const p1 = new Point(5, 5)
		const p2 = new Point(10, 10)

		eq Point.distance(p2,p1), Math.hypot(5,5)


	test 'Dynamic methods' do
		let method = 'hello'
		class Example

			static def [method]
				return 'static'

			def [method]
				return 'member'

		ok (new Example).hello() == 'member'
		ok Example.hello() == 'static'

test 'Subclassing' do

	class Animal
		def constructor name
			self.name = name

		def speak
			"{name} makes a noise"

	class Dog < Animal
		def constructor name
			super(name)

		def speak
			"{name} barks."

	let dog = new Dog 'Mitzie'

	eq dog.speak(), 'Mitzie barks.'

test 'Super class calls with super' do

	class Cat
		def constructor name
			self.name = name

		def speak
			console.info "{name} makes a noise."

		get alias
			name

	class Lion < Cat
		get alias
			'Lion ' + super.alias

		def speak
			super.speak()
			console.info "{name} roars."

	let lion = new Lion('Fuzzy')

	lion.speak()
	eq $1.log, ['Fuzzy makes a noise.','Fuzzy roars.']
	eq lion.alias, 'Lion Fuzzy'

test 'Reopen class' do
	class Cat
		def constructor name
			self.name = name

		get age
			10

	# add test for
	# calling super is not allowed inside class extend

	extend class Cat

		get health
			100

		def speak
			console.info "{name} makes a noise."

	let cat = new Cat('Cosinus')
	cat.speak()
	eq $1.log, ['Cosinus makes a noise.']

	ok cat.age == 10
	ok cat.health == 100
