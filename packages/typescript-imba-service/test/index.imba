import np from 'path'
import Service from '../index'
import * as ts from 'typescript/lib/tsserverlibrary'

def run
	let s = new Service(np.resolve(__dirname,'project'))
	await s.ready
	let x = global.ils
	# let doc = s.file('complete-class.imba')
	# let doc = s.file('css-variable2.imba')
	let doc = s.file('css-variable.imba')
	# const completions = doc.getCompletions(26,{triggerCharacter: ''}) # .serialize!
	# const completions = doc.getCompletions(35, {triggerCharacter: ''}) # .serialize!
	const completions = doc.getCompletions(36, {triggerCharacter: ''}) # .serialize!
	# console.log completions
	console.log completions.items[0]
	# console.log doc.doc.getOutline!

run!