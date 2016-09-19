var fs = require 'fs'
var v8 = require 'v8-natives'
var body = fs.readFileSync("{__dirname}/sample.imba",'utf8')
# create compiler with flag

# process:env.IMBAC_PROFILE = yes
require "imba/register"
import Lexer from "../../lib/compiler/lexer"
import Rewriter from "../../lib/compiler/rewriter"


var lexer = Lexer.new
var rewriter = Rewriter.new

def step
	var now = Date.now
	var t = {}
	var o = filename: 'sample.imba', rewrite: no
	lexer.reset
	var tokens = lexer.tokenize(body,o)
	t:lex = Date.now - now
	# v8.collectGarbage
	# console.log "lex {Date.now - now}ms"
	now = Date.now
	tokens = rewriter.rewrite(tokens,o)
	# console.log "rewrite {}ms"
	t:rw = Date.now - now
	console.log "time {t:lex}ms / {t:rw}ms"
	return

step
step
step
step
step
step
step
step
step
step
# step
# step
# step
# step
# step
# step
# step
# step
# step
# step
# step
# step
# step
# step
# step
# step
# step