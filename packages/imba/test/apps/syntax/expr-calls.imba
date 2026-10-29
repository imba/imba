# Calls: multi-line argument lists, bang calls, comma expressions and
# implicit calls that end at an indent or a ternary colon

let collect = do(...args) args

class Registry
	static def enum name, options = {}
		{name: name, options: options}

	static def pair a, b
		[a, b]

	def collect ...args
		args

test 'named arguments on their own lines after a positional one' do
	let res = collect('teacher',
		name: "LOL"
		detail: "funny"
		temperature: 0.35
	)
	eq res, ['teacher', {name: 'LOL', detail: 'funny', temperature: 0.35}]

test 'static call with named arguments continuing on indented lines' do
	let res = Registry.enum('guide',
		name: "Guide"
		web: no
	)
	eq res.name, 'guide'
	eq res.options, {name: 'Guide', web: false}

test 'positional arguments continuing on an indented line' do
	eq collect(1, 2,
		3, 4), [1, 2, 3, 4]

test 'positional arguments one per line' do
	let res = collect(1,
		2,
		3
	)
	eq res, [1, 2, 3]

test 'arguments on their own lines without commas' do
	let res = collect(
		1
		2
		'three'
	)
	eq res, [1, 2, 'three']

test 'arguments on their own lines with trailing commas' do
	let res = collect(
		1,
		2,
	)
	eq res, [1, 2]
	let named = collect(1,
		a: 1,
		b: 2,
	)
	eq named, [1, {a: 1, b: 2}]

test 'implicit call continuing on an indented line' do
	let res = collect 1,
		2
	eq res, [1, 2]
	let more = collect 1, 2,
		3, 4
	eq more, [1, 2, 3, 4]

test 'nested multi-line calls' do
	let res = collect(collect(1,
		2), 3)
	eq res, [[1, 2], 3]
	let deep = collect('a',
		inner: collect('b',
			x: 1
		)
	)
	eq deep, ['a', {inner: ['b', {x: 1}]}]

test 'closing paren at the end of a deeper indented line' do
	let res = Registry.enum('model',
		model: {default: yes, label: 'Table'})
	eq res.options.model, {default: true, label: 'Table'}

test 'object literal closed at the end of an indented line' do
	let tiers =
		free: {
			label: "Free"
			only: 'anyone'}
		paid: {label: "Paid"}
	eq tiers.free, {label: 'Free', only: 'anyone'}
	eq tiers.paid.label, 'Paid'

test 'multi-line arguments with a block' do
	let res = collect(1, do
		2
	)
	eq res[0], 1
	eq res[1]!, 2

test 'multi-line arguments to new' do
	class Box
		def constructor a, opts
			value = [a, opts]
	let box = new Box(1,
		size: 2
		color: 'red'
	)
	eq box.value, [1, {size: 2, color: 'red'}]

test 'multi-line arguments to a method on self' do
	let r = new Registry
	eq r.collect(1,
		2), [1, 2]

test 'arguments are evaluated left to right across lines' do
	let order = []
	let mark = do(v)
		order.push(v)
		v
	collect(mark(1),
		mark(2),
		mark(3)
	)
	collect mark(4),
		mark(5)
	eq order, [1, 2, 3, 4, 5]

test 'an indented object on the next line is the argument of a bare call' do
	let res = collect
		name: 'x'
		size: 2
	eq res, [{name: 'x', size: 2}]
	let one = Registry.enum
		label: 'y'
	eq one, {name: {label: 'y'}, options: {}}

test 'an indented object as the argument of new and await' do
	class Client
		def constructor opts
			options = opts
	let c = new Client
		apiKey: 'k'
		retries: 2
	eq c.options, {apiKey: 'k', retries: 2}
	let update = do(o) Promise.resolve(o)
	let saved = await update
		raw: 1
		name: 'n'
	eq saved, {raw: 1, name: 'n'}

test 'an indented object argument after ||=' do
	let editor = null
	let make = do(o) o
	editor ||= make
		nodes: []
		editable: no
	eq editor, {nodes: [], editable: false}

# Bang calls

test 'bang call after an identifier, member and private field' do
	class Thing
		#fn = do 5
		def run
			#fn!
		def again
			self.run!
		def implicit
			run!
	let t = new Thing
	eq t.run!, 5
	eq t.again!, 5
	eq t.implicit!, 5

test 'bang call after an index' do
	let fns = [(do 1), (do 2)]
	eq fns[0]!, 1
	eq fns[0]! + fns[1]!, 3

test 'bang call after a closing paren' do
	let fns = [(do 1), (do 2)]
	eq (fns[1])!, 2
	let made = (do 4)!
	eq made, 4

test 'bang calls in a chain' do
	let o = {get: (do [(do 'x')])}
	eq o.get![0]!, 'x'
	eq o.get!.length, 1
	eq o..get![0]!, 'x'

test 'bang call on super' do
	class Base
		def name
			'base'
	class Sub < Base
		def name
			super! + '!'
	eq (new Sub).name!, 'base!'

test 'negated bang calls' do
	let o = {no: (do false)}
	eq !o.no!, true
	eq not o.no!, true
	eq !!o.no!, false

# Comma expressions

test 'comma expression in parens returns the last value' do
	let a = 0
	let b = 0
	let res = (a = 1, b = 2, a + b)
	eq res, 3
	eq [a, b], [1, 2]

test 'comma expression with a call' do
	let coupon = 'x'
	let saved = 0
	let save = do saved++
	let clear = do (coupon = null, save!)
	clear!
	eq coupon, null
	eq saved, 1

test 'parenthesized expressions on separate lines' do
	let a = 0
	let b = 0
	let res = (
		a = 1
		b = 2
	)
	eq [res, a, b], [2, 1, 2]

test 'comma expression continuing on an indented line' do
	let a = 0
	let b = 0
	let res = (a = 3,
		b = 4)
	eq [res, a, b], [4, 3, 4]

test 'separator lines between arguments' do
	let res = collect(
		1
		---
		2
	)
	eq res, [1, 2]
	let dashed = collect(
		'a'
		-
		'b'
	)
	eq dashed, ['a', 'b']

# Implicit calls ending at an indent or ternary colon

test 'implicit call in a condition ends at the indented block' do
	let list = [1, 2, 3]
	let res = no
	if list.includes 2
		res = yes
	eq res, true
	let out = []
	for item in list.slice 1
		out.push(item)
	eq out, [2, 3]

test 'implicit call in a ternary ends at a spaced colon' do
	let f = do(v) v * 10
	let flag = yes
	eq (flag ? f 1 : 2), 10
	flag = no
	eq (flag ? f 1 : 2), 2

test 'switch when with several values' do
	let pick = do(v)
		switch v
			when 'u', 'user' then 'person'
			when 'sub', 'stripesub' then 'subscription'
			else 'other'
	eq pick('u'), 'person'
	eq pick('user'), 'person'
	eq pick('stripesub'), 'subscription'
	eq pick('x'), 'other'

test 'semicolons separate statements on one line' do
	let a = 1; let b = 2
	a += 1; b += 1;
	eq [a, b], [2, 3]
