# switch with when branches: block and one-line `then` bodies, several
# values per branch, else, and switch used as a value.

describe 'switch' do

	def kind v
		switch typeof v
			when "string"
				'str'
			when "number", "bigint"
				'num'
			when 'boolean' then 'bool'
			else
				'other'

	test 'with block bodies and an else block' do
		eq kind('a'), 'str'
		eq kind(null), 'other'

	test 'with several values in one branch' do
		eq kind(1), 'num'
		eq kind(1n), 'num'

	test 'mixing a one-line then branch with block branches' do
		eq kind(yes), 'bool'

	test 'with one-line branches and a one-line else' do
		def icon k
			switch k
				when 'course' then 'newspaper'
				when 'path' then 'paths'
				when 'u', 'user' then 'person'
				else 'unknown'
		eq icon('course'), 'newspaper'
		eq icon('path'), 'paths'
		eq icon('user'), 'person'
		eq icon('u'), 'person'
		eq icon('other'), 'unknown'

	test 'assigned to a variable' do
		let v = 2
		let res = switch v
			when 1 then 'one'
			when 2 then 'two'
		eq res, 'two'

	test 'without a matching branch or else is undefined' do
		let v = 5
		let res = switch v
			when 1 then 'one'
		eq res, undefined

	test 'as a call argument' do
		let v = 2
		let fn = do(x) "<{x}>"
		let res = fn(switch v
			when 2 then 'arg'
			else 'none')
		eq res, '<arg>'

	test 'inside a for expression' do
		let res = for x in [1,2,3]
			switch x
				when 1 then 'a'
				when 2 then 'b'
				else 'c'
		eq res, ['a','b','c']

	test 'evaluates the subject once' do
		let calls = 0
		def subject
			calls++
			3
		let res = switch subject!
			when 1 then 'x'
			when 2 then 'y'
			when 3 then 'z'
		eq res, 'z'
		eq calls, 1

	test 'branches do not fall through' do
		let log = []
		switch 'a'
			when 'a'
				log.push 'a'
			when 'b'
				log.push 'b'
		eq log, ['a']

	test 'an explicit break ends the branch' do
		let log = []
		switch 'b'
			when 'a'
				log.push 'a'
			when 'b'
				log.push 'b'
				break
				log.push 'never'
			when 'c'
				log.push 'c'
		eq log, ['b']

	test 'return from a branch' do
		def run x
			switch x
				when 1
					return 'early'
			'late'
		eq run(1), 'early'
		eq run(2), 'late'

	test 'continue inside a branch applies to the enclosing loop' do
		let res = []
		for x in [1,2,3]
			switch x
				when 2
					continue
			res.push x
		eq res, [1,3]

	test 'computed branch values' do
		const KIND = {A: 'a', B: 'b'}
		def run v
			switch v
				when KIND.A then 1
				when KIND.B, KIND.A + KIND.B then 2
				else 0
		eq run('a'), 1
		eq run('b'), 2
		eq run('ab'), 2
		eq run('c'), 0

	test 'matching is strict' do
		def run v
			switch v
				when 1 then 'number'
				when '1' then 'string'
		eq run(1), 'number'
		eq run('1'), 'string'

	test 'with a side effect in a branch body' do
		let state = {}
		def apply v
			switch typeof v
				when "string"
					state.parsed = JSON.parse(v)
				when "object"
					state.parsed = v
				when "function"
					state.parsed = v!
		apply('[1]')
		eq state.parsed, [1]
		apply({a: 1})
		eq state.parsed, {a: 1}
		apply(do 'fn')
		eq state.parsed, 'fn'

	test 'as an implicit call argument' do
		let parts = []
		for own kind, n of {command: 1, read: 2, web: 0}
			parts.push switch kind
				when 'command' then "ran {n == 1 ? 'a command' : n + ' commands'}"
				when 'read' then "read {n == 1 ? 'a file' : n + ' files'}"
				else 'browsed'
		eq parts, ['ran a command','read 2 files','browsed']

	test 'returned explicitly' do
		def run v
			return switch v
				when 1 then 'one'
				else 'other'
		eq run(1), 'one'
		eq run(2), 'other'

	test 'as the last statement with explicit breaks' do
		let state = {}
		def apply v
			switch typeof v
				when "string"
					state.value = v.toUpperCase!
					break
				when "number"
					state.value = v * 2
					break
		eq apply('a'), undefined
		eq state.value, 'A'
		apply(2)
		eq state.value, 4

	test 'with $1 inside a do block' do
		let names = [1,2,3].map do
			switch $1
				when 1 then 'one'
				when 2 then 'two'
				else 'many'
		eq names, ['one','two','many']
