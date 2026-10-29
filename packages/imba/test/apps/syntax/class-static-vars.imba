import * as imbac from 'imba/compiler'

# `static let` / `static const` inside functions keep their value between
# calls. The storage is keyed by the self of the function, so inside instance
# methods and getters the variable is unique per instance, inside static
# methods it is unique per class, and in top-level functions it is shared.

let inits = 0

class Counter
	def count
		static let n = 0
		++n

	def other-count
		static let n = 100
		++n

	def two
		static let a = 1
		static let b = 10
		a += 1
		b += 10
		[a, b]

	get memo
		static let m = {}
		m

	def once
		static let value = (++inits)
		value

	def check
		static let warned? = no
		let was = warned?
		warned? = yes
		was

	def previous value
		static let prev
		let res = prev
		prev = value
		res

	def symbol
		static const sym = Symbol!
		sym

	def remember page
		static let m = {page: null, changes: 0}
		if m.page =? page
			m.changes++
		m.changes

	def in-block
		let fn = do
			static let k = 0
			++k
		fn!

	def in-nested-def
		def inner
			static let z = 0
			++z
		inner!

	def with-callback
		static let saved = [1,2,3].map do $1 * 2
		saved

	get cached
		static let store = {}

	def linked
		static let first = 1
		static let second = first + 1

	static def shared
		static let cache = {n: 0}
		++cache.n

class SubCounter < Counter

def top-level
	static let calls = 0
	++calls

let top-block = do
	static let calls = 0
	++calls

describe 'static let in instance methods' do

	test 'value persists between calls' do
		let item = new Counter
		eq item.count!, 1
		eq item.count!, 2
		eq item.count!, 3

	test 'value is unique per instance' do
		let a = new Counter
		let b = new Counter
		a.count!
		a.count!
		eq a.count!, 3
		eq b.count!, 1

	test 'same name in another method is separate' do
		let item = new Counter
		item.count!
		eq item.other-count!, 101
		eq item.count!, 2

	test 'several statics in one method' do
		let item = new Counter
		eq item.two!, [2, 20]
		eq item.two!, [3, 30]

	test 'initializer runs once per instance' do
		let before = inits
		let item = new Counter
		eq item.once!, before + 1
		eq item.once!, before + 1
		eq inits, before + 1
		let other = new Counter
		eq other.once!, before + 2

	test 'predicate-named static variable' do
		let item = new Counter
		eq item.check!, no
		eq item.check!, yes

	test 'static let without initializer' do
		let item = new Counter
		eq item.previous(1), null
		eq item.previous(2), 1
		eq item.previous(3), 2

	test 'static const' do
		let a = new Counter
		let b = new Counter
		let sym = a.symbol!
		assert typeof sym == 'symbol'
		eq a.symbol!, sym
		assert b.symbol! != sym

	test 'set-if-changed on a static object member' do
		let item = new Counter
		eq item.remember('a'), 1
		eq item.remember('a'), 1
		eq item.remember('b'), 2

	test 'static let inside a block keeps the method self' do
		let a = new Counter
		let b = new Counter
		eq a.in-block!, 1
		eq a.in-block!, 2
		eq b.in-block!, 1

	test 'static let inside a nested def keeps the method self' do
		let a = new Counter
		let b = new Counter
		eq a.in-nested-def!, 1
		eq a.in-nested-def!, 2
		eq b.in-nested-def!, 1

	test 'initializer with a callback block' do
		let item = new Counter
		let first = item.with-callback!
		eq first, [2,4,6]
		eq item.with-callback!, first

	test 'subclass instances have their own storage' do
		let a = new Counter
		let b = new SubCounter
		a.count!
		eq b.count!, 1
		eq b.count!, 2

	test 'static let as the last statement returns its value' do
		let item = new Counter
		eq item.linked!, 2
		eq item.linked!, 2

describe 'static let in getters' do

	test 'getter ending in a static let returns the stored value' do
		let item = new Counter
		assert item.cached === item.cached
		eq item.cached, {}
		assert item.cached != (new Counter).cached

	test 'getter returns the same object for one instance' do
		let item = new Counter
		assert item.memo === item.memo
		item.memo.x = 1
		eq item.memo.x, 1

	test 'getter storage is unique per instance' do
		let a = new Counter
		let b = new Counter
		assert a.memo != b.memo

describe 'static let in static methods' do

	test 'value is shared for the class' do
		let start = Counter.shared!
		eq Counter.shared!, start + 1

	test 'subclass gets its own storage' do
		let base = Counter.shared!
		eq SubCounter.shared!, 1
		eq SubCounter.shared!, 2
		eq Counter.shared!, base + 1

describe 'static let outside classes' do

	test 'top-level def shares the value across calls' do
		let start = top-level!
		eq top-level!, start + 1
		eq top-level!, start + 2

	test 'top-level block shares the value across calls' do
		let start = top-block!
		eq top-block!, start + 1

tag static-vars-el
	def tick
		static let n = 0
		++n

describe 'static let in tags' do

	test 'value is unique per element' do
		let a = <static-vars-el>
		let b = <static-vars-el>
		eq a.tick!, 1
		eq a.tick!, 2
		eq b.tick!, 1

describe 'static let compile checks' do

	test 'static variables compile to per-self storage' do
		let res = imbac.compile('class A\n\tdef count\n\t\tstatic let n = 0\n\t\t++n\n', sourcePath: 'statics.imba')
		eq res.errors.length, 0
		assert res.js.indexOf('statics$(this)') >= 0
		assert res.js.indexOf('??= 0') >= 0

	test 'static variables at the top level use globalThis' do
		let res = imbac.compile('def count\n\tstatic let n = 0\n\t++n\n', sourcePath: 'statics.imba')
		assert res.js.indexOf('statics$(globalThis)') >= 0

	test 'destructuring a static variable warns' do
		let res = imbac.compile('def f obj\n\tstatic let {a, b} = obj\n\ta\n', sourcePath: 'statics.imba')
		eq res.warnings.length, 1
		eq res.warnings[0].message, 'Destructuring not supported for static variables'
