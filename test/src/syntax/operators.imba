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
