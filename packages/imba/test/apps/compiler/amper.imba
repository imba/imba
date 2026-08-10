import * as imbac from 'imba/compiler'

def compile src
	imbac.compile(src, sourcePath: 'amper.imba', platform: 'browser')

def amper-warnings res
	(res.diagnostics or []).filter(do $1.message.indexOf('memoiz') >= 0)

test 'memoizable ampers compile without warnings' do
	let res = compile """
		class Foo
			limit = 10
			def a items
				items.filter(&.done)
			def b items
				items.filter(&.owner == self)
			def c items
				items.filter(&.price > self.limit)
			def d items
				items.filter(&.matches(self))
	"""
	eq amper-warnings(res).length, 0
	ok res.js.indexOf('memofunc') >= 0

test 'amper capturing a local warns' do
	let res = compile """
		def f items, x
			items.find(&.id == x)
	"""
	let warns = amper-warnings(res)
	eq warns.length, 1
	ok warns[0].message.indexOf("captures 'x'") >= 0
	# points at the captured variable
	eq warns[0].range.start.line, 1

test 'amper with implicit self access warns' do
	let res = compile """
		class Foo
			owner
			def f items
				items.filter(&.owner == owner)
	"""
	let warns = amper-warnings(res)
	eq warns.length, 1
	ok warns[0].message.indexOf('self.owner') >= 0

test 'multiple offending references warn individually' do
	let res = compile """
		class Foo
			kind
			def f items, x
				items.find(&.id == x and &.kind == kind)
	"""
	let warns = amper-warnings(res)
	eq warns.length, 2
