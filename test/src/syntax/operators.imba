# package imba.ast

local class Cache

	prop gets

	def initialize val
		@gets = 0
		@value = val

	def value
		@gets++
		@value

local class Group
	prop items
	def initialize items do @items = items
	def toString do @items.toString
	def __union other do Group.new(@items ∪ other.items)
	def __intersect other do Group.new(@items ∩ other.items)

describe 'Syntax - Operators' do

	test "union and intersect" do

		# union regular arrays
		var a = [1,2,3,6]
		var b = [3,4,5,6]
		eq a ∪ b, [1,2,3,6,4,5]
		eq a ∩ b, [3,6]

		# union custom objects
		var ga = Group.new([4,5,6])
		var gb = Group.new([5,6,7])
		var gc = Group.new([8,9])
		var gd = (ga ∪ gb)

		ok gd isa Group
		eq gd.items, [4,5,6,7]

		gd = ga ∩ gb
		ok gd isa Group
		eq gd.items, [5,6]	

		eq (gb ∩ gc).items, []

		# precedence
		gd = ga ∩ gb ∪ gc # precedence right
		# gd = ((ga ∩ gb) ∪ gc)
		eq gd, [5,6,8,9]

		gd = ga ∩ gb ∪ gc && ga
		# gd = ((ga ∩ gb) ∪ gc) && true
		eq gd, ga

	
	test "in" do
		var a = 5
		var ary = [1,2,3,4,5]

		ok a in ary
		eq 3 in ary, true
		eq 10 in ary, false
		eq 3 in [1,2,3,4], true
		eq 6 in [1,2,3,4], false

		ok 6 not in ary


	test "comparison" do

		var a = 50
		ok 100 > a > 10
		eq 100 > (a = 10) > 10, false # not elegant
		ok 100 > a < 50

		var b = Cache.new(10)
		ok 100 > b.value > 2
		ok b.gets == 1

		ok 100 > b.value < 30
		ok b.gets == 2

	# https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
	test "precedence" do

		ok 10 + 10 * 2, 30
		ok (10 + 10) * 2, 40

		var a = 0
		var b = 0
		var c = 0

		a = 10 + 20
		eq a, 30

		(a = 10) + 20
		eq a, 10
		b = 10 + a = 5
		eq b, 15
		eq a, 5

		a = 0
		a = 10 unless true or true
		eq a, 0






#	test "binary (2-ary) math operators do not require spaces" do
#		a = 1
#		b = -1
#		eq +1, a*-b
#		eq -1, a*+b
#		eq +1, a/-b
#		eq -1, a/+b
#
#	# NO NO NO - this is an indentation-based language
#	test "operators should respect new lines as spaced" do
#		a = 123 +
#		456
#		eq 579, a
#	  
#		b = "1{2}3" +
#		"456"
#		eq '123456', b
#
#	test "multiple operators should space themselves" do
#		eq (+ +1), (- -1)
#
#	test "bitwise operators" do
#		eq  2, (10 &   3)
#		eq 11, (10 |   3)
#		eq  9, (10 ^   3)
#		eq 80, (10 <<  3)
#		eq  1, (10 >>  3)
#		eq  1, (10 >>> 3)
#
#	test "`instanceof`" do
#		# should new-syntax even work?
#		ok String.new instanceof String
#		ok Boolean.new instanceof Boolean
#		# `instanceof` supports negation by prefixing the operator with `not`
#		# find a better way - no?
#		ok Number.new not instanceof String
#		ok Array.new not instanceof Boolean
#
#	# Ternary Operator
#
#	test "ternary operator" do
#	  
#		a = yes
#		b = no
#		
#		res = a ? 1 : 0
#		eq res, 1
#		
#		res = b ? 1 : 0
#		eq res, 0
#
#		res = b && yes ? 1 : 0
#		eq res, 0
#
#		res = b && yes ? 1 : a && yes ? 2 : 0
#		eq res, 2
#
#
#
#
#	# `is`,`isnt`,`==`,`!=`
#
#	test "`==` and `is` should be interchangeable" do
#		a = b = 1
#		ok a is 1 and b == 1
#		ok a == b
#		ok a is b
#
#	test "`!=` and `isnt` should be interchangeable" do
#		a = 0
#		b = 1
#		ok a isnt 1 and b != 0
#		ok a != b
#		ok a isnt b
#
#
#	# [not] in/of
#
#	# - `in` should check if an array contains a value using `indexOf`
#	# - `of` should check if a property is defined on an object using `in`
#	test "in, of" do
#		arr = [1]
#		ok 0 of arr
#		ok 1 in arr
#		# prefixing `not` to `in and `of` should negate them
#		ok 1 not of arr
#		ok 0 not in arr
#
#	test "`in` should be able to operate on an array literal" do
#		ok 2 in [0, 1, 2, 3]
#		ok 4 not in [0, 1, 2, 3]
#		arr = [0, 1, 2, 3]
#		ok 2 in arr
#		ok 4 not in arr
#		# should cache the value used to test the array
#		arr = [0]
#		val = 0
#		ok val++ in arr
#		ok val++ not in arr
#		val = 0
#		ok val++ of arr
#		ok val++ not of arr
#
#	test "`of` and `in` should be able to operate on instance variables" do
#		obj = {
#			list: [2,3]
#			in_list: (value) -> value in this:list
#			not_in_list: (value) -> value not in this:list
#			of_list: (value) -> value of this:list
#			not_of_list: (value) -> value not of this:list
#		}
#		ok obj.in_list 3
#		ok obj.not_in_list 1
#		ok obj.of_list 0
#		ok obj.not_of_list 2
#
#	test "#???: `in` with cache and `__indexOf` should work in argument lists" do
#		eq 1, [Object() in Array()]:length
#
#	test "#737: `in` should have higher precedence than logical operators" do
#		eq 1, 1 in [1] and 1
#
#	test "#768: `in` should preserve evaluation order" do
#		share = 0
#		a = -> share++ if share is 0
#		b = -> share++ if share is 1
#		c = -> share++ if share is 2
#		ok a() not in [b(),c()]
#		eq 3, share
#
#	test "#1099: empty array after `in` should compile to `false`" do
#		eq 1, [5 in []]:length
#		eq false, (-> return 0 in [])()
#		
#	test "#1354: optimized `in` checks should not happen when splats are present" do
#		a = [6, 9]
#		eq 9 in [3, ...a], true
#		
#	test "#1100: precedence in or-test compilation of `in`" do
#		ok 0 in [1 and 0]
#		ok 0 in [1, 1 and 0]
#		ok not (0 in [1, 0 or 1])
#		
#	test "#1630: `in` should check `hasOwnProperty`" do
#		ok undefined not in length: 1
#		
#	# test "#1714: lexer bug with raw range `for` followed by `in`" do
#	#     0 for 1 .. 2
#	#     ok not ('a' in ['b'])
#	# 
#	#     0 for 1 .. 2; ok not ('a' in ['b'])
#	# 
#	#     0 for 1 .. 10 # comment ending
#	#     ok not ('a' in ['b'])
#	# 
#	# test "#1099: statically determined `not in []` reporting incorrect result" do
#	#     ok 0 not in []
#
#
#	# Chained Comparison
#
#	test "chainable operators" do
#		ok 100 > 10 > 1 > 0 > -1
#		ok -1 < 0 < 1 < 10 < 100
#
#	test "`is` and `isnt` may be chained" do
#		ok true is not false is true is not false
#		ok 0 is 0 isnt 1 is 1
#
#	test "different comparison operators (`>`,`<`,`is`,etc.) may be combined" do
#		ok 1 < 2 > 1
#		ok 10 < 20 > 2+3 is 5
#
#	test "some chainable operators can be negated by `unless`" do
#		ok (true unless 0==10!=100)
#
#	test "operator precedence: `|` lower than `<`" do
#		# this is usually a method-call unless we know for a fact
#		# that the subject is numeric.
#		eq 1, 1 | 2 < 3 < 4
#
#	test "preserve references" do
#		a = b = c = 1
#		# `a == b <= c` should become `a === b && b <= c`
#		# (this test does not seem to test for this)
#		ok a == b <= c
#
#	test "chained operations should evaluate each value only once" do
#		a = 0
#		ok 1 > a++ < 1
#