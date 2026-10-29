# Prefix and postfix ++/-- on locals, members, indexes and private fields,
# and the spaced unary + and - (lexed as +++ / --- when a space comes
# before the sign and a word, ( or $ follows it).

class Clock
	count = 0
	#tick = 0
	#rpc_id = 10

	def bump
		++count

	def bump-after
		count++

	def drop
		--count

	def drop-after
		count--

	def next-tick
		++#tick

	def last-tick
		#tick--

	def rpc
		let id = ++#rpc_id
		id

	def stamp hit
		hit.used = ++#tick
		hit

	get tick
		#tick

	def steal other
		other.#tick++
		++other.#tick
		other.#tick

	def unsteal other
		other.#tick--
		--other.#tick

test 'prefix and postfix on a local' do
	let i = 0
	eq ++i, 1
	eq i++, 1
	eq i, 2
	eq --i, 1
	eq i--, 1
	eq i, 0

test 'counter assignment like id = ++counter' do
	let idcounter = 0
	let a = ++idcounter
	let b = ++idcounter
	eq [a, b, idcounter], [1, 2, 2]

test 'prefix and postfix on members' do
	let o = {count: 0}
	eq ++o.count, 1
	eq o.count++, 1
	eq o.count, 2
	eq --o.count, 1
	eq o.count--, 1
	eq o.count, 0

test 'prefix and postfix on nested members and string indexes' do
	let o = {a: {b: 5}}
	let key = 'b'
	eq ++o.a.b, 6
	eq o.a[key]--, 6
	eq --o.a[key], 4
	eq o.a.b, 4

test 'implicit self members' do
	let c = new Clock
	eq c.bump!, 1
	eq c.bump-after!, 1
	eq c.count, 2
	eq c.drop!, 1
	eq c.drop-after!, 1
	eq c.count, 0

test 'private fields' do
	let c = new Clock
	eq c.next-tick!, 1
	eq c.next-tick!, 2
	eq c.last-tick!, 2
	eq c.tick, 1
	eq c.rpc!, 11
	eq c.rpc!, 12

test 'prefix increment of a private field as an assigned value' do
	let c = new Clock
	let hit = c.stamp({})
	eq hit.used, 1
	eq c.stamp({}).used, 2

test 'private fields of another instance' do
	let a = new Clock
	let b = new Clock
	eq a.steal(b), 2
	eq b.tick, 2
	eq a.unsteal(b), 0
	eq a.tick, 0

test 'prefix increment as an index' do
	let arr = ['a', 'b', 'c']
	let i = -1
	eq arr[++i], 'a'
	eq arr[++i], 'b'
	eq i, 1

test 'postfix increment as an index' do
	let arr = ['a', 'b', 'c']
	let i = 0
	eq arr[i++], 'a'
	eq arr[i++], 'b'
	eq i, 2

test 'prefix decrement as an index walks backwards' do
	let arr = [1, 2, 3]
	let i = arr.length
	let out = []
	while i > 0
		out.push(arr[--i])
	eq out, [3, 2, 1]
	eq i, 0

test 'reading the next slot of a diff with ++slot' do
	let diff = [0b101, 'x', 'y']
	let slot = 0
	let first = diff[++slot]
	let second = diff[++slot]
	eq [first, second, slot], ['x', 'y', 2]

test 'nested assignment with a prefix increment' do
	let ops = [10, 20, 30]
	let from = 0
	let step = 0
	let next = ops[step = ++from]
	eq [next, step, from], [20, 1, 1]

test 'prefix increment in a while condition' do
	let i = -1
	let seen = []
	while ++i < 3
		seen.push(i)
	eq seen, [0, 1, 2]
	eq i, 3

test 'postfix decrement in a while condition' do
	let n = 3
	let seen = []
	while n--
		seen.push(n)
	eq seen, [2, 1, 0]
	eq n, -1

test 'prefix decrement in a parenthesized comparison' do
	let entry = {count: 2}
	let released = []
	for i in [0, 1]
		if (--entry.count) == 0
			released.push(i)
	eq released, [1]
	eq entry.count, 0

test 'prefix increment in a comparison without parens' do
	let entry = {count: 0}
	let firsts = 0
	for i in [0, 1, 2]
		firsts++ if ++entry.count == 1
	eq firsts, 1
	eq entry.count, 3

test 'prefix increment in a postfix return guard' do
	let n = 0
	let check = do
		return no if ++n > 1
		yes
	eq check!, yes
	eq check!, no
	eq n, 2

test 'prefix increment and decrement as the implicit return value' do
	let i = 0
	let inc = do ++i
	let dec = do return --i
	eq inc!, 1
	eq inc!, 2
	eq dec!, 1

test 'prefix increment as an implicit call argument' do
	let entries = ['a', 'b', 'c']
	let index = 0
	let current = entries.at ++index
	eq current, 'b'
	current = entries.at ++index
	eq current, 'c'

test 'prefix increment inside a guarded expression' do
	let frames = 0
	let check = do
		return 'again' if ++frames <= 2
		'done'
	eq [check!, check!, check!], ['again', 'again', 'done']
	eq frames, 3

test 'statement-level postfix decrements on members' do
	let m = {routing: 2, syncing: 1}
	m.routing--
	m.syncing--
	m.routing--
	eq m, {routing: 0, syncing: 0}

test 'the receiver of ++ and -- is evaluated once' do
	let calls = 0
	let o = {n: 0, list: [0, 0]}
	let get = do
		calls++
		o
	let idx = do
		calls++
		1
	get!.n++
	++get!.n
	get!.list[idx!]++
	--get!.list[idx!]
	++get!.list[idx!]
	eq calls, 8
	eq o.n, 2
	eq o.list, [0, 1]

test 'postfix ++ returns the old value even for strings' do
	let s = '5'
	let old = s++
	eq old, 5
	eq s, 6

# spaced unary minus and plus

test 'spaced unary minus and plus on identifiers' do
	let x = 2
	let y = 3
	eq [-x, +y, - x], [-2, 3, -2]
	eq x * -y, -6
	eq x - -y, 5
	eq x + +y, 5

test 'spaced unary minus becomes an implicit call argument' do
	let x = 2
	let f = do(v) [v]
	eq (f -x), [-2]
	eq (f +x), [2]
	# with a space on both sides it is a binary minus
	assert Number.isNaN(f - x)

test 'spaced unary minus and plus before parens' do
	let x = 2
	let y = 3
	let f = do(v) v
	eq -(x + y), -5
	eq f(-(x + y)), -5
	eq (f -(x + y)), -5
	eq +(x + '1'), 21

test 'unary minus on an argument variable' do
	eq [1, 2].map(do -$1), [-1, -2]
	eq [1, 2].map(do +$1 + 1), [2, 3]

test 'unary plus converts strings to numbers' do
	let s = '42'
	eq +s, 42
	eq +'1.5', 1.5
	assert Number.isNaN(+'x')

test 'unary minus as a return value' do
	let neg = do(v) -v
	let pos = do(v)
		return +v
	eq neg(4), -4
	eq pos('4'), 4

test 'unary minus on members and calls' do
	let o = {n: 3, get: do 4}
	eq -o.n, -3
	eq -o.get!, -4
	eq -Math.abs(-5), -5
