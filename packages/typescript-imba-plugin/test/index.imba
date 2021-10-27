import Script from '../src/lexer/script'
import txt from './sample.txt'

import * as ts from 'typescript/lib/tsserverlibrary'
# want to get it raw - this gets more complicated now - hmm
let svc = ts.server.ScriptVersionCache.fromString(txt)
let script = new Script({fileName: 'sample.txt'},svc)
# console.log JSON.stringify(script.getOutline!,null,2)
let puts = console.log.bind(console)
let p = do(item)
	console.log item
	console.log JSON.stringify(item,null,2)

let s = global.s = script

for item in [55]
	console.log item,script.getContextAtOffset(item)
	
# global.f=script.getFormattingEdits()
# console.log global.f
# console.log script.getOutline()
# console.log s.findPath("String.prototype.hello")
# console.log s.index.positionToColumnAndLineText(30)

def selchanged e
	console.log 'selchanged!',e.target.selectionStart
	let loc = e.target.selectionStart
	let ctx = script.getContextAtOffset(loc)
	puts loc
	puts ctx.suggest
	puts ctx.token
	puts ctx
	puts "vars", script.varsAtOffset(loc)
	

if $web$
	imba.mount do
		<textarea[pos:absolute inset:0 w:100% box-sizing:border-box] value=txt @select=selchanged>

	console.log s.tokens