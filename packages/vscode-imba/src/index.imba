import path from 'path'
import { window, commands, languages, IndentAction, workspace,Range, extensions } from 'vscode'

import * as util from './util'
import CompletionsProvider from './providers/completions'
import DocumentSymbolProvider from './providers/symbols'
import Bridge from './bridge'


let bridge = null
const log = util.log
const foldingToggles = {}


languages.setLanguageConfiguration('imba', {
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


def adjustmentCommand amount = 1
	return do(editor, edit)
		let doc = editor.document
		let edits = await bridge.call('increment', util.toPath(doc.uri), {
			by: amount
			selections: editor.selections
		})

		if edits
			let start = doc.positionAt(edits[0])
			let end = doc.positionAt(edits[0] + edits[1])
			let range = new Range(start, end)

			editor.edit do(edit)
				edit.replace(range, edits[2])


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
	log 'getStyleBlockLines', lines
	return lines


def configure items = {}
	let cfg = workspace.getConfiguration(undefined, null)
	for own k, v of items
		cfg.update(k, v)


def sendConfiguration
	let conf = workspace.getConfiguration('imba')
	let raw = JSON.parse(JSON.stringify(conf))
	util.log("sending configuration", raw)
	bridge.call('setConfiguration', raw)


export def activate context
	let conf = workspace.getConfiguration('imba')
	console.log "imba.activate", conf
	log JSON.stringify({ msg: "imba.activate", conf: conf })
	let id = "imba-ipc-{String(Math.random!)}"
	
	log("activating imba?! {process.env.TSS_DEBUG}")
	
	commands.registerCommand('imba.autoImportAlert') do(doc, item)
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
		# bridge.call('setConfiguration', JSON.parse(JSON.stringify(conf)))

		const debugPort = conf.get('debugPort') or process.env['IMBA_DEBUG_PORT']

		if debugPort
			unless process.env.TSS_DEBUG
				process.env['TSS_DEBUG'] = String(debugPort)
				log("restarting ts server in debug mode {process.env['TSS_DEBUG']}")
				try
					await commands.executeCommand("typescript.restartTsServer")
				catch e
					console.error('await commands.executeCommand("typescript.restartTsServer")', e)
				debugger
					
		# sendConfiguration!

	languages.registerCompletionItemProvider({language: 'imba'}, new CompletionsProvider(bridge), '.', ':',  '"',  '@', '%', '\\', "'", '=', '<', '#')
	util.log('setting up symbol provider')
	languages.registerDocumentSymbolProvider({language: 'imba1'}, new DocumentSymbolProvider)

	workspace.getConfiguration(undefined, null)
	
	commands.registerCommand('imba.getProgramDiagnostics') do
		yes

	commands.registerCommand('imba.clearProgramProblems') do
		yes
		
	commands.registerCommand('imba.setDefaultSettings') do
		let settings = {
			"[imba].editor.insertSpaces": false
			"[imba].editor.tabSize": 4
			"[imba].editor.autoIndent": "advanced"
			"files.eol": "\n"
		}
		configure(settings)

	commands.registerTextEditorCommand('ximba.incrementByOne', adjustmentCommand(1))
	commands.registerTextEditorCommand('ximba.decrementByOne', adjustmentCommand(-1))

	commands.registerTextEditorCommand('imba.foldStyles') do(editor, edit)
		let key = editor.document.uri.toString!
		let lines = getStyleBlockLines(editor.document)
		foldingToggles[key] = yes
		await commands.executeCommand("editor.fold", { selectionLines: lines, direction: 'up' })

	commands.registerTextEditorCommand('imba.unfoldStyles') do(editor, edit)
		let key = editor.document.uri.toString!
		let lines = getStyleBlockLines(editor.document)
		foldingToggles[key] =  no
		await commands.executeCommand("editor.unfold", { selectionLines: lines })

	commands.registerTextEditorCommand('imba.toggleStyles') do(editor, edit)
		let key = editor.document.uri.toString!
		let lines = getStyleBlockLines(editor.document)
		let bool = foldingToggles[key] or no
		foldingToggles[key] = !bool
		let cmd = bool ? 'unfold' : 'fold'
		log 'toggle folding', cmd, lines, bool
		await commands.executeCommand("editor.{cmd}", { selectionLines: lines, direction: 'up' })
	
	workspace.onDidSaveTextDocument do(e)
		const path = util.toPath(e.uri)
		log("ondidsavedoc? {path}")
		if util.isImba(path)
			bridge.call('onDidSaveTextDocument', path)
	
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
			bridge.call('onDidChangeTextEditorSelection', params.file, params)


export def deactivate
	return undefined
