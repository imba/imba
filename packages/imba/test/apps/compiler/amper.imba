import * as imbac from 'imba/compiler'

def compile src
	imbac.compile(src, sourcePath: 'amper.imba', platform: 'browser')

def amper-warnings res
	(res.diagnostics or []).filter(do $1.message.indexOf('memoiz') >= 0)

# --- compilation shape ---

test 'capture-free ampers hoist as shared memofuncs' do
	let res = compile """
		def f items
			items.filter(&.done)
	"""
	eq amper-warnings(res).length, 0
	ok res.js.match(/ƒ\d+ = imba_memofunc\("&\.done",globalThis/)

test 'explicit self ampers memoize per instance' do
	let res = compile """
		class Foo
			limit = 10
			def a items
				items.filter(&.owner == self)
			def b items
				items.filter(&.price > self.limit)
			def c items
				items.filter(&.matches(self))
	"""
	eq amper-warnings(res).length, 0
	eq (res.js.match(/imba_memofunc\("[^"]+",this,/g) or []).length, 3

test 'implicit self access memoizes per instance' do
	let res = compile """
		class Foo
			owner
			def f items
				items.filter(&.owner == owner)
	"""
	eq amper-warnings(res).length, 0
	ok res.js.indexOf('imba_memofunc("&.owner == owner",this,(v$)=>v$.owner == this.owner)') >= 0

test 'single-assignment locals become capture slots' do
	let res = compile """
		def f items, x
			items.find(&.id == x)
	"""
	eq amper-warnings(res).length, 0
	ok res.js.indexOf('imba_memofuncv("&.id == x\\u0001x",globalThis,(v$)=>v$.id == x,[x])') >= 0

test 'self and captures combine' do
	let res = compile """
		class Foo
			def f items, x
				items.find(&.id == x and &.owner == self)
	"""
	eq amper-warnings(res).length, 0
	ok res.js.match(/imba_memofuncv\("[^"]+\\u0001x",this,/)

test 'captures hiding in index access, interpolation and ternaries are found' do
	let res = compile """
		def a items, idx
			items.filter(&.list[idx] > 0)
		def b items, prefix
			items.filter(&.name == "\{prefix}x")
		def c items, t
			items.filter(&.done ? t : false)
	"""
	eq amper-warnings(res).length, 0
	eq (res.js.match(/imba_memofuncv\(/g) or []).length, 3
	# none of them may hoist to a module-level ƒ const
	ok !res.js.match(/ƒ\d+/)

test 'two different ternary ampers get distinct hashes' do
	let res = compile """
		def one list
			list.filter(&.done ? true : false)
		def two list
			list.filter(&.active ? 1 : 0)
	"""
	ok res.js.indexOf('"&.done ? true : false"') >= 0
	ok res.js.indexOf('"&.active ? 1 : 0"') >= 0

test 'reassigned captures deopt with a warning' do
	let res = compile """
		def f list
			let t = 1
			let fn = list.find(&.id == t)
			t = 2
			fn
	"""
	let warns = amper-warnings(res)
	eq warns.length, 1
	ok warns[0].message.indexOf("captures 't' which is reassigned") >= 0
	ok res.js.indexOf('memofunc') == -1

test 'increment and compound assignment count as reassignment' do
	let res = compile """
		def a list, n
			n++
			list.find(&.id == n)
		def b list, n
			n += 1
			list.find(&.id == n)
	"""
	eq amper-warnings(res).length, 2

test 'destructuring reassignment counts as reassignment' do
	let res = compile """
		def f list, pair
			let a = 1
			let b = 2
			[a, b] = pair
			list.find(&.id == b)
	"""
	eq amper-warnings(res).length, 1

# --- runtime behavior ---

def grab fn
	fn

test 'implicit self access returns stable identity per instance' do
	class Wrapper
		def ref
			grab(&.wrapper == wrapper)

	let a = new Wrapper
	let b = new Wrapper
	ok a.ref! === a.ref!
	ok a.ref! !== b.ref!
	ok a.ref!.memoized

test 'captured locals key the memo by value' do
	def refiner x
		grab(&.id == x)

	ok refiner(1) === refiner(1)
	ok refiner(1) !== refiner(2)
	ok refiner(1).memoized

	let o1 = {}
	let o2 = {}
	def objref x
		grab(&.owner == x)
	ok objref(o1) === objref(o1)
	ok objref(o1) !== objref(o2)

test 'loop variables memoize per iteration value' do
	let fns = []
	for x in [1, 2, 1]
		fns.push(grab(&.id == x))
	ok fns[0] === fns[2]
	ok fns[0] !== fns[1]

test 'self plus capture keys on both' do
	class Owner
		def ref x
			grab(&.id == x and &.owner == self)

	let a = new Owner
	let b = new Owner
	ok a.ref(1) === a.ref(1)
	ok a.ref(1) !== a.ref(2)
	ok a.ref(1) !== b.ref(1)

test 'capture-slot refiners filter correctly' do
	def only-id items, x
		items.filter(&.id == x)

	let items = [{id: 1}, {id: 2}, {id: 1}]
	eq only-id(items, 1).length, 2
	eq only-id(items, 2).length, 1
	eq only-id(items, 3).length, 0

test 'reassigned captures stay plain closures' do
	let t = 1
	let f1 = grab(&.id == t)
	t = 2
	let f2 = grab(&.id == t)
	ok f1 !== f2
	ok !f1.memoized
	# closures over a reassigned binding read the live value
	ok f1({id: 2})
