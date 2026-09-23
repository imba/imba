class Group

	def constructor data
		data = data

	def add item
		data.items.push(item)

	get archived?
		data.archived != null

	get active?
		!archived? && !empty?

	get empty?
		data.items.length == 0

	# a predicate def without parameters compiles to a getter
	def full?
		data.items.length >= 3

	# a predicate def with parameters stays a regular method
	def bigger? than
		data.items.length > than

	static def registry?
		yes

	def empty
		data.items = []
		return self

	def emptyOrArchived
		empty? or archived?

	def selfChecks
		# implicit self - plain access and explicit calls on getter and def
		[empty?, empty?!, full?, full?!]

extend class Group
	def extended?
		yes

class Custom
	# a field holding a real function
	checked? = do yes

let calls = 0
def getGroup
	calls++
	new Group(items: [1])

test do
	let group = new Group(items: [])
	eq group.empty?,true

	group.add(1)
	eq group.empty?,false

	group.empty!
	eq group.empty?,true

	eq group.active?, false

test 'def predicates without params are getters' do
	let group = new Group(items: [1,2,3])
	eq group.full?, true
	eq (typeof group.full?), 'boolean'
	eq new Group(items: []).full?, false
	eq Group.registry?, true
	eq group.extended?, true
	eq (typeof Object.getOwnPropertyDescriptor(Group.prototype,'fullΦ').get), 'function'
	eq (typeof Object.getOwnPropertyDescriptor(Group,'registryΦ').get), 'function'

test 'def predicates with params stay methods' do
	let group = new Group(items: [1,2,3])
	eq group.bigger?(2), true
	eq group.bigger?(5), false
	eq (typeof group.bigger?), 'function'

test 'explicit calls work for getters and defs' do
	let group = new Group(items: [1,2,3])
	eq group.full?!, true
	eq group.full?(), true
	eq group.empty?!, false
	eq group.archived?!, false
	let checks = group.selfChecks!
	eq checks[0], false
	eq checks[1], false
	eq checks[2], true
	eq checks[3], true

test 'explicit call on a function-valued predicate calls it' do
	let custom = new Custom
	eq custom.checked?!, true
	eq (typeof custom.checked?), 'function'

test 'explicit call evaluates the receiver once' do
	calls = 0
	eq getGroup!.empty?!, false
	eq calls, 1

	let groups = [new Group(items: [])]
	let i = 0
	eq groups[i++].empty?!, true
	eq i, 1

test 'safe-chained explicit call' do
	let nothing = null
	eq nothing..empty?!, undefined
	let group = new Group(items: [])
	eq group..empty?!, true

test 'object literal def predicate is a getter' do
	let obj = {
		def ready?
			yes
	}
	eq obj.ready?, true
	eq obj.ready?!, true

test 'explicit call on a fresh instance binds new to the constructor' do
	eq new Group(items: []).empty?!, true
	eq new Group(items: [1,2,3]).full?!, true
	eq new Group(items: [1,2,3]).bigger?(1), true
	eq new Group(items: []).full?, false

test 'explicit call inside an amperfunc' do
	let groups = [new Group(items: []), new Group(items: [1,2,3])]
	eq groups.filter(&.full?!).length, 1
	eq groups.filter(&.empty?!).length, 1
	eq groups.filter(&.full?).length, 1
	eq groups.map(&.data.items.length).length, 2

class Loader
	def ready?
		await Promise.resolve(1)
		yes

	get loaded?
		await Promise.resolve(1)
		yes

	static def shared?
		await Promise.resolve(1)
		yes

	def bigger? n
		await Promise.resolve(1)
		n > 1

	def check
		await ready?

test 'async predicates are promise-returning getters' do
	let loader = new Loader
	eq (loader.ready? isa Promise), true
	eq (loader.loaded? isa Promise), true
	let a = await loader.ready?
	eq a, true
	let b = await loader.ready?!
	eq b, true
	let c = await loader.loaded?
	eq c, true
	let d = await Loader.shared?
	eq d, true
	let e = await loader.bigger?(2)
	eq e, true
	let f = await loader.bigger?(0)
	eq f, false
	let g = await loader.check!
	eq g, true
