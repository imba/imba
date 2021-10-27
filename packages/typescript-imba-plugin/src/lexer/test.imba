import ts from 'typescript/lib/tsserverlibrary'
import Patcher from '../tsplugin/patches'
import ImbaScriptInfo from './snapshot'

Patcher(ts)

def run
	let store = new ts.server.TextStorage(ts.sys,{path: ''})
	store.getFileTextAndSize = do return {text: 'let x = 1\nlet y = x + x'}
	store.resetSourceMapInfo = do yes
	store.switchToScriptVersionCache!
	let svc = store.svc
	svc.currentVersionToIndex = do this.currentVersion
	svc.versionToIndex = do(number) number
	# console.log svc
	# console.log svc.getFullText!
	
	let doc = new ImbaScriptInfo(svc)
	let p = do console.log(...arguments)
	let po = do(num,v0 = 0) p svc.rewindOffset(num,v0)
	let log = do
		p svc.getFullText!
		p doc.tokens.map(do "{$1.type}({$1.value or ''})").join(" ")
	log!
	po 16
	svc.edit(4,0,'a')
	log!
	po 16
	# svc.edit(4,1,'')
	# log!
	# po 16
	p svc.rewindOffset(18,0)
	svc.edit(4,0,'b')
	p svc.rewindOffset(18,0)
	p doc.getSemanticTokens!

run!

