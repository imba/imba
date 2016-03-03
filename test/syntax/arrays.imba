extern describe, test, ok, eq

describe 'Syntax - Arrays' do

	test "trailing commas" do
		var ary = [1, 2, 3,]
		ok (ary[0] is 1) and (ary[2] is 3) and (ary:length is 3)

		ary = [
			1, 2, 3,
			4, 5, 6
			7, 8, 9,
		]

		# really?
		# (sum = (sum or 0) + n) for n in ary
		# a = [((x) -> x), ((x) -> x * x)]
		# ok a:length is 2

	# Splats in Array Literals

	test "array splat expansions with assignments" do
		var nums = [1, 2, 3]
		var list = [0,*nums,4]
		eq [0,1,2,3,4], list

	test "mixed shorthand objects in array lists" do
		var ary = [
			a: 1
			'b'
			c: 1
		]
		ok ary:length is 3
		ok ary[2]:c is 1

		ary = [b: 1, a: 2, 100]
		eq ary[1], 100

		ary = [a: 0, b: 1, (1 + 1)]
		eq ary[1], 2

		ary = [a: 1, 'a', b: 1, 'b']
		eq ary:length, 4
		eq ary[2]:b, 1
		eq ary[3], 'b'


	test "array splats with nested arrays" do
		var nonce = {}
		var a = [nonce]
		var list = [1, 2, *a]
		eq list[0], 1
		eq list[2], nonce

		a = [[nonce]]
		list = [1, 2, *a]
		eq list, [1, 2, [nonce]]
