import Script from '../src/script'
import txt from './sample.txt'

def run
	let script = new Script({fileName: 'sample.txt'},txt)
	let puts = console.log.bind(console)
	let s = global.s = script
		
	def selchanged e
		let loc = e.target.selectionStart
		let ctx = script.getContextAtOffset(loc)
		puts loc
		puts ctx.suggest
		puts ctx.token
		puts ctx
		

	if $web$
		imba.mount do
			<textarea[pos:absolute inset:0 w:100% box-sizing:border-box] value=txt @select=selchanged>

		console.log s.tokens

setTimeout(&,100) do run!