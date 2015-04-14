
var name = "imba"

console.time("modules")
var cli       = require 'commander'
var fs        = require 'fs'
var path      = require 'path'

var compiler  = require "/repos/{name}/lib/compiler"
var chalk     = require 'chalk'

console.timeEnd("modules")

var lex = compiler:lex
var code = fs.readFileSync("/repos/imba/test/src/helpers/nocomments.imba").toString


var count = 1


while count > 0
	count--
	console.log "file is {code:length}"
	console.time("tokenize")
	# lex.tokenize code, profile: yes
	compiler.tokenize(code, profile: yes)
	console.timeEnd("tokenize")

true
# compiler.tokenize(code, profile: yes)