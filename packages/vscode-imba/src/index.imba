import {window, commands, languages, IndentAction, workspace,Range, extensions, TextEdit} from 'vscode'

import path from 'path'
import * as util from './util'

import CompletionsProvider from './providers/completions'
import DocumentSymbolProvider from './providers/symbols'
import Bridge from './bridge'
import ImbaScript from 'imba-monarch'

# include

let bridge = null
let log = util.log

languages.setLanguageConfiguration('imba',{
	wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!%\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)|(#+[\w\-]*)|(@+[\w\-]*)/g,
	onEnterRules: [{
		beforeText: /^\s*(?:export def|constructor|def |(export (default )?)?(static )?(def |get |set )|(export (default )?)?(class|tag)|for\s|if\s|elif\s|else|while\s|try|with|finally|except).*?$/,
		action: { indentAction: IndentAction.Indent }
	},{
		beforeText: /\s*(?:do)\s*(\|.*\|\s*)?$/,
		action: { indentAction: IndentAction.Indent }
	},{
		beforeText: /^\s*(css)\b.*$/,
		action: { indentAction: IndentAction.Indent }
	},{
		beforeText: /\s*(?:do)\(.*\)\s*$/,
		action: { indentAction: IndentAction.Indent }
	}]
})

const foldingToggles = {}

def scriptForDoc doc
	let body = doc.getText!
	let script = new ImbaScript(doc.fileName,body)
	return script

def applyEdits editor, doc, edits
	editor.edit do(builder)
		for edit in edits
			let start = doc.positionAt(edit[0])
			let end = doc.positionAt(edit[0] + edit[1])
			let range = new Range(start,end)
			builder.replace(range,edit[2] or '')

def adjustmentCommand amount = 1
	return do(editor,edit)
		let doc = editor.document
		# Should just work locally
		let edits = await bridge.call('increment',util.toPath(doc.uri),{
			by: amount
			selections: editor.selections
		})

		if edits
			let start = doc.positionAt(edits[0])
			let end = doc.positionAt(edits[0] + edits[1])
			let range = new Range(start,end)

			editor.edit do(edit)
				edit.replace(range,edits[2])

def documentFormatCommand name = ''
	return do(editor,edit)
		let doc = editor.document
		let script = scriptForDoc(doc)
		if script and script[name]
			if let res = script[name]()
				applyEdits(editor,doc,res)

		window.showWarningMessage("Formatting document {name}")

def getStyleBlockLines doc
	let count = doc.lineCount
	let i = 0
	let lines = []
	while i < count
		let line = doc.lineAt(i)
		let m = line.text.match(/^(\t*)(global )?css\b/)
		if m
			let k = i
			let res = undefined
			while res === undefined and k < count
				let next = doc.lineAt(++k)
				let m2 = next.text.match(/^([\t\s]*)(?=[^\#]|\#\w)/)
				if m2 
					let diff = m2[1].length - m[1].length
					if diff > 0
						lines.push(i)
						res = yes
					else
						res = no
				# need to figure out whether the css part stretches multiple lines
				lines.push(i) if res == yes
		i++
	log 'getStyleBlockLines',lines
	return lines

def configure items = {}
	let cfg = workspace.getConfiguration(undefined,null)
	for own k,v of items
		cfg.update(k,v)

def sendConfiguration
	let conf = workspace.getConfiguration('imba')
	let raw = JSON.parse(JSON.stringify(conf))
	util.log("sending configuration",raw)
	bridge.call('setConfiguration',raw)

export def activate context
	let conf = workspace.getConfiguration('imba')
	let id = "imba-ipc-{String(Math.random!)}"
	
	log("activating imba?! {process.env.TSS_DEBUG}")
	
	commands.registerCommand('imba.autoImportAlert') do(doc,item)
		let message = "Added auto-import for {item.source}"
		try
			let edit = item.additionalTextEdits[0]
			let line = doc.lineAt(edit.range.start.line).text
			message = "Added: {line}"
		
		window.showWarningMessage(message)

	try
		const tls = extensions.getExtension('vscode.typescript-language-features')
		log("gettingtls extension")
		await tls.activate(context)
		log("activated tls")
		const tlsapi = try tls.exports.getAPI(0)
		bridge = new Bridge(tlsapi)	do
			sendConfiguration!
		bridge.ping!
		# bridge.call('setConfiguration',JSON.parse(JSON.stringify(conf)))

		if conf.get('debugPort')
			unless process.env.TSS_DEBUG
				process.env['TSS_DEBUG'] = String(conf.get('debugPort'))
				log("restarting ts server in debug mode {process.env['TSS_DEBUG']}")
				try await commands.executeCommand("typescript.restartTsServer")
					
		# sendConfiguration!


	languages.registerCompletionItemProvider({language: 'imba'},new CompletionsProvider(bridge),'.',':', '"', '@','%','\\',"'",'=','<','#','/')
	util.log('setting up symbol provider')
	languages.registerDocumentSymbolProvider({language: 'imba1'},new DocumentSymbolProvider)

	workspace.getConfiguration(undefined,null)
	
	
	
	commands.registerCommand('imba.getProgramDiagnostics') do
		yes

	commands.registerCommand('imba.clearProgramProblems') do
		yes
		
	commands.registerCommand('imba.setDefaultSettings') do
		let settings = {
			"[imba].editor.insertSpaces": false,
			"[imba].editor.tabSize": 4,
			"[imba].editor.autoIndent": "advanced",
			"files.eol": "\n"
		}
		configure(settings)

	commands.registerTextEditorCommand('ximba.incrementByOne',adjustmentCommand(1))
	commands.registerTextEditorCommand('ximba.decrementByOne',adjustmentCommand(-1))

	for item in ['migrateStyleOperators']
		commands.registerTextEditorCommand(`imba.{item}`,documentFormatCommand(item))

	commands.registerTextEditorCommand('imba.foldStyles') do(editor,edit)
		let key = editor.document.uri.toString!
		let lines = getStyleBlockLines(editor.document)
		foldingToggles[key] = yes
		await commands.executeCommand("editor.fold", {selectionLines: lines, direction: 'up'})

	commands.registerTextEditorCommand('imba.unfoldStyles') do(editor,edit)
		let key = editor.document.uri.toString!
		let lines = getStyleBlockLines(editor.document)
		foldingToggles[key] =  no
		await commands.executeCommand("editor.unfold", {selectionLines: lines})

	commands.registerTextEditorCommand('imba.toggleStyles') do(editor,edit)
		let key = editor.document.uri.toString!
		let lines = getStyleBlockLines(editor.document)
		let bool = foldingToggles[key] or no
		foldingToggles[key] = !bool
		let cmd = bool ? 'unfold' : 'fold'
		log 'toggle folding',cmd,lines,bool
		await commands.executeCommand("editor.{cmd}", {selectionLines: lines, direction: 'up'})
	
	workspace.onDidSaveTextDocument do(e)
		let path = util.toPath(e.uri)
		log("ondidsavedoc? {path}")
		if util.isImba(path)
			
			bridge.call('onDidSaveTextDocument',util.toPath(e.uri))
	
	workspace.onDidChangeConfiguration do(e)
		sendConfiguration!
		
	
	window.onDidChangeTextEditorSelection do(e)
		const doc = e.textEditor.document
		const uri = doc.uri

		let params = {
			kind: e.kind
			selections: e.selections
			file: util.toPath(uri)
			uri: uri.toString!
		}
		if util.isImba(params.file)
			bridge.call('onDidChangeTextEditorSelection',params.file,params)

export def deactivate
	return undefined