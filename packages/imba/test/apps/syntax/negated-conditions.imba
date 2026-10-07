# unless, until and for-when guards negate their condition. A relational
# comparison (<, >, <=, >=) is false when an operand is NaN or undefined,
# so the negated comparison must be true for these values.

let values = [undefined, NaN]

test 'postfix unless with a relational comparison' do
	for a in values
		let taken = []
		taken.push('>') unless a > 0
		taken.push('<') unless a < 0
		taken.push('>=') unless a >= 0
		taken.push('<=') unless a <= 0
		eq taken, ['>','<','>=','<=']

test 'unless block with a relational comparison' do
	for a in values
		let branch = null
		unless a > 0
			branch = 'unless'
		else
			branch = 'else'
		eq branch, 'unless'

test 'until with a relational comparison' do
	for limit in values
		let n = 0
		until n > limit
			n++
			break if n == 3
		eq n, 3

test 'for-in with a relational when guard' do
	let res = for x in [1,undefined,NaN,2] when x > 0
		x
	eq res, [1,2]

# A chain like a < b < c means a < b && b < c, so it is negated as a whole.
test 'unless with a chained comparison' do
	let taken = []
	let [a,b,c] = [5,1,10]
	taken.push('<') unless a < b < c
	let [d,e,f] = [5,1,1]
	taken.push('==') unless d == e == f
	eq taken, ['<','==']
