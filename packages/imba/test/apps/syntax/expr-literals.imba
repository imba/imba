# Literals: number formats, byte units, booleans, typed values, object keys
# and global declarations

test 'number formats' do
	eq 0xff, 255
	eq 0b1010, 10
	eq 0o17, 15
	eq 1_000_000, 1000000
	eq 0b1111_0000, 240
	eq 0xff_ff, 65535
	eq 1e3, 1000
	eq .5, 0.5
	eq 1.5e-2, 0.015
	eq -0.5 * 2, -1

test 'byte size units' do
	eq 1kb, 1024
	eq 2mb, 2 * 1024 * 1024
	eq 1gb, 1024 * 1024 * 1024
	eq 0.5kb, 512

test 'booleans and nullish literals' do
	eq yes, true
	eq no, false
	eq true, yes
	eq false, no
	eq null, null
	assert undefined === void 0
	eq [yes, no].map(do !$1), [false, true]

test 'symbol-like strings' do
	let a = :foo
	let b = :foo-bar
	eq a, 'foo'
	eq b, 'fooBar'

test 'type annotations on literals are dropped' do
	let a = 1\number
	let b = [1, 2]\number[]
	let c = (1 + 1)\number
	let d = 'a'\string
	let e = yes\boolean
	let f = []\string[]
	eq [a, b, c, d, e, f], [1, [1, 2], 2, 'a', true, []]

test 'type annotations on object keys are dropped' do
	let a = 2
	let o = {a\number: 1, b\string: 'x'}
	eq o, {a: 1, b: 'x'}
	let short = {a\number}
	eq short, {a: 2}

test 'computed keys in parens and brackets' do
	let k = 'z'
	let o = {(k): 1, (k + 'y'): 2, [k + 'x']: 3}
	eq o, {z: 1, zy: 2, zx: 3}
	let n = 2
	eq {(n * 2): 'four'}[4], 'four'

test 'quoted and numeric object keys' do
	let o = {'a-b': 1, "c d": 2, 3: 'three'}
	eq o['a-b'], 1
	eq o['c d'], 2
	eq o[3], 'three'

test 'destructuring defaults written with =' do
	let {a = 1, b = 2} = {b: 3}
	eq [a, b], [1, 3]

test 'destructuring default on an indented line' do
	let {g =
		2} = {}
	eq g, 2

test 'object values on indented lines' do
	let o =
		a:
			1 + 1
		b: [
			1
			2
		]
	eq o, {a: 2, b: [1, 2]}

global let EXPR_LITERALS_COUNTER = 1
global const EXPR_LITERALS_NAME = 'literals'

test 'global let and global const define properties on globalThis' do
	eq globalThis.EXPR_LITERALS_COUNTER, 1
	eq globalThis.EXPR_LITERALS_NAME, 'literals'
	EXPR_LITERALS_COUNTER++
	eq globalThis.EXPR_LITERALS_COUNTER, 2

test 'array literals over several lines' do
	let a = [
		1, 2
		3
		4,
	]
	eq a, [1, 2, 3, 4]
	let nested = [[1, 2],
		[3, 4]]
	eq nested, [[1, 2], [3, 4]]

test 'member assignment with an indented object' do
	let WIDGET = {}
	WIDGET.FLAGS =
		Created: 1
		Enabled: 2
		Deleted: 4
	eq WIDGET.FLAGS, {Created: 1, Enabled: 2, Deleted: 4}
	eq WIDGET.FLAGS.Enabled | WIDGET.FLAGS.Deleted, 6

test 'reassignment with the value on an indented line' do
	let total = 0
	total =
		1 + 2
	eq total, 3
