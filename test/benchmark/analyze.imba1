var fs = require 'fs'
var cp = require 'child_process'

var flags = "--allow-natives-syntax --trace-deopt --trace-inlining --polymorphic_inlining "
var cmd = "V8PROF=1 node {flags} {__dirname}/run.js > {__dirname}/v8.log"

cp.execSync(cmd)
console.log 'done'

var log = fs.readFileSync("{__dirname}/v8.log",'utf8')
console.log "length of log {log:length}"
# now analyze
for type in ['Token','Rewriter','Lexer']
	var reg = RegExp.new("{type} with map (\\w+)",'g')
	var maps = {}
	console.log "Maps for {type}"
	console.log reg
	log.replace(reg) do |m,typ|
		unless maps[typ]
			maps[typ] = 0
		maps[typ]++
	console.log maps

def find name, reg, uniq = no
	var count = 0
	var hits = []
	log.replace(reg) do |m,y|
		hits.push(m)
	console.log "{name} -- {hits:length}"
	console.log hits # .sort


find('shared types', /Rewriter\.tokenType \(SharedFunctionInfo (\w+)\)/g,yes)

find('remove opt',/removing optimized code for\: ([\w\.]+)/g)
find('deopt eager',/deoptimizing \(DEOPT eager\): begin \w+ <JS Function ([\w\.]+)/g)
find('deopt reasons',/deoptimize at \d+\: ([^\n]+)/g)
find('out of bounds',/out of bounds/g)
find('timings',/time \d+ms \/ \d+ms/g)
yes



