class Animal

	def constructor ...params
		params = params

	get name
		'Animal'

	set alias value
		$alias = value

	def skills
		[1,2,3,4]

	def test ...params
		return params

	def something
		yes

class Cat < Animal

	def constructor
		super

	get name
		"Cat {super.name} {super}"

	set alias value
		super # same as super.alias = value
		super.alias = value

	def test
		[
			super, # same as super.test(...arguments)
			super(1), # same as super.test(1)
			super.test(2,3) # same as super.test(2,3)
		]

class Dog < Animal

	def constructor a,b
		super(a)

class Bird < Animal

	def test ...params
		[
			super.test!, # same as super.test()
			super!, # same as super.test()
			super.test! 4,5 # same as super.test(4,5)
		]

	def skills
		let inherited = super.skills!
		inherited.concat(5)

	def chained
		[
			super.skills().concat(5), # the call must be kept before the chain
			super.skills!.concat(6),
			super.test(1,2).length,
			super.skills()[0],
			super.name.length # plain property access - no call
		]

test do
	eq new Cat(1,2,3).params, [1,2,3]

test do
	eq (new Cat).name, "Cat Animal Animal"

test do
	eq (new Cat).test(10,20), [ [10,20],[1],[2,3] ]

test do
	eq new Dog(1,2,3).params, [1]

test do
	eq (new Bird).test(10,20), [ [],[],[4,5] ]
	eq (new Bird).skills!, [1,2,3,4,5]

test do
	eq (new Bird).chained!, [ [1,2,3,4,5], [1,2,3,4,6], 2, 1, 6 ]

test do
	# removed this functionality
	return
	extend class Cat
		set alias value
			super

		def something
			eq super, true
			eq super(), true
			eq super.test(1,2,3), [1,2,3]
			super.test
			super.alias = 4
			eq $alias, 4
			self.alias = 5
			eq $alias, 5

	(new Cat).something()