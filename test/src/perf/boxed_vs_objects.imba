



class Token

	def initialize value, spaced
		@value = value
		@spaced = spaced


var helper = require './helper'
var b = helper.Benchmark.new "Testing", maxTime: 1

R1 = /// ^
	(
		(\$|@@|@|\#)[A-Za-z_\-\x7f-\uffff][$\w\x7f-\uffff]* (\-[$\w\x7f-\uffff]+)* |
		[$A-Za-z_][$\w\x7f-\uffff]* (\-[$\w\x7f-\uffff]+)*
	)
	( [^\n\S]* : (?![\*\=:$\w\x7f-\uffff]) )?  # Is this a property name?
///

R2 = /^[A-Za-z_\-\x7f-\uffff][$\w\x7f-\uffff]* (\-[$\w\x7f-\uffff]+)*/

var str = "hello atesg"

# add tests
b.add('String#boxed') do
	var arr = []

	var count = 200
	while --count
		var str = "mystring"
		var val = String.new(str)
		val:spaced = yes
		arr.push(val)
	true

b.add('Token') do
	var arr = []

	var count = 200
	while --count
		var str = "mystring"
		var val = Token.new(str,yes)
		arr.push(val)
	true

b.add('Long regex') do
	R1.exec(str)

b.add('Short regex') do
	R2.exec(str)

# run async
b.run()

console.log "got here"