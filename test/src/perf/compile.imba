
var fs = require 'fs'
var compiler = require '/repos/imba/lib/compiler'
var source = fs.readFileSync('/repos/imba/src/compiler/nodes.imba').toString
source = source + '\n\n' + source
var tokens = nil

def time name, blk
	console.time(name)
	blk()
	console.timeEnd(name)

def block blk
	blk()

time "Tokenize" do
	tokens = compiler.tokenize(source)
	return

time "Compile" do
	var code = compiler.compile(tokens)
	return

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