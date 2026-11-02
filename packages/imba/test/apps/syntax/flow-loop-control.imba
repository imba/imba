# break and continue with a value: in a loop whose result is used, the
# value becomes the last item of the result (break) or the item for this
# iteration (continue). In a loop whose result is unused, the value is
# just evaluated before leaving, e.g. `break found = item`.

describe 'break with a value' do

	test 'in a for expression' do
		let res = for x in [1,2,3,4,5]
			break x * 10 if x == 3
			x
		eq res, [1,2,30]

	test 'with a parenthesized value' do
		let res = for x in [1,2,3,4]
			break (x) if x > 2
			x
		eq res, [1,2,3]

	test 'as the last expression of a function' do
		def first-over list, limit
			for x in list
				break "found {x}" if x > limit
				x
		eq first-over([1,5,9], 4), [1,'found 5']
		eq first-over([1,2], 4), [1,2]

	test 'assigning a variable in a statement loop' do
		let found = null
		for x in [5,6,7]
			if x > 5
				break found = x
		eq found, 6

	test 'evaluated once in a statement loop' do
		let seen = []
		for x in [1,2,3]
			break seen.push('stop') if x == 2
			seen.push x
		eq seen, [1,'stop']

	test 'in a while loop with an assignment' do
		let i = 0
		let res = null
		while i < 10
			i++
			if i == 4
				break res = i * 100
		eq res, 400
		eq i, 4

	test 'in a while expression' do
		let i = 0
		let res = while i < 10
			i++
			break 'done' if i == 3
			i
		eq res, [1,2,'done']

	test 'from if / elif branches' do
		def offset ranges, t
			let i = 0
			let res = null
			let r = null
			while i < ranges.length
				r = ranges[i++]
				if t < r.from
					break res = 'before'
				elif t < r.to
					break res = "in {r.from}"
			res ?? 'after'
		let ranges = [{from: 0, to: 10},{from: 20, to: 30}]
		eq offset(ranges, 5), 'in 0'
		eq offset(ranges, 15), 'before'
		eq offset(ranges, 25), 'in 20'
		eq offset(ranges, 35), 'after'

	test 'in for own of' do
		let changed = no
		let last = {a: 1, b: 2}
		for own k,v of {a: 1, b: 3}
			if last[k] != v
				break changed = yes
		eq changed, yes

	test 'in a for own of expression' do
		let res = for own k,v of {a: 1, b: 2, c: 3}
			break "stop-{k}" if v == 2
			k
		eq res, ['a','stop-b']

	test 'in a for of expression' do
		let res = for chr of 'abcd'
			break chr.toUpperCase! if chr == 'c'
			chr
		eq res, ['a','b','C']

describe 'continue with a value' do

	test 'replaces the value for this iteration' do
		let res = for x in [1,-2,3,-4]
			continue 0 if x < 0
			x
		eq res, [1,0,3,0]

	test 'with a parenthesized value' do
		let res = for x in [1,2,3]
			continue (x * 100) if x == 2
			x
		eq res, [1,200,3]

	test 'in a while expression' do
		let i = 0
		let res = while i < 4
			i++
			continue 'even' if i % 2 == 0
			i
		eq res, [1,'even',3,'even']

	test 'in a statement loop the value is evaluated' do
		let log = []
		for x in [1,2,3]
			continue log.push("skip{x}") if x == 2
			log.push x
		eq log, [1,'skip2',3]

describe 'plain break and continue' do

	test 'break only leaves the inner loop' do
		let res = for a in [1,2]
			for b in [1,2,3]
				break if b > a
				"{a}{b}"
		eq res, [['11'],['21','22']]

	test 'continue in nested loops' do
		let res = for a in [1,2,3]
			continue if a == 2
			for b in [1,2]
				continue if b == a
				"{a}{b}"
		eq res, [['12'],['31','32']]

	test 'continue skips the iteration value' do
		let res = for x in [1,2,3,4]
			continue if x % 2
			x
		eq res, [2,4]

	test 'continue in an if branch at the end of a for expression' do
		let res = for x in [1,2,3,4]
			if x % 2
				continue
			else
				x * 10
		eq res, [20,40]

	test 'break in an if branch at the end of a for expression' do
		let res = for x in [1,2,3,4]
			if x > 2
				break
			else
				x
		eq res, [1,2]

	test 'break in a while expression keeps earlier values' do
		let i = 0
		let res = while yes
			i++
			break if i > 3
			i
		eq res, [1,2,3]

	test 'break in a postfix condition of an until loop' do
		let n = 0
		until n > 100
			n += 10
			break if n == 30
		eq n, 30
