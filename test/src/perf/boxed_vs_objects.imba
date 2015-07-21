



class Token

	def initialize value, spaced
		@value = value
		@spaced = spaced

	def toString
		@value

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

var id = "my-string-ref="
var plainset = "mystringref="
var plain = "myStringRef"
var tok = Token.new(id,yes)

var CR = /(.+)\=$/
var CR2 = /([\-\s])(\w)/g

def symbolize1 str
	var sym = String(str).replace(/(.+)\=$/,"set-$1")
	sym = sym.replace(/([\-\s])(\w)/g) do |m,v,l| l.toUpperCase
	return sym

def symbolize2 str
	str = String(str)
	var end = str.charAt(str:length - 1)
	str = 'set-' + str.slice(0,-1) if end == '='
	return str.replace(/([\-\s])(\w)/g) do |m,v,l| l.toUpperCase

def symbolize3 str
	var sym = String(str).replace(CR,"set-$1")
	sym = sym.replace(CR2) do |m,v,l| l.toUpperCase
	return sym

def symbolize3 str
	var sym = String(str).replace(CR,"set-$1")
	sym = sym.replace(CR2) do |m,v,l| l.toUpperCase
	return sym

def symbolize4 str
	str = String(str)
	var end = str.charAt(str:length - 1)

	if end == '='
		str = 'set' + str[0].toUpperCase + str.slice(1,-1)

	if str.indexOf("-") >= 0
		str = str.replace(/([\-\s])(\w)/g) do |m,v,l| l.toUpperCase

	return str


b.add('a') do symbolize1(id)
b.add('b') do symbolize2(id)
b.add('c') do symbolize3(id)
b.add('4') do symbolize4(id)

b.add('a-plain') do symbolize1(plain)
b.add('b.plain') do symbolize2(plain)
b.add('c.plain') do symbolize3(plain)
b.add('4.plain') do symbolize4(plain)

b.add('a-plainset') do symbolize1(plainset)
b.add('b.plainset') do symbolize2(plainset)
b.add('c.plainset') do symbolize3(plainset)
b.add('4.plainset') do symbolize4(plainset)


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

b.add('Token2') do
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


b.add('Autostring') do
	String
	R1.exec(str)

b.add('Short regex') do
	R2.exec(str)

	

# run async
b.run()

console.log "got here"