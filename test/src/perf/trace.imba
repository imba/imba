
extern imbalang
# var compiler = require '/repos/imba/lib/compiler'
var compiler = imbalang
var snippets = require './snippets'

# var html = fs.readFileSync(__dirname + '/robot.html', 'utf8')
# console.log(html)

def bench name, blk
	console.time(name)
	console.profile
	blk()
	console.timeEnd(name)
	console.profileEnd

export var lex = do |num,snippet|
	num = num || 1
	snippet = snippet || snippets.NODES
	snippet = Array.new(num + 1).join(snippet + "\n")
	bench "lex" do compiler.tokenize(snippet, rewrite: no)
	return

export var rewrite = do |num,snippet|
	num = num || 1

	snippet = snippet || snippets.NODES
	snippet = Array.new(num + 1).join(snippet + "\n")
	var tokens = compiler.tokenize(snippet, rewrite: no)
	bench "rewrite" do compiler.rewrite(tokens)
	return

export var tokenize = do |num,snippet|
	num = num || 1
	snippet = snippet || snippets.NODES
	snippet = Array.new(num + 1).join(snippet + "\n")
	bench "tokenize" do compiler.tokenize(snippet)
	return

export var parse = do |num,snippet|
	num = num || 1
	snippet = snippet || snippets.NODES
	snippet = Array.new(num + 1).join(snippet + "\n")
	bench "parse" do compiler.parse(snippet)
	return


export var compile = do |num,snippet|
	num = num || 1
	snippet = snippet || snippets.NODES
	snippet = Array.new(num + 1).join(snippet + "\n")
	bench "compile" do compiler.compile(snippet)
	return
