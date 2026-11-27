test do
	let a = 1
	let b = 1
	let c = 1
	let d = 1
	let e = 1
	let f = 1
	let g = 1

	let at = 1

	if 1
		let a = 2
		let b = {a}
		let {c,name: {g}} = {c: 2,name: {g: 2}}
		let [d,e,...rest] = [2,2,2,2]
		let [x,y = e,z = at] = [10]

		eq a, 2
		eq b.a, 2
		eq c, 2
		eq e, 2
		eq g, 2
		eq x, 10
		eq y, 2
		eq z, 1
		eq at, 1

	eq a, 1

test do
	let [a,b,c] = [1,1,1]

	if true
		let {a = 2, b = 2} = {a: 3}
		eq a,3
		eq b,2
	eq a, 1

# A let with a try or a switch as its value gets the value inside the try or
# switch. In a loop, the variable must not keep the value of the previous
# iteration when the try or switch gives no value.
describe 'let with a try or switch value in a loop' do

	test 'for in' do
		let out = []
		for raw in ['[1]', '{', '[3]', 'x']
			let value = try JSON.parse(raw)
			out.push value ? value[0] : 'none'
		eq out, [1, 'none', 3, 'none']

	test 'for in with an index' do
		let out = []
		for raw, i in ['[1]', '{']
			let value = try JSON.parse(raw)
			out.push value ? value[0] + i : 'none'
		eq out, [1, 'none']

	test 'for own of' do
		let out = []
		for own key, raw of {a: '[1]', b: '{'}
			let value = try JSON.parse(raw)
			out.push value ? key + value[0] : 'none'
		eq out, ['a1', 'none']

	test 'while' do
		let items = ['[1]', '{']
		let out = []
		let i = 0
		while i < items.length
			let value = try JSON.parse(items[i])
			out.push value ? value[0] : 'none'
			i++
		eq out, [1, 'none']

	test 'if body in a for in loop' do
		let out = []
		for raw in ['[1]', '{']
			if raw
				let value = try JSON.parse(raw)
				out.push value ? value[0] : 'none'
		eq out, [1, 'none']

	test 'switch with no matching case' do
		let out = []
		for n in [1, 2]
			let name = switch n
				when 1
					out.push 'match'
					'one'
			out.push name or 'none'
		eq out, ['match', 'one', 'none']

	test 'let with the same name later in the loop body' do
		let out = []
		for raw in ['[1]', '[2]']
			if raw == '[2]'
				let value = try JSON.parse(raw)
				out.push value[0]
			let value = raw.length
			out.push value
		eq out, [3, 2, 3]

test 'a let in an if condition in a while loop is new in each iteration' do
	let fns = []
	let i = 0
	while i < 3
		if let value = i * 10
			fns.push(do value)
		i++
	eq fns.map(do(fn) fn!), [10, 20]

test 'a let with a try value in an if body in a block with a let of the same name' do
	def run a
		let out = []
		if a
			let value = 1
			if a
				let value = try JSON.parse('2')
				out.push value
			out.push value
		out
	eq run(yes), [2, 1]
