# Loop forms the apps use beyond the basic for-in/for-of: for await,
# postfix for/while, three loop variables, typed loop variables, dynamic
# ranges, stepping with `by`, while/loop/until used as expressions.

def wait ms, value
	new Promise do(resolve) setTimeout(&,ms) do resolve(value)

def numbers n
	for i in [0 ... n]
		await wait(1)
		yield i

def pairs
	yield ['a',1]
	await wait(1)
	yield ['b',2]

describe 'for await' do

	test 'iterates an async generator' do
		let res = []
		for await x of numbers(3)
			res.push x
		eq res, [0,1,2]

	test 'as an expression' do
		let res = for await x of numbers(3)
			x * 10
		eq res, [0,10,20]

	test 'as the last expression of a function' do
		def run
			for await x of numbers(3)
				x + 1
		eq await run!, [1,2,3]

	test 'makes the enclosing function async' do
		def run
			let res = []
			for await x of numbers(2)
				res.push x
			res
		let promise = run!
		assert promise isa Promise
		eq await promise, [0,1]

	test 'awaits each promise in an array' do
		let res = []
		for await value of [wait(3,'a'), 'b', wait(1,'c')]
			res.push value
		eq res, ['a','b','c']

	test 'destructures each value' do
		let res = []
		for await [k,v] of pairs!
			res.push "{k}{v}"
		eq res, ['a1','b2']

	test 'with an index variable' do
		let res = for await x, i of numbers(3)
			"{x}:{i}"
		eq res, ['0:0','1:1','2:2']

	test 'break stops the iteration' do
		let res = []
		for await x of numbers(10)
			break if x > 1
			res.push x
		eq res, [0,1]

	test 'inside a do callback' do
		let run = do
			let res = []
			for await x of numbers(2)
				res.push x
			res
		eq await run!, [0,1]

describe 'postfix for' do

	test 'as a statement' do
		let res = []
		res.push(x * 2) for x in [1,2,3]
		eq res, [2,4,6]

	test 'calling a method on each item' do
		let calls = []
		let waiters = [(do calls.push 'a'), (do calls.push 'b')]
		w! for w in waiters
		eq calls, ['a','b']

	test 'in parens as a value' do
		let res = (x * x for x in [1,2,3])
		eq res, [1,4,9]

	test 'as a call argument with a guard' do
		let old = [1,2,null,3]
		let keep = new Set([2])
		let missing = new Set(id for id of old when id and !keep.has(id))
		eq Array.from(missing), [1,3]

	test 'with an index variable' do
		let res = ("{x}{i}" for x,i in ['a','b'])
		eq res, ['a0','b1']

	test 'awaiting each item in turn' do
		let log = []
		def step name
			await wait(1)
			log.push name
		def run
			await step(name) for name in ['a','b','c']
			log
		eq await run!, ['a','b','c']

	test 'yield for each item in a generator' do
		def gen list
			yield x * 2 for x in list
		eq Array.from(gen([1,2,3])), [2,4,6]

describe 'postfix while' do

	test 'increments until the condition fails' do
		let prefix = 'abcx'
		let item = 'abcd'
		let i = 0
		i++ while i < prefix.length and prefix[i] == item[i]
		eq i, 3

	test 'calls a method while a condition holds' do
		let list = [1,2,3,4]
		list.pop! while list.length > 2
		eq list, [1,2]

	test 'with a literal body and an assignment in the condition' do
		let text = 'aaab'
		yes while text != text = text.replace('ab','b')
		eq text, 'b'

	test 'counting down' do
		let sibs = [1,2,3,0,0]
		let i = sibs.length - 1
		i-- while i >= 0 and sibs[i] == 0
		eq i, 2

	test 'yield while a condition holds in a generator' do
		def gen n
			let i = 0
			yield i++ while i < n
		eq Array.from(gen(3)), [0,1,2]

describe 'for with three variables' do

	test 'value, index and length' do
		let res = for x,i,len in ['a','b','c']
			"{x}{i}/{len}"
		eq res, ['a0/3','b1/3','c2/3']

	test 'detecting the last item' do
		let res = for item,i,l in [1,2,3]
			i == l - 1 ? 'last' : item
		eq res, [1,2,'last']

	test 'with a guard' do
		let res = for x,i,len in [1,2,3,4] when x % 2
			[x,i,len]
		eq res, [[1,0,4],[3,2,4]]

describe 'typed loop variable' do

	test 'for in with a type annotation' do
		let res = for x\number in [1,2,3]
			x * 2
		eq res, [2,4,6]

	test 'for of with a type annotation' do
		let res = for chr\string of 'ab'
			chr.toUpperCase!
		eq res, ['A','B']

describe 'ranges with dynamic bounds' do

	test 'ascending' do
		let a = 1
		let b = 4
		let res = for i in [a .. b]
			i
		eq res, [1,2,3,4]

	test 'descending' do
		let a = 4
		let b = 1
		let res = for i in [a .. b]
			i
		eq res, [4,3,2,1]

	test 'exclusive descending' do
		let a = 4
		let b = 1
		let res = for i in [a ... b]
			i
		eq res, [4,3,2]

	test 'literal start and dynamic end' do
		let n = 3
		let res = for i in [0 ... n]
			i
		eq res, [0,1,2]

	test 'dynamic start and literal end' do
		let a = 1
		let res = for i in [a .. 3]
			i
		eq res, [1,2,3]
		a = 5
		res = for i in [a .. 3]
			i
		eq res, [5,4,3]

	test 'with an index variable' do
		let a = 3
		let b = 1
		let res = for i,idx in [a .. b]
			[i,idx]
		eq res, [[3,0],[2,1],[1,2]]

	test 'equal bounds' do
		let n = 3
		eq (for i in [n .. 3]
			i), [3]
		eq (for i in [n ... 3]
			i), []

	test 'bounds from expressions' do
		let list = ['a','b','c']
		let res = for i in [list.length - 1 .. 0]
			list[i]
		eq res, ['c','b','a']

describe 'for with a step' do
	let list = [1,2,3,4,5,6]

	test 'by a literal' do
		let res = for x in list by 2
			x
		eq res, [1,3,5]

	test 'by a variable' do
		let step = 3
		let res = for x in list by step
			x
		eq res, [1,4]

	test 'when guard before by' do
		let res = for x in list when x > 1 by 2
			x
		eq res, [3,5]

	test 'by before a when guard' do
		let res = for x in list by 2 when x > 1
			x
		eq res, [3,5]

	test 'by with an index variable' do
		let res = for x,i in list by 2
			i
		eq res, [0,2,4]

describe 'while as an expression' do

	test 'collects the last value of each iteration' do
		let i = 0
		let res = while i < 3
			i++
			i * 2
		eq res, [2,4,6]

	test 'as the last expression of a function' do
		def run
			let j = 0
			while j < 3
				j += 1
		eq run!, [1,2,3]

	test 'with a let in the condition' do
		def run str
			let re = /(\w+)=(\d+)/g
			let out = {}
			while let m = re.exec(str)
				out[m[1]] = Number(m[2])
			out
		eq run('a=1 b=22'), {a: 1, b: 22}

	test 'with a let in the condition as the last expression' do
		def run str
			let re = /\d/g
			while let m = re.exec(str)
				m[0]
		eq run('a1b2c3'), ['1','2','3']

	test 'until as an expression' do
		let n = 0
		let res = until n >= 3
			n++
		eq res, [0,1,2]

	test 'a while that never runs yields an empty array' do
		let res = while no
			1
		eq res, []

	test 'returned in parens' do
		def run n
			let i = 0
			return (while i < n
				i++)
		eq run(3), [0,1,2]

	test 'a returned for expression' do
		def run list
			return for x in list
				x * 2
		eq run([1,2]), [2,4]

	test 'a for expression with $1 inside a do block' do
		let res = [1,2,3].map do
			for x in [0 ... $1]
				x
		eq res, [[0],[0,1],[0,1,2]]

describe 'loop' do

	test 'runs until break' do
		let n = 0
		loop
			n++
			break if n > 3
		eq n, 4

	test 'as an expression' do
		let n = 0
		let res = loop
			n++
			break if n > 3
			n * 10
		eq res, [10,20,30]

	test 'with return in a function' do
		def run
			let k = 0
			loop
				k++
				return k if k == 5
		eq run!, 5

	test 'with a single-line body' do
		let n = 0
		loop if ++n > 3 then break
		eq n, 4

describe 'loop and switch expressions as arguments inside methods' do
	class Offsetter
		offset = 10
		label = 'n'

		def for-arg list
			String(for x in list
				x + offset)

		def postfix-arg list
			String(x + offset for x in list)

		def while-arg n
			let i = 0
			String(while i < n
				offset + i++)

		def switch-arg v
			String(switch v
				when 1 then offset
				when 2 then label
				else 0)

		def nested list
			JSON.stringify(for x in list
				for y in [1,2]
					x * y + offset)

		def in-callback list
			[1].map do
				String(for x in list
					x + offset)

		def calls list
			String(for x in list
				add(x))

		def add x
			x + offset

		static def from-static list
			String(for x in list
				x + base)

		static get base
			100

	let o = new Offsetter

	test 'for loop argument reads self' do
		eq o.for-arg([1,2]), '11,12'

	test 'postfix for argument reads self' do
		eq o.postfix-arg([1,2]), '11,12'

	test 'while loop argument reads self' do
		eq o.while-arg(3), '10,11,12'

	test 'switch argument reads self' do
		eq o.switch-arg(1), '10'
		eq o.switch-arg(2), 'n'
		eq o.switch-arg(3), '0'

	test 'nested loop arguments read self' do
		eq o.nested([1,2]), '[[11,12],[12,14]]'

	test 'inside a do block in a method' do
		eq o.in-callback([1,2]), ['11,12']

	test 'calling methods on self' do
		eq o.calls([5]), '15'

	test 'static methods read the class' do
		eq Offsetter.from-static([1]), '101'

	test 'in a tag render' do
		tag loop-arg-tag
			items = [1,2]
			lead = 'i'
			<self> String(for x in items
				lead + x)

		let el = imba.mount <loop-arg-tag>
		eq el.textContent, 'i1,i2'
		el.remove!
