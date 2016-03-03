extern describe, test, ok, eq, it

describe "Syntax - Variables" do

	test "allow in expression" do

		def x
			if true
				var a = 1
				var b = 2
				3

		var res = try x catch e 0

		eq x, 3



	test "allow predeclaring variables" do
		var a
		var b

	test "allow predeclaring multiple variables" do
		var [a,b,c] = 1,2,3
		var x,y,z

		eq a,1
		eq b,2
		eq c,3
		

	test "allow implicit returns from var declaration" do
		# var hey, ho

		var hey = 10 ? 5 : 3
		var blank = do true

		var fn = do |a|
			blank(a, var z = 10)
			var x = b * 2 if var b = a + 1
			var res = x + 4

		eq fn(1),8
