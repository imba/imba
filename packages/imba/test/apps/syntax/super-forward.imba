class Base
	def collect ...args
		args

	def first a
		a

	def later ...args
		Promise.resolve(args)

	static def pick ...args
		args

	get label
		'base'

	set label value
		#label = value

class Sub < Base
	def collect a
		super

	def first a
		let res = super
		[res, super]

	def later a
		await super

	static def pick a
		super

	get label
		super + '!'

	set label value
		super

class Extended
	def collect ...args
		args

extend class Extended
	def collect a
		super

class Fielded < Base
	one = 1

class Deeper < Fielded
	two = 2

test "a bare super forwards every argument, named or not" do
	eq (new Sub).collect(1, 2, 3), [1, 2, 3]
	eq Sub.pick(4, 5), [4, 5]
	eq (new Extended).collect(6, 7), [6, 7]

test "a bare super as a value calls the parent with the same arguments" do
	eq (new Sub).first(8), [8, 8]

test "a bare super in an async method forwards its arguments" do
	eq await (new Sub).later(1, 2), [1, 2]

test "a bare super in a getter or setter reads or assigns the property" do
	let sub = new Sub
	eq sub.label, 'base!'
	sub.label = 'x'
	eq sub[Symbol.for('#label')], 'x'

test "a bare super in a method applies the arguments instead of spreading them" do
	ok Sub.prototype.collect.toString!.includes('.apply(this,arguments)')
	ok !Sub.prototype.collect.toString!.includes('...arguments')

test "fields still initialize through the whole class chain" do
	let item = new Deeper
	eq item.one, 1
	eq item.two, 2
