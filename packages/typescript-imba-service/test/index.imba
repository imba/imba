import np from 'path'
import Service from '../index'
import * as ts from 'typescript/lib/tsserverlibrary'

def run
	let s = new Service(np.resolve(__dirname,'project'))
	await s.ready
	let x = global.ils
	let doc = s.file('complete-class.imba')
	console.log doc.getCompletions(26,{triggerCharacter: ''}) # .serialize!
	# console.log doc.doc.getOutline!

run!