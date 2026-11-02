# One-line `if ... then ... else`, elif chains used as values, `unless`
# with compound conditions, negated loop guards, ternaries whose branch is
# an implicit call, debugger statements and compile-time env flags.

describe 'if ... then ... else on one line' do

	test 'as an assigned value' do
		let a = 1
		let res = if a > 0 then 'pos' else 'neg'
		eq res, 'pos'
		a = -1
		res = if a > 0 then 'pos' else 'neg'
		eq res, 'neg'

	test 'as the last expression of a function' do
		def size x
			return 'big' if x > 10
			if x > 5 then 'mid' else 'small'
		eq size(20), 'big'
		eq size(7), 'mid'
		eq size(1), 'small'

	test 'with elif on the same line' do
		def sign n
			if n > 0 then 1 elif n < 0 then -1 else 0
		eq sign(5), 1
		eq sign(-5), -1
		eq sign(0), 0

	test 'as a statement without else' do
		let log = []
		let a = 1
		if a then log.push('then')
		if !a then log.push('never')
		eq log, ['then']

	test 'without else as a value' do
		let a = 0
		let res = if a then 'yes'
		assert !res

	test 'unless ... then ... else' do
		let log = []
		let a = 1
		unless a then log.push('never') else log.push('else')
		unless !a then log.push('then')
		eq log, ['else','then']

	test 'as a call argument' do
		let a = 1
		let fn = do(x) "<{x}>"
		eq fn(if a == 2 then 'two' elif a == 1 then 'one' else 'none'), '<one>'

	test 'with a call in the branch' do
		let log = []
		def track x
			log.push x
			x
		let res = if log.length == 0 then track('first') else track('again')
		eq res, 'first'
		res = if log.length == 0 then track('first') else track('again')
		eq res, 'again'
		eq log, ['first','again']

describe 'elif chains as values' do

	def grade score
		let g = if score >= 90
			'A'
		elif score >= 80
			'B'
		elif score >= 70
			'C'
		else
			'F'
		g

	test 'assigned from an elif chain' do
		eq grade(95), 'A'
		eq grade(85), 'B'
		eq grade(75), 'C'
		eq grade(10), 'F'

	test 'an elif chain without else returns undefined' do
		def run s
			if s >= 90
				'A'
			elif s >= 80
				'B'
		eq run(95), 'A'
		eq run(85), 'B'
		eq run(10), undefined

	test 'only the first matching branch runs' do
		let log = []
		def check name, value
			log.push name
			value
		if check('a', no)
			log.push 'A'
		elif check('b', yes)
			log.push 'B'
		elif check('c', yes)
			log.push 'C'
		eq log, ['a','b','B']

	test 'elif and else if mixed' do
		def run n
			if n == 1
				'one'
			else if n == 2
				'two'
			elif n == 3
				'three'
			else
				'many'
		eq [1,2,3,4].map(do run($1)), ['one','two','three','many']

	test 'with $1 inside a do block' do
		let sign = do if $1 > 0 then 'pos' elif $1 < 0 then 'neg' else 'zero'
		eq [1,-1,0].map(sign), ['pos','neg','zero']

	test 'returned explicitly' do
		def run v
			return if v then 'y' else 'n'
		eq run(1), 'y'
		eq run(0), 'n'

	test 'in a for expression' do
		let res = for n in [1,2,3]
			if n == 1
				'a'
			elif n == 2
				'b'
			else
				'c'
		eq res, ['a','b','c']

describe 'unless with compound conditions' do
	let a = 1
	let b = 2

	test 'and / or' do
		let log = []
		log.push('and') unless a == 1 and b == 2
		log.push('or') unless a == 1 or b == 3
		log.push('neither') unless a == 2 or b == 3
		eq log, ['neither']

	test 'equality operators are inverted' do
		let log = []
		log.push('!=') unless a != 1
		log.push('==') unless a == 1
		log.push('===') unless a === 1
		log.push('!==') unless a !== 2
		log.push('isnt') unless a isnt 1
		eq log, ['!=','isnt']

	test 'negated values' do
		let log = []
		let empty = 0
		log.push('!b') unless !b
		log.push('!empty') unless !empty
		log.push('!(a == 1)') unless !(a == 1)
		eq log, ['!b','!(a == 1)']

	test 'unless block with else' do
		def run x
			unless x > 1 and x < 5
				'outside'
			else
				'inside'
		eq run(3), 'inside'
		eq run(0), 'outside'
		eq run(9), 'outside'

describe 'negated loop conditions' do

	test 'for guard with a negation' do
		let res = for x in [0,1,2,null] when !x
			x
		eq res, [0,null]

	test 'for guard with an inequality' do
		let res = for x in [1,2,3] when x != 2
			x
		eq res, [1,3]

	test 'until with an equality' do
		let n = 0
		until n == 3
			n++
		eq n, 3

	test 'until with a negation' do
		let list = [1,2,3]
		let out = []
		until !list.length
			out.push list.shift!
		eq out, [1,2,3]

describe 'ternary with an implicit call branch' do
	def double x
		x * 2

	test 'implicit call before a spaced colon' do
		let flag = yes
		let res = flag ? double 2 : 0
		eq res, 4
		flag = no
		res = flag ? double 2 : 0
		eq res, 0

	test 'implicit calls in both branches' do
		let flag = no
		eq (flag ? double 2 : double 3), 6

	test 'a ternary inside an implicit call after one with a call branch' do
		def wrap x
			[x]
		let a = yes
		let b = no
		let v = a ? double 2 : 0
		let w = wrap b ? 3 : 4
		eq v, 4
		eq w, [4]

	test 'several call-branch ternaries in a row' do
		def wrap x
			[x]
		let flag = yes
		let one = flag ? double 1 : 0
		let two = flag ? double 2 : 0
		let three = wrap flag ? 'y' : 'n'
		let four = wrap !flag ? 'y' : 'n'
		eq [one, two, three, four], [2, 4, ['y'], ['n']]

describe 'debugger' do

	test 'a debugger statement in a branch that is not taken' do
		let log = []
		let paused = no
		debugger if paused
		if paused
			debugger
		log.push 'ran'
		eq log, ['ran']

describe 'compile-time env flags' do

	test 'if $web$ keeps the body' do
		let log = []
		if $web$
			log.push 'web'
		eq log, ['web']

	test 'if $node$ with else keeps the else branch' do
		let log = []
		if $node$
			log.push 'node'
		else
			log.push 'not-node'
		eq log, ['not-node']

	test 'as the last expression of a function' do
		def platform
			if $web$
				'web'
			else
				'other'
		eq platform!, 'web'

	test 'one-line form as a value' do
		let x = if $web$ then 'w' else 'n'
		eq x, 'w'
		eq String(if $node$ then 'yes' else 'no'), 'no'

	test 'in an elif branch' do
		def run v
			if v == 1
				'one'
			elif $web$
				'web'
			else
				'never'
		eq run(1), 'one'
		eq run(2), 'web'

	test 'combined with a runtime condition' do
		let res = []
		let ready = yes
		if $web$ and ready
			res.push 'combined'
		if $web$ and !ready
			res.push 'never'
		eq res, ['combined']

	test 'negated flags' do
		let res = []
		res.push 'not-node' if !$node$
		res.push 'not-web' if !$web$
		eq res, ['not-node']

	test 'as a ternary condition' do
		eq ($node$ ? 'node' : 'web'), 'web'
		eq ($web$ ? 'web' : 'node'), 'web'

	tag flow-env-child
		<self>
			if $node$
				<b.node> 'node'
			else
				<i.web> 'web'

	test 'in a tag tree' do
		let el = <flow-env-child>
		el.render!
		eq el.querySelector('.node'), null
		assert el.querySelector('.web') isa Element

describe 'conditional tags from and-chains' do
	tag flow-and-chain
		a = no
		b = no
		label = null
		index = 1
		<self>
			a and b and <b.both> 'both'
			!a and <i.none> 'none'
			<span.label>
				label or 'item ' + index

	test 'renders only when every condition holds' do
		let el = <flow-and-chain>
		el.render!
		eq el.querySelector('.both'), null
		assert el.querySelector('.none') isa Element
		el.a = yes
		el.render!
		eq el.querySelector('.both'), null
		eq el.querySelector('.none'), null
		el.b = yes
		el.render!
		assert el.querySelector('.both') isa Element

	test 'a logical text child without a tag' do
		let el = <flow-and-chain>
		el.render!
		eq el.querySelector('.label').textContent, 'item 1'
		el.label = 'named'
		el.render!
		eq el.querySelector('.label').textContent, 'named'

describe 'a tag whose only child is an if' do
	tag flow-if-child
		open = no
		<self>
			<section> if open
				<b.inner> 'inside'

	test 'renders the child only when the condition holds' do
		let el = <flow-if-child>
		el.render!
		eq el.querySelector('.inner'), null
		el.open = yes
		el.render!
		assert el.querySelector('section > .inner') isa Element
		el.open = no
		el.render!
		eq el.querySelector('.inner'), null
