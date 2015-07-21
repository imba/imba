
extern imbalang
# var compiler = require '/repos/imba/lib/compiler'
var compiler = imbalang
var snippets = require './snippets'

# var html = fs.readFileSync(__dirname + '/robot.html', 'utf8')
# console.log(html)

def bench name, o = {}, &blk
	console.time(name)
	console.profile unless o:profile == no
	blk()
	console.timeEnd(name)
	console.profileEnd unless o:profile == no
	return

export var lex = do |num,o = {}|
	num = num || 1
	var snippet = Array.new(num + 1).join(snippets.NODES + "\n")
	bench("lex",o) do
		compiler.tokenize(snippet, rewrite: no)
		return

	return

export var rewrite = do |num,o = {}|
	num = num || 1
	var snippet = Array.new(num + 1).join(snippets.NODES + "\n")
	var tokens = compiler.tokenize(snippet, rewrite: no)
	bench("rewrite",o) do
		compiler.rewrite(tokens)
		return
	return

export var tokenize = do |num,o = {}|
	num = num || 1
	var snippet = Array.new(num + 1).join(snippets.NODES + "\n")
	bench("tokenize",o) do
		compiler.tokenize(snippet)
		return
	return

export var parse = do |num,o = {}|
	num = num || 1
	var snippet = Array.new(num + 1).join(snippets.NODES + "\n")
	bench("parse",o) do
		compiler.parse(snippet)
		return
	return


export var astify = do |num,o = {}|
	num = num || 1
	var snippet = Array.new(num + 1).join(snippets.NODES + "\n")
	var tokens = compiler.tokenize(snippet, filename: "stdin")
	bench("parse",o) do
		compiler.parse(tokens)
		tokens = undefined
		return
	return

export var compile = do |num,o = {}|
	num = num || 1
	var snippet = Array.new(num + 1).join(snippets.NODES + "\n")
	bench("compile",o) do
		compiler.compile(snippet)
		return
	return
