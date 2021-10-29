const eq = global.eq

describe "Class Fields" do
	
	describe "without constructor" do

		class Rect
			width = 0
			height = width

		test 'defaults' do
			# by default - a class without a constructor
			# will take a single object 
			let rect = new Rect
			eq rect.width, 0
			eq rect.height, 0

		test 'override height' do
			# you can override the default values
			let rect = new Rect height: 2
			eq rect.width, 0
			eq rect.height, 2

		test 'override width' do
			# the default value for height is width
			# so if we override the value of width
			# height will also change
			let rect = new Rect width: 2
			eq rect.width, 2
			eq rect.height, 2

	describe "internals" do
		# This is how the default constructor looks under the hood
		class Rect
			def initFields params = {}
				field1 = params.field1 or field1Default
				field2 = params.field2 or field2Default
				# ...

			# if no constructor is defined - this is the default:
			def defaultConstructor params
				initFields(params)

			# if you define a constructor - initFields will be called
			# at the very start of your construction
			def myConstructor params
				# automatically call initFields
				initFields() # hidden 
				# your code here ...

			# if you refer to super in your constructor - you can change
			# when and with what parameters initFields is called
			def customConstructor params
				global.eq width, undefined

	describe "with constructor" do
		test "empty" do

			class Rect
				width = 1
				height = 1

				def constructor ...pars
					# fields are automaticall inited with default values
					# before your custom constructor is called
					self

			let rect = new Rect(width: 2, height: 2)
			# when you define your own constructor - without explicitly
			# calling super - the default values will not be overridden
			# by any arguments you may pass into the constructor
			eq rect.width, 1
			eq rect.height, 1
		
		test "super" do
			class Rect
				width = 1
				height = 1

				# if you refer to super in your constructor - you can change
				# when and with what parameters initFields is called
				def constructor w,h
					# fields are not inited until you call super
					eq width, undefined
					super
					# now they are inited
					eq width, 1
					eq height, 1
					self
			
			new Rect(10,10)

		test "super(params)" do
			class Rect
				width = 1
				height = 1

				# if you refer to super in your constructor - you can change
				# when and with what parameters initFields is called
				def constructor w,h,...rest
					# call super with an argument to pass in potential value
					# overrides for the fields
					super(width: w, height: h)
					meta = rest
					self
			
			let rect = new Rect(10,10)
			eq rect.width, 10
			eq rect.height, 10

		

	describe "inheritance" do
		# the benefit of this way of initing fields is that you can control
		# when & how the fields are initialized, and the nested order of initing
		# 
		class Rect
			width = 0
			height = 0

			def constructor checkWidth, checkHeight
				# at this point - all fields _including_ fields declared
				# in subclasses are inited
				# super(params)
				eq width, checkWidth
				eq height, checkHeight
				yes
			
		class Square < Rect
			size = 10
			width = size
			height = size

		test do
			# even in the outer constructor - all fields
			# from the subclass are already initialized correctly
			new Rect(0,0)
			new Square(10,10)

		test do
			# in regular javascript
			class Item
				title = 'Unnamed item'
				def constructor params
					# do various stuff
					setup!
				
				def setup
					self

			class Todo < Item
				title = 'My important task'

			class Project < Item
				title = 'My new project'

				# custom project setup
				def setup
					# with basic javascript fields, this would fail
					# since setup would be called before any fields
					# from subclasses are initialized.
					eq title, 'My new project'
			
			# Here we see that all classes inheriting from item will
			# call setup in the top constructor - but you can still
			# trust that all fields and defaults are already set.
			# Following the same type of pattern in regular js, where
			# we essentially do some shared initialization and call
			# overridable hooks (like setup here) from the initial constructor
			# is very cumbersome.

	# native inheritance
	describe "native inheritance" do
		# adding fields when inheriting from native classes also works
		class BaseArray < Array
			name = 'Array'
			id\number

			def constructor id, ...rest
				super(...rest)
				self.id = id
				yes
			
			set name value
				#counter = (#counter or 0) + 1
				#name = value

			get name
				#name

		class AppArray < BaseArray

		class List < AppArray
			name = 'List'
			order = 'ascending'

		class TodoList < List
			name = 'Todos'
		
		test 'BaseArray' do
			let arr = new BaseArray(1000,1,2,3,4)
			eq arr.length, 4
			eq arr.id, 1000
			eq arr.#counter, 1
			eq arr.name, 'Array'

		test 'AppArray' do
			let arr = new AppArray(1001,1,2,3,4)
			eq arr.length, 4
			eq arr.id, 1001
			eq arr.#counter, 1
			eq arr.name, 'Array'

		test 'List' do
			let arr = new List(1002,1,2,3,4)
			eq arr.length, 4
			eq arr.id, 1002
			eq arr.#counter, 2
			eq arr.name, 'List'

		test 'TodoList' do
			let arr = new TodoList(1003,1,2,3,4)
			eq arr.length, 4
			eq arr.id, 1003
			eq arr.#counter, 3
			eq arr.name, 'Todos'