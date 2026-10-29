# `#name` members in class bodies. They compile to properties keyed by
# Symbol.for('#name'), so they never show up as string keys.

const COUNT = Symbol.for('#count')

class Counter
	#count = 0
	#name\string
	#bare
	#next\Counter? = null
	#settle-timer = null
	#ready? = no
	#items = []
	#active = new Map
	static #registry = []
	visible = 1

	def incr
		#count++
		#count

	def decr
		--#count

	def add by
		#count += by

	def lazy-list
		#cache ||= []

	def lazy-value
		#other ??= 5
		#other

	def lazy-push value
		(#watchers ||= []).push(value)
		#watchers.length

	def link other\Counter
		#next = other
		self

	def next-count
		#next..#count

	def peek other\Counter
		other.#count

	def poke other\Counter, value
		other.#count = value

	def mark value
		#settle-timer =? value

	def toggle
		#ready? = !#ready?

	def drop
		delete #count
		#count

	def labels prefix
		#items.map do "{prefix}{$1}{#count}"

	def track key
		#active.set(key, (#active.get(key) or 0) + 1)
		#active.get(key)

	get name
		#name

	set name value
		#name = value.toUpperCase!

	static def register item
		#registry.push(item)
		#registry.length

describe 'private field declarations' do

	test 'initialized values' do
		let item = new Counter
		eq item[COUNT], 0
		eq item[Symbol.for('#next')], null
		eq item[Symbol.for('#settle-timer')], null
		eq item[Symbol.for('#ready?')], no
		eq item[Symbol.for('#items')], []
		assert item[Symbol.for('#active')] isa Map

	test 'declarations without value are own symbol properties' do
		let item = new Counter
		assert item.hasOwnProperty(Symbol.for('#name'))
		assert item.hasOwnProperty(Symbol.for('#bare'))
		eq item[Symbol.for('#name')], undefined
		eq item[Symbol.for('#bare')], undefined

	test 'private fields are symbol keyed, not string keyed' do
		let item = new Counter
		eq Object.keys(item), ['visible']
		assert !item.hasOwnProperty('count')
		assert !item.hasOwnProperty('#count')
		let syms = Object.getOwnPropertySymbols(item)
		assert syms.indexOf(COUNT) >= 0
		assert syms.indexOf(Symbol.for('#settle-timer')) >= 0

	test 'each instance gets its own rich values' do
		let a = new Counter
		let b = new Counter
		assert a[Symbol.for('#items')] != b[Symbol.for('#items')]
		assert a[Symbol.for('#active')] != b[Symbol.for('#active')]

	test 'init object with symbol keys fills private fields' do
		let item = new Counter({[COUNT]: 10})
		eq item.incr!, 11
		let plain = new Counter({'#count': 10})
		eq plain.incr!, 1

	test 'static private field' do
		eq Counter[Symbol.for('#registry')], []
		eq Counter.register('a'), 1
		eq Counter.register('b'), 2
		eq Counter[Symbol.for('#registry')], ['a','b']
		assert !Counter.hasOwnProperty('registry')

describe 'private field access from methods' do

	test 'increment, decrement and compound assignment' do
		let item = new Counter
		eq item.incr!, 1
		eq item.incr!, 2
		eq item.decr!, 1
		eq item.add(10), 11
		eq item[COUNT], 11

	test '||= initializes once' do
		let item = new Counter
		let list = item.lazy-list!
		assert list isa Array
		eq item.lazy-list!, list

	test '??= initializes once' do
		let item = new Counter
		eq item.lazy-value!, 5
		item[Symbol.for('#other')] = 0
		eq item.lazy-value!, 0

	test 'parenthesized ||= result can be used' do
		let item = new Counter
		eq item.lazy-push(1), 1
		eq item.lazy-push(2), 2
		eq item[Symbol.for('#watchers')], [1,2]

	test 'set-if-changed on a private field' do
		let item = new Counter
		eq item.mark(1), yes
		eq item.mark(1), no
		eq item.mark(2), yes
		eq item[Symbol.for('#settle-timer')], 2

	test 'predicate-named private field' do
		let item = new Counter
		eq item.toggle!, yes
		eq item.toggle!, no

	test 'delete a private field' do
		let item = new Counter
		item.incr!
		eq item.drop!, undefined
		assert !item.hasOwnProperty(COUNT)

	test 'private field of another instance' do
		let a = new Counter
		let b = new Counter
		b.incr!
		b.incr!
		eq a.peek(b), 2
		a.poke(b, 7)
		eq b[COUNT], 7

	test 'optional chain into a private field' do
		let a = new Counter
		eq a.next-count!, undefined
		let b = new Counter({[COUNT]: 3})
		a.link(b)
		eq a.next-count!, 3

	test 'private fields inside callbacks keep self' do
		let item = new Counter({[COUNT]: 1, [Symbol.for('#items')]: ['a','b']})
		eq item.labels('-'), ['-a1','-b1']

	test 'private map field' do
		let item = new Counter
		eq item.track('x'), 1
		eq item.track('x'), 2
		eq item.track('y'), 1

	test 'getter and setter backed by a private field' do
		let item = new Counter
		item.name = 'jane'
		eq item.name, 'JANE'
		eq item[Symbol.for('#name')], 'JANE'

describe 'private methods and accessors' do

	class Panel
		#count = 0

		get #view
			"view{#count}"

		set #view value
			#count = value

		def #bump by = 1
			#count += by

		def #cancel-move
			'cancelled'

		def run
			#bump(2)
			#bump!
			let before = #view
			#view = 10
			[before, #view, #cancel-move!]

	test 'private methods are called through their symbol' do
		let panel = new Panel
		eq panel.run!, ['view3','view10','cancelled']

	test 'private accessors live on the prototype under the symbol' do
		let desc = Object.getOwnPropertyDescriptor(Panel.prototype, Symbol.for('#view'))
		assert desc.get isa Function
		assert desc.set isa Function
		assert Panel.prototype[Symbol.for('#bump')] isa Function
		assert Panel.prototype[Symbol.for('#cancel-move')] isa Function
		assert !Panel.prototype.hasOwnProperty('bump')

describe 'private fields across classes' do

	class Base
		#secret = 'base'

		def reveal
			#secret

	class Sub < Base
		#extra = 'sub'

		def both
			[#secret, #extra]

	test 'subclass can read the base private field' do
		let item = new Sub
		eq item.reveal!, 'base'
		eq item.both!, ['base','sub']

	test 'subclass sees the same symbol storage' do
		let item = new Sub({[Symbol.for('#secret')]: 'given'})
		eq item.reveal!, 'given'

	test 'private fields declared lazily in an extend class' do
		class Store
			items = []

		extend class Store
			get index
				#index ||= new Map

			def put key, value
				index.set(key, value)
				self

		let store = new Store
		store.put('a', 1).put('b', 2)
		eq store.index.size, 2
		eq store.index, store[Symbol.for('#index')]

tag private-fields-el
	#customizing = no
	#analytics = yes

	def toggle
		#customizing = !#customizing

	get state
		[#customizing, #analytics]

describe 'private fields in tags' do

	test 'tag private fields are initialized' do
		let el = <private-fields-el>
		eq el.state, [no, yes]
		el.toggle!
		eq el.state, [yes, yes]
