var ary = [1,2,3]
var rets = for v in ary
	v + 1

var str = "{ary[0]} {ary[1]} {ary[2]}"


		

describe "Syntax - Statements" do

	test "allow statements as arguments" do

		var fn = do |*pars| return pars
		var ary = [1,2,3,4]
		var res = fn 10, (v * 2 for v in ary), 20
		eq res, [10,[2,4,6,8],20]

		# unsure
		# 10 + try 10 catch e 10
		# since ary and fn are local, we can go all the way
		# up to cache it before.
		
		res = fn ary ∪ (v * 2 for v in ary)

		var outer = 0
		# when using statements as arguments, they might be
		# moved up into the statement and cache, but it needs
		# to happen in the expected order
		local class Obj
			def self.obj do return self.new
			def test arg do return arg

		# res = Obj.new.test ((outer = v) for v in ary)

		
