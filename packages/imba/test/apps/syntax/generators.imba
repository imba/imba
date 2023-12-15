def foo x
	while true
		x = x * 2
		yield x

class Hello

	def something
		yield 1
		yield 2
		yield 3

test do
	let v = foo(1)
	eq v.next!.value,2
	eq v.next!.value,4
	eq v.next!.value,8

test do
	let v = (new Hello).something!
	eq v.next!.value,1
	eq v.next!.value,2
	eq v.next!.value,3