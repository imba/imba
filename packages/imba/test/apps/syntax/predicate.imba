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

	# a predicate def with parameters is a regular method
	def bigger? than
		data.items.length > than

	def includes? item
		data.items.indexOf(item) >= 0

	def includesAll? ...items
		items.every do includes?($1)

	def within? min = 0, max = 10
		min <= data.items.length <= max

	def any? cb
		data.items.some(cb)

	def checkIncludes item
		# implicit self - with and without parens
		let a = includes?(item)
		let b = includes? item
		[a, b, self.includes?(item)]

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

	def holds? item
		includes?(item)

tag predicate-list
	items = [1,2]

	def has? item
		items.indexOf(item) >= 0

	def render
		<self>
			<span.one .on=has?(1)> "one"
			<span.three .on=has?(3)> "three"

def matches? a, b
	a == b

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
	eq (typeof Group.prototype['biggerΦ']), 'function'
	# reading it calls it without arguments - `3 > undefined`
	eq group.bigger?, false

test 'predicate methods take arguments' do
	let group = new Group(items: [1,2,3])
	eq group.includes?(2), true
	eq (group.includes? 4), false
	eq group.includesAll?(1,3), true
	eq group.includesAll?(1,4), false
	eq group.within?!, true
	eq group.within?(4), false
	eq group.within?(1,2), false
	eq group.any?(do $1 > 2), true
	eq (group.any? do $1 > 5), false
	eq group.checkIncludes(3), [true,true,true]
	eq group.holds?(1), true
	eq new Group(items: [5]).includes?(5), true

test 'predicate methods in conditions' do
	let group = new Group(items: [1,2,3])
	let res = []
	if group.includes? 1
		res.push 'a'
	unless group.includes? 9
		res.push 'b'
	res.push 'c' if group.bigger?(1) and !group.bigger?(3)
	eq res, ['a','b','c']

test 'predicate methods with safe chaining and amperfuncs' do
	let nothing = null
	eq nothing..includes?(1), undefined
	let groups = [new Group(items: [1]), new Group(items: [2]), new Group(items: [1,2])]
	eq groups.filter(&.includes?(1)).length, 2
	let target = 2
	eq groups.filter(&.includes?(target)).length, 2

test 'predicate functions and object methods take arguments' do
	eq matches?(1,1), true
	eq (matches? 1, 2), false
	let obj = {
		def has? key
			key == 'a'
	}
	eq obj.has?('a'), true
	eq (obj.has? 'b'), false
	# reading it calls it without arguments
	eq obj.has?, false

test 'predicate methods in tag templates' do
	let el = <predicate-list>
	el.render!
	eq el.has?(2), true
	eq el.querySelector('.one').classList.contains('on'), true
	eq el.querySelector('.three').classList.contains('on'), false

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

test 'function-valued predicate fields are called when read' do
	let custom = new Custom
	eq custom.checked?!, true
	eq custom.checked?, true
	eq (typeof custom['checkedΦ']), 'function'

test 'predicate fields from the init object are stored, not called' do
	let calls = 0
	let custom = new Custom(checked?: do calls++)
	eq calls, 0
	eq (typeof custom['checkedΦ']), 'function'
	eq custom.checked?, 0
	eq calls, 1

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

class Doc
	owner = 'me'
	open? = no

	def readable? by = 'me'
		by == owner

	static def allowed? role = 'admin'
		role == 'admin'

	def checks
		[readable?, self.readable?, readable?('you'), readable? 'me']

class SharedDoc < Doc
	def readable? by = 'me'
		super.readable?(by) or (by == 'friend' and super.readable?)

extend class Doc
	def editable?
		readable?

tag doc-view
	doc = new Doc
	open? = yes

	def render
		<self .readable=doc.readable? .open=open?>
			<input type='checkbox' bind=open?>

test 'reading a predicate method calls it with its defaults' do
	let doc = new Doc
	eq doc.readable?, true
	eq doc.readable?('you'), false
	eq (doc.readable? 'me'), true
	eq doc.checks!, [true, true, false, true]
	eq Doc.allowed?, true
	eq Doc.allowed?('guest'), false
	eq doc.editable?, true
	eq new Doc(owner: 'you').readable?, false
	eq new Doc(owner: 'you').readable?('you'), true

test 'super predicate reads call the inherited method on self' do
	let doc = new SharedDoc
	eq doc.readable?, true
	eq doc.readable?('friend'), true
	eq doc.readable?('stranger'), false
	doc.owner = 'you'
	eq doc.readable?, false
	eq doc.readable?('you'), true

test 'predicate method reads evaluate the receiver once' do
	let made = 0
	let make = do
		made++
		new Doc
	eq make!.readable?, true
	eq made, 1
	let docs = [new Doc, new Doc(owner: 'you')]
	let i = 0
	eq docs[i++].readable?, true
	eq i, 1

test 'predicate method reads with safe chaining and amperfuncs' do
	let nothing = null
	eq nothing..readable?, undefined
	let docs = [new Doc, new Doc(owner: 'you'), new SharedDoc]
	eq docs.filter(&.readable?).length, 2
	eq docs.filter(&.readable?('you')).length, 1

test 'writing a predicate member never calls it' do
	let doc = new Doc
	doc.open? = yes
	eq doc.open?, yes
	eq (doc.open? =? yes), false
	eq (doc.open? =? no), true
	eq doc.open?, no
	let obj = {count?: 0, flag?: null}
	obj.count?++
	obj.count? += 2
	obj.flag? ||= 'set'
	eq obj.count?, 3
	eq obj.flag?, 'set'
	delete obj.flag?
	eq obj.flag?, undefined

test 'set-if-changed reads a predicate on the right' do
	let doc = new Doc
	let group = new Group(items: [1, 2, 3])
	let state = {readable: null, full: null, changes: 0}
	eq (state.readable =? doc.readable?), true
	eq (state.readable =? doc.readable?), false
	eq state.readable, true
	if state.full =? group.full?
		state.changes++
	eq state.full, true
	eq state.changes, 1
	let open = yes
	eq (open =? doc.open?), true
	eq open, no

test 'predicate reads and bindings in tag templates' do
	let el = imba.mount(<doc-view>)
	eq el.classList.contains('readable'), true
	eq el.classList.contains('open'), true
	eq el.querySelector('input').checked, true
	await spec.click('doc-view input')
	eq el.open?, false
	eq el.classList.contains('open'), false
	el.doc.owner = 'you'
	await imba.commit!
	eq el.classList.contains('readable'), false

# `..` short-circuits the rest of the chain, also past a predicate at the
# end of it or in the middle of it
class Turn
	text = ''
	next = null
	parent = null
	get has-content?
		text.length > 0
	def steerable? by = 'me'
		by == 'me'

class Draft
	turn = new Turn
	turns = [new Turn]
	get open?
		yes
	get current?
		turn
	def latest
		turn

class Lane
	draft = null
	pending = null
	blank = {}

	get steer-pending?
		return no if draft..turn.has-content?
		!!pending..turn.steerable?

	def checks
		[draft..turn.has-content?, self.draft..turn.steerable?, draft..turn.has-content?!]

test 'safe chaining before a predicate short-circuits the whole chain' do
	let lane = new Lane
	eq lane.draft..turn.has-content?, undefined
	eq lane.draft..turn.steerable?, undefined
	eq lane.draft..turn.has-content?!, undefined
	eq lane.draft..turn.steerable?!, undefined
	eq lane.draft..turns[0].has-content?, undefined
	eq lane.draft..latest!.has-content?, undefined
	eq lane.draft..turn..has-content?, undefined
	eq lane.draft..open?.toString!, undefined
	eq lane.draft..open?!.toString!, undefined
	eq lane.checks!, [undefined, undefined, undefined]
	eq lane.steer-pending?, false

	lane.draft = new Draft
	lane.pending = new Draft
	eq lane.draft..turn.has-content?, false
	eq lane.draft..turn.steerable?, true
	eq lane.draft..turn.has-content?!, false
	eq lane.draft..turns[0].has-content?, false
	eq lane.draft..latest!.has-content?, false
	eq lane.draft..open?.toString!, 'true'
	eq lane.checks!, [false, true, false]
	eq lane.steer-pending?, true
	lane.draft.turn.text = 'hi'
	eq lane.steer-pending?, false

test 'safe-chained optional calls before a predicate' do
	# `..latest!` is an optional call - a missing method short-circuits too
	let lane = new Lane
	lane.draft = {}
	eq lane.draft..latest!.has-content?, undefined
	lane.draft = new Draft
	lane.draft.turn.text = 'hi'
	eq lane.draft..latest!.has-content?, true
	eq lane.draft..latest!.steerable?('you'), false

test 'a link after the safe chain still throws on a missing value' do
	# like `blank?.turn.text`, only `blank` is guarded
	let lane = new Lane
	let threw = no
	try
		lane.blank..turn.has-content?
	catch e
		threw = yes
	eq threw, true

test 'safe-chained predicate reads evaluate the receiver once' do
	let made = 0
	let make = do
		made++
		new Draft
	eq make!..turn.has-content?, false
	eq made, 1
	let drafts = [null, new Draft]
	let i = 0
	eq drafts[i++]..turn.has-content?, undefined
	eq drafts[i++]..turn.has-content?, false
	eq i, 2
	eq [new Lane, new Lane].map(&.draft..turn.has-content?), [undefined, undefined]

test 'nested safe chains around a predicate read' do
	# `draft..current?.next..parent.has-content?` needs a guard on `draft`
	# inside the guard on `next`
	let lane = new Lane
	eq lane.draft..current?.next..parent.has-content?, undefined
	lane.draft = new Draft
	eq lane.draft..current?.next..parent.has-content?, undefined
	lane.draft.turn.next = new Turn
	lane.draft.turn.next.parent = new Turn
	eq lane.draft..current?.next..parent.has-content?, false
	lane.draft.turn.next.parent.text = 'hi'
	eq lane.draft..current?.next..parent.has-content?, true
