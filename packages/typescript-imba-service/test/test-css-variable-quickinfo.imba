import np from 'path'
import Service from '../index'
import * as ts from 'typescript/lib/tsserverlibrary'

def run
	let s = new Service(np.resolve(__dirname, 'project'))
	await s.ready
	let doc = s.file('css-variable-quickinfo.imba')
	const completions = doc.getQuickInfo(36) # .serialize!
	# console.log completions
	console.log completions.items[0]
	debugger
	# console.log doc.doc.getOutline!

run!
