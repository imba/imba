# Destructuring patterns, defaults, rest and block parameters in method,
# function and block parameter lists.

class Reader
	def deserialize [kind, params, attrs]
		{kind: kind, params: params, attrs: attrs}

	def pair [a, b] = [1, 2]
		a + b

	def nested [a, [b, c]], {d}
		[a, b, c, d]

	def mixed {x, y = 2} = {}
		[x, y]

	def inner-defaults [a = 10, b = 20]
		a + b

	def head-tail [first, ...others]
		[first, others]

	def object-in-array [{x}, [y]]
		x + y

	def same? [a, b]
		a == b

	def with-rest [a, b], ...rest
		[a, b, rest.length]

	set point [x, y]
		#point = "{x},{y}"

	get point
		#point

	static def parse [key, value]
		"{key}={value}"

describe 'array destructured parameters' do

	test 'method with an array parameter' do
		let reader = new Reader
		eq reader.deserialize(['div', {a: 1}, null]), {kind: 'div', params: {a: 1}, attrs: null}

	test 'missing items are undefined' do
		let res = (new Reader).deserialize(['span'])
		eq res.kind, 'span'
		eq res.params, undefined

	test 'array parameter with a default' do
		let reader = new Reader
		eq reader.pair!, 3
		eq reader.pair([5, 5]), 10
		eq reader.pair(undefined), 3

	test 'nested array next to an object pattern' do
		eq (new Reader).nested([1, [2, 3]], {d: 4}), [1, 2, 3, 4]

	test 'defaults inside the array pattern' do
		let reader = new Reader
		eq reader.inner-defaults([]), 30
		eq reader.inner-defaults([1]), 21
		eq reader.inner-defaults([1, 2]), 3

	test 'rest inside the array pattern' do
		eq (new Reader).head-tail([1, 2, 3]), [1, [2, 3]]
		eq (new Reader).head-tail([1]), [1, []]

	test 'object pattern inside an array pattern' do
		eq (new Reader).object-in-array([{x: 1}, [2]]), 3

	test 'predicate method with an array parameter' do
		let reader = new Reader
		eq reader.same?([1, 1]), yes
		eq reader.same?([1, 2]), no

	test 'array parameter followed by a rest parameter' do
		eq (new Reader).with-rest([1, 2], 'a', 'b'), [1, 2, 2]

	test 'setter with an array parameter' do
		let reader = new Reader
		reader.point = [3, 4]
		eq reader.point, '3,4'

	test 'static method with an array parameter' do
		eq Reader.parse(['a', 1]), 'a=1'

	test 'object parameter with a default' do
		let reader = new Reader
		eq reader.mixed!, [undefined, 2]
		eq reader.mixed({x: 1}), [1, 2]
		eq reader.mixed({x: 1, y: 3}), [1, 3]

describe 'array destructured parameters outside classes' do

	def area [w, h] = [2, 3]
		w * h

	test 'top-level def with an array parameter and default' do
		eq area!, 6
		eq area([4, 5]), 20

	test 'block with an array parameter' do
		let entries = Object.entries({a: 1, b: 2})
		let joined = entries.map do([key, value]) "{key}{value}"
		eq joined, ['a1', 'b2']

	test 'block with array parameter in a non-final slot' do
		let run = do(fn, arg) fn(arg)
		let res = run(&, ['x', 'y']) do([first, second])
			second + first
		eq res, 'yx'

	test 'block with an array parameter and a default' do
		let fn = do([a, b] = [1, 1]) a - b
		eq fn!, 0
		eq fn([5, 2]), 3

	test 'for-of entries with block destructuring' do
		let map = new Map([['a', 1], ['b', 2]])
		let out = [...map].map do([k, v]) k.repeat(v)
		eq out, ['a', 'bb']

describe 'rest and block parameters' do

	def collect first, ...rest
		[first, rest]

	def call-with value, &cb
		cb(value)

	test 'rest parameter' do
		eq collect(1, 2, 3), [1, [2, 3]]
		eq collect(1), [1, []]

	test 'block parameter marked with &' do
		eq call-with(2, do $1 * 10), 20

	test 'block parameter on a method' do
		class Runner
			def run value, &fn
				[typeof fn, fn(value)]

		eq (new Runner).run(1, do $1 + 1), ['function', 2]

	test 'rest parameter on a descriptor factory' do
		class Model
			def @list ...args
				{
					args: args
					$get: do(target, key) target[key] ?? []
					$set: do(value, target, key) target[key] = value
				}

		class Doc < Model
			tags @list('a', 'b')
			empty @list

		let doc = new Doc
		eq doc.@@tags.args, ['a', 'b']
		eq doc.@@empty.args, []
		eq doc.tags, []
