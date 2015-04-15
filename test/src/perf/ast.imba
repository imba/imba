

var AST = require '/repos/imba/lib/compiler/nodes'
var token = require '/repos/imba/lib/compiler/token'

# var AST = ast.AST
# var Identifier = ast.AST.Identifier
# var Ivar = ast.AST.Ivar
# var Const = ast.AST.Const
# var Op = ast.AST.Op
# var Num = ast.AST.Num

def time name, blk
	console.time(name)
	blk()
	console.timeEnd(name)

def block blk
	blk()


var OP_GT = ">"
var OP_LT = "<"

var OP2 = do |op, l, r, opts|
	var s = String(op)

	if s == '.'
		# Be careful
		if r isa String
			r = AST.Identifier.new(r)

		AST.Access.new(op,l,r)
	elif s == '='
		if l isa AST.Tuple
			# p "catching tuple-assign OP"
			return AST.TupleAssign.new(op,l,r)
		AST.Assign.new(op,l,r)
	elif s in ['?=','||=','&&=']
		AST.ConditionalAssign.new(op,l,r)
	else
		AST.Op.new(op,l,r)



time "Literals" do
	var count = 1000000
	
	var sum = 0

	while --count > 0
		var n1 = AST.Num.new("10")
		var n2 = AST.Num.new("12")
		var id1 = AST.Identifier.new("hello")
		var id2 = AST.Identifier.new("other")
		var ivar = AST.Ivar.new("hello")
		var cnst = AST.Ivar.new("Hello")
		var op = OP2(OP_GT,n1,n2)
		var op2 = OP2(OP_LT,n1,n2)
		var op3 = OP2(OP_GT,n1,n2)
		var out = id1.c + ivar.c + id2.c + cnst.c + op.c + op2.c + op3.c
		sum += out:length

	
	console.log sum

# block do
# console.time("b")
# var count = 50000000
# var a = A.new(1,2,3)
# var sum = 0
# 
# while --count > 0
# 	sum += a.invoke1
# console.log sum
# console.timeEnd("b")

# time "b2" do
# 
# 	var count = 50000000
# 	var a = A.new(1,2,3)
# 	var sum = 0
# 
# 	while --count > 0
# 		sum += a.invoke1
# 	console.log sum
# 
# // Feed information into the ICs for each function
# for (var i = 0; i < count; i++) {
#   f1.invoke1(1);
#   f2.invoke2(1);
# 
#   // The IC for invoke3 will get two different hidden class entries, which deoptimizes it
#   if (i % 2 == 0)
#     f1.invoke3(1);
#   else
#     f2.invoke3(1);
# }
# 
# console.timeEnd("bench")