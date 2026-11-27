import * as imbac from 'imba/compiler'

def foo x
	while true
		x = x * 2
		yield x

def nothing
	yield

class Hello

	def something
		yield 1
		yield 2
		yield 3

	def helper x
		x + 1

	def wrap x
		[x]

	def calls
		yield helper(1)
		yield (helper(2))
		yield self.wrap(helper(3))
		yield wrap(helper(4))

	def closures
		yield [5,6].map(do(x) helper(x))

	def ampers
		yield [7,8].map(&.toString!)

test do
	let v = foo(1)
	eq v.next!.value,2
	eq v.next!.value,4
	eq v.next!.value,8

test do
	eq Array.from(nothing!), [undefined]

test do
	let v = (new Hello).something!
	eq v.next!.value,1
	eq v.next!.value,2
	eq v.next!.value,3

test do
	eq Array.from((new Hello).calls!), [2,3,[4],[5]]

test do
	eq Array.from((new Hello).closures!), [[6,7]]

test do
	eq Array.from((new Hello).ampers!), [['7','8']]

test 'await inside yield makes an async generator' do
	# A sync generator with await is a JS syntax error that stops this file from loading, so the test checks the compiled code
	let res = imbac.compile("def gen\n\tyield await 1", sourcePath: 'gen.imba', platform: 'browser')
	ok res.js.match(/async function\*\s*gen\(/)

test 'yield* delegates to another generator' do
	# Compiled from a string, so that a compiler without yield* fails this test instead of the whole file
	let res = imbac.compile("def inner\n\tyield 1\n\tyield 2\ndef outer\n\tyield 0\n\tyield* inner!\n\tyield 3", sourcePath: 'gen.imba', platform: 'browser')
	ok res.js.match(/yield\*\s*inner\(\)/)
	let load = new Function(res.js + '\nreturn outer')
	let outer = load!
	eq Array.from(outer!), [0,1,2,3]
