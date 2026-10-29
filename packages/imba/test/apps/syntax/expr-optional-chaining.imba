# Optional chaining with `..`: indexes, negative indexes, calls and chains

let data =
	user:
		name: 'hello'
		tags: ['a', 'b', 'c']
		greet: do(v) "hi {v}"
	list: [1, 2, 3]
	empty: []

test 'optional index with a variable key' do
	let key = 'user'
	eq data..[key].name, 'hello'
	eq data.user..['name'], 'hello'
	let none = null
	eq none..[key], undefined

test 'optional index with a number' do
	eq data.list..[0], 1
	eq data.empty..[0], undefined
	let none = null
	eq none..[0], undefined

test 'optional index with a negative number reads from the end' do
	eq data.list..[-1], 3
	eq data.list..[-2], 2
	eq data.empty..[-1], undefined
	let words = [{word: 'x'}, {word: 'y'}]
	eq words..[-1]..word, 'y'

test 'optional negative index on a missing value' do
	let none = null
	let words = undefined
	assert none..[-1] == null
	assert words..[-1]..word == null

test 'optional index with a computed number' do
	let i = -2
	eq data.list..[i + 2], 1
	eq data.list..[1 * 2], 3

test 'chained optional indexes' do
	let snapshot = {seed: [10, 20]}
	let scrim = {snapshot: snapshot}
	eq scrim..snapshot..seed..[1], 20
	scrim.snapshot = null
	eq scrim..snapshot..seed..[1], undefined
	let none = null
	eq none..[0]..[1], undefined

test 'optional index after a call' do
	let m = 'key=value'.match(/(\w+)=(\w+)/)..[1]
	eq m, 'key'
	let n = 'nothing'.match(/(\d+)/)..[1]
	eq n, undefined

test 'optional chain through an index into members' do
	let user = {sub: {items: [{price: {country: 'NO'}}]}}
	eq user.sub..items..[0]..price..country, 'NO'
	user.sub = null
	eq user.sub..items..[0]..price..country, undefined

test 'optional index with a key from a block argument' do
	let docs = {quiz: {a: 1}, poll: null}
	let picked = ['a', 'b']
	eq picked.filter(do docs['quiz']..[$1]), ['a']
	eq picked.filter(do docs['poll']..[$1]), []

test 'optional index followed by a fallback' do
	let config = null
	let field = 'x'
	eq (config..[field] or ''), ''
	config = {x: 'set'}
	eq (config..[field] or ''), 'set'

test 'optional calls' do
	eq data..user..greet('you'), 'hi you'
	eq data.user..greet!, 'hi undefined'
	eq data.user..missing!, undefined
	eq data..nothing..greet('x'), undefined

test 'optional chain then a predicate on a plain local' do
	let turn = null
	eq turn..draft.empty?, undefined
	turn = {draft: {empty?: yes}}
	eq turn..draft.empty?, true

test 'optional receivers are evaluated once' do
	let calls = 0
	let make = do
		calls++
		[1, 2, 3]
	eq make!..[0], 1
	eq make!..[-1], 3
	eq calls, 2
	let i = 0
	let rows = [null, ['x']]
	eq rows[i++]..[0], undefined
	eq rows[i++]..[0], 'x'
	eq i, 2

test 'optional chain on a falsy but defined value' do
	let zero = 0
	let blank = ''
	eq zero..toFixed(1), '0.0'
	eq blank..length, 0
	eq blank..[0], undefined
