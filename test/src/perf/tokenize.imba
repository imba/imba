
var fs = require 'fs'
var code = fs.readFileSync("{__dirname}/long_sample.imba").toString
# var compiler  = require "../../../lib/compiler"
var compiler  = require "/repos/imba/lib/compiler"
var tokens = compiler.tokenize(code)

# fs.writeFileSync("{__dirname}/snippets.imba","¨`LONG_SAMPLE = {JSON.stringify(code)};`")

# class Token
# 
# 	def initialize value, spaced
# 		@value = value
# 		@spaced = spaced

var helper = require './helper'
var b = helper.Benchmark.new "tokenize", maxTime: 1

# add tests
b.add('tokenize') do
	compiler.tokenize(code) # hmm

b.add('parse') do
	compiler.parse(tokens) # hmm
# b.add('Token') do
# 	var arr = []
# 
# 	var count = 200
# 	while --count
# 		var str = "mystring"
# 		var val = Token.new(str,yes)
# 		arr.push(val)
# 	true

# run async
b.run()