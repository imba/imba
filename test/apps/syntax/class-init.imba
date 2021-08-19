describe 'Class init' do
	# Let's say you wanted to mark an object as ready after all
	# props have been set, and the constructor-chain has executed.
	# Since subclasses are required to call `super()` in their constructor
	# before manipulating or referencing `this` - this is very difficult.

	# To make working with class inheritance easier, Imba has a
	# reserved method called `#__inited__` that is called immediately
	# after an instance has been constructed.
	
	let nextId = 0
	
	class Model
		id = nextId++
		type = 'model'
		name\string
		
		set desc value
			unless inited?
				console.log "set during construction"
		
		def #__inited__
			inited? = yes
			# this model has now been initialized with properties etc
			# including potential properties supplied by subclass
			initedType = type
	
	class Article < Model
		type = 'article'
		body = '...'
		
		constructor
			super
			yes
	
	test do
		let item = new Article
		eq item.initedType,'article'
	
	test 'base class - no constructor' do
		class Base
			def #__inited__
				level = 1
		let item = new Base
		eq item.level, 1

	test 'base class - no constructor - with field' do
		class Base
			x = 1
			def #__inited__
				level = 1
		let item = new Base
		eq item.level, 1
		
	test 'inherited class - no constructor' do
		class Base
		class Sub < Base
			def #__inited__
				level = 2
		let item = new Sub
		eq item.level, 2
		
	test 'called after fields' do
		class Base
			num = 2
			mult = 2
			def #__inited__
				num = num * mult

		eq (new Base).num, 4
		eq (new Base(num: 3)).num, 6
		
		# __inited__ will be called after fields from
		# subclass is set as well
		class Sub < Base
			mult = 3
			
		eq (new Sub).num, 6
		eq (new Sub(num: 3)).num, 9
	
	
	