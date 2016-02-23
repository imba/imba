
# self = SPEC

class Paramer < SpecObject
	
	def blk &blk
		return [blk]

	def req name
		return [name]

	def req_blk name, &blk
		return [name,blk]

	def req_splat name, *items
		[name, items]
		
	def opt_blk name = 'anon', &blk
		return [name,blk]
	
	def req_opt_blk name, options = {}, &blk
		return [name,options,blk]

	def opt_opt_blk name = 'anon', options = {}, &blk
		return [name,options,blk]

	def req_opt_splat_blk name, options = {}, *items, &blk
		return [name,options,items,blk]

	def req_key name, gender: 0, age: 18
		# m('john', age: 20)
		[name,gender,age]

	def req_key_blk name, gender: 0, age: 18, &blk
		# m(age: 20)
		[name,gender,age,blk]
	# if the arg is an actual options-block I guess we should check for this first
	
	def opt_key_blk name = 'anon', gender: 0, age: 18, &blk
		# m(age: 20)
		# m('john', age: 20) # should work
		[name,gender,age,blk]
	
	def splat_key_blk *tags, gender: 0, age: 18, &blk
		[tags,gender,age,blk]

	def opt name = 'anon'
		return name

	def val= value
		@val = value

	def val
		@val


extend class Number

	def num_meth
		true


describe 'Syntax - Functions' do

	var obj = Paramer.new
	var blk = do true
	var res = null

	test "methods" do
		# basic arguments works
		eq obj.req('john'), ['john']
		eq obj.blk(blk), [blk]

		eq obj.req_blk('john',blk), ['john',blk]

		# options will be set to default, blk will be correctly set
		eq obj.req_opt_blk('john',blk), ['john',{},blk]

		# if we supply options to method, blk is still specified
		eq obj.req_opt_blk('john',opt: 10, blk), ['john',{opt: 10},blk]

		# hmmm
		eq obj.req_opt_blk('john',undefined,blk), ['john',{},blk]

		# only set blk if it is a function
		eq obj.req_opt_blk('john',opt: 10), ['john',{opt: 10},undefined]

		# should work for two optionals as well
		eq obj.opt_opt_blk(blk), ['anon', {}, blk]

		# should work for two optionals as well
		eq obj.opt_opt_blk('john', blk), ['john', {}, blk]
		eq obj.opt_opt_blk('john', opt: 10, blk), ['john', {opt: 10}, blk]

		res = obj.req_opt_splat_blk('john',blk)
		eq res, ['john',{},[],blk]

		res = obj.req_opt_splat_blk('john',opt: 10,blk)
		eq res, ['john',{opt: 10},[],blk]

		res = obj.req_opt_splat_blk('john')
		eq res, ['john',{},[],undefined]

		res = obj.req_opt_splat_blk('john',{opt: 10},10,11,12,blk)
		eq res, ['john',{opt: 10},[10,11,12],blk]

		res = obj.req_splat('john',1,2,3)
		eq res, ['john',[1,2,3]]

		# optional arguments
		eq obj.opt, 'anon'

		# null overrides the default argument
		eq obj.opt(null), null

		# undefined is like sending on argument
		eq obj.opt(undefined), 'anon'

	test "keyword arguments" do
		# [name,gender,age]
		res = obj.req_key('john',age: 20)
		eq res, ['john',0,20]

		res = obj.req_key('john')
		eq res, ['john',0,18]

		# keywords are optional, and block is greedy
		# req_key_blk name, gender: 0, age: 18, &blk
		res = obj.req_key_blk('john',blk)
		eq res, ['john',0,18,blk]

		res = obj.req_key_blk('john',gender: 1, blk)
		eq res, ['john',1,18,blk]
	
		# opt_key_blk name = 'anon', gender: 0, age: 18, &blk
		res = obj.opt_key_blk(gender: 1, blk)
		eq res, ['anon',1,18,blk]

		res = obj.opt_key_blk(blk)
		eq res, ['anon',0,18,blk]

		res = obj.opt_key_blk('john', age: 20)
		eq res, ['john',0,20,null]

		# splat_key_blk *tags, gender: 0, age: 18, &blk
		res = obj.splat_key_blk(1,2,3,age: 20)
		eq res, [[1,2,3],0,20,null]

		res = obj.splat_key_blk(1,2,3,gender: 1,blk)
		eq res, [[1,2,3],1,18,blk]

		res = obj.splat_key_blk(gender: 1,blk)
		eq res, [[],1,18,blk]

		res = obj.splat_key_blk
		eq res, [[],0,18,null]

		res = obj.splat_key_blk 1,2,3
		eq res, [[1,2,3],0,18,null]

		res = obj.splat_key_blk 1,2,3,blk
		eq res, [[1,2,3],0,18,blk]


	test "basic lambdas" do

		# we use do-syntax fo define basic functions
		var fn = do 1
		eq fn(), 1

		# arguments are defined in do | args |
		fn = do |a|
			1 + a

		eq fn(0), 1
		eq fn(1), 2

		# multiple arguments
		fn = do |a,b|
			a + b

		eq fn(1,1), 2
		eq fn(2,3), 5

		# we support default arguments
		fn = do |a,b,c = 2| 
			a + b + c

		eq fn(1,1), 4
		eq fn(1,1,1), 3

		# splat arguments
		fn = do |a,b,c,*d|
			return [a,b,c,d]

		eq fn(1,2,3,4,5), [1,2,3,[4,5]]

		var outer = do |*args|
			return args

		var inner = do |blk|
			blk ? blk() : nil

		# block precedence
		# f1 f2 do 10 -> f1(f2(10))
		var v = outer 5, inner do 10
		eq v,[5,10]

	test "methods on numbers" do
		ok 1.num_meth


	test "block-argument position" do
		var fn = do |a,b,c| [a isa Function ? a() : a,b isa Function ? b() : b,c isa Function ? c() : c]
		var res
		
		res = fn(1,2) do 3
		eq res, [1,2,3]

		res = fn(1,&,2) do 3
		eq res, [1,3,2]

		res = fn(&,2,3) do 3
		eq res, [3,2,3]

	test "setters" do
		obj.val = 10
		eq obj.val, 10

		var res = obj.setVal(20)
		eq obj.val, 20
		eq res, obj


# 	describe 'argvars' do
# 		test '$0 refers to arguments' do
# 			var fn = do $0:length
# 			eq fn(yes,yes,yes), 3
# 
# 		test '$i refers to arguments[i-1]' do
# 			fn = do $1+$2
# 			eq fn(10,20), 30
# 
# 			fn = do |a,b,c|
# 				eq a, $1
# 				eq b, $2
# 				eq c, $3
# 
# 			fn()
# 
# 	describe 'default arguments' do
# 
# 		it 'should work for numbers' do
# 			fn = do |a,b=1| return b
# 			eq fn(), 1
# 			eq fn(0), 1
# 			eq fn(0,2), 2
# 
# 		it 'should work for strings' do
# 			fn = do |a,b="b"| return b
# 			eq fn(), "b"
# 			eq fn(0), "b"
# 			eq fn(0,"x"), "x"
# 			eq fn(0,2), 2
# 
# 		it 'should work for arrays' do
# 			fn = do |a,b=[1,2,3]| return b
# 			eq fn(), [1,2,3]
# 			eq fn(0,"x"), "x"
# 			eq fn(0,2), 2
# 			eq fn(0,[0,1,2]), [0,1,2]
# 
# 		it 'should only override null/undefined' do
# 			fn = do |a,b=1| return b
# 			eq fn(0,0), 0
# 			eq fn(0,""), ""
# 
# 	
# 
# 	describe 'splats' do
# 
# 		test 'do |a,...b|' do
# 			fn = do|a,...b| return [a,b]
# 			eq fn(0,1,2,3), [0,[1,2,3]]
# 
# 			# other syntax
# 			fn = (|a,...b| return [a,b])
# 			eq fn(0,1,2,3), [0,[1,2,3]]
# 
# 		test 'do |a,...b,c|' do
# 			fn = do|a,...b,c| return [a,b,c]
# 			eq fn(0,1,2,3,4), [0,[1,2,3],4]
# 
# 			fn = (|a,...b,c| return [a,b,c])
# 			eq fn(0,1,2,3,4), [0,[1,2,3],4]
# 
# 	test 'callbacks' do
# 		res = [1,2,3].map do |a| a*2
# 		eq res, [2,4,6]
# 
# 		res = [1,2,3].map(|a| a*2)
# 		eq res, [2,4,6]
# 
# 	test 'self-referencing functions' do
# 		change = do change = 10
# 		change()
# 		eq change, 10