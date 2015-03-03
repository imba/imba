# self = SPEC

describe "Syntax - Variables" do


	test "allow predeclaring variables" do
		var a
		var b

	test "allow predeclaring multiple variables" do
		var a,b,c = 1,2,3
		var x,y,z
		

	test "allow implicit returns from var declaration" do
		# var hey, ho

		var hey = 10 ? 5 : 3
		var blank = do true

		var fn = do |a|
			blank(a, var z = 10)
			var x = b * 2 if var b = a + 1
			var res = x + 4

		eq fn(1),8
