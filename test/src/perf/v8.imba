
def time name, blk
	console.time(name)
	blk()
	console.timeEnd(name)

def block blk
	blk()
	

class A

	def initialize x,y,z
		@x = x
		@y = y
		@z = z

	def invoke1
		@x + invoke2

	def invoke2
		@y + @z

	def mono
		invoke1

	def poly
		invoke1

class B < A

	def mono
		@x + @y + @z

	def poly
		invoke1

class C < A

	def initialize x,y,z
		@x = x
		@y = y
		@z = z
		
# 
# 	def invoke2
# 		@y


COUNT = 100000000

# console.time("bench")
# 
# var count = 50000000
# var a = A.new(1,2,3)
# var sum = 0
# 
# while --count > 0
# 	sum += a.invoke1
# 
# console.log sum
# console.timeEnd("bench")


time "only A" do
	var count = COUNT
	var a = A.new(1,2,3)
	var sum = 0

	while --count > 0
		sum += a.mono
		sum += a.mono
	console.log sum


time "only B" do
	var count = COUNT
	var b = B.new(1,2,3)
	var sum = 0

	while --count > 0
		sum += b.mono
		sum += b.mono
	console.log sum

time "A + B" do
	var count = COUNT
	var a = A.new(1,2,3)
	var b = B.new(1,2,3)
	var sum = 0

	while --count > 0
		sum += a.mono
		sum += b.mono
	console.log sum

time "A + B poly" do
	var count = COUNT
	var a = A.new(1,2,3)
	var b = B.new(1,2,3)
	var sum = 0

	while --count > 0
		sum += a.poly
		sum += b.poly
	console.log sum

time "A + B new poly" do
	var count = 10000000
	
	var sum = 0

	while --count > 0
		var a = A.new(1,2,3)
		var b = B.new(1,2,3)

		sum += a.poly
		sum += b.poly
	console.log sum


time "A + C new poly" do
	var count = 10000000
	
	var sum = 0

	while --count > 0
		var a = A.new(1,2,3)
		var b = C.new(1,2,3)

		sum += a.poly
		sum += b.poly
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