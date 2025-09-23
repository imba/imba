const eq = global.eq

describe "Implicit parens" do

	test 'a' do
		let obj = (
			a: 1
			b: 1
		)

		eq obj.a, 1
		eq obj.b, 1

	
	test 'b' do
		let obj = (
			['a']: 1,
			['b']: 1
		)

		eq obj.a, 1
		eq obj.b, 1
	
	# need to fix in parser
	# test 'c' do
	# 	let obj = (
	# 		['a']: 1
	# 		['b']: 1
	# 	)
	# 
	# 	eq obj.a, 1
	# 	eq obj.b, 1
