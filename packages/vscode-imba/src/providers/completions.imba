import { log } from 'node-ipc'
import * as util from '../util'

import { CompletionItemKind, CompletionList, CompletionItem, Range, TextEdit, MarkdownString, SnippetString, Command } from 'vscode'
import * as Converters from '../converters'

class ImbaCompletionItem < CompletionItem
	
	constructor raw
		super(raw.label.name)
		#raw = raw
		Object.assign(self,raw)
		# self.textEdit = raw.textEdit
		# self.triggerCharacters = raw.triggerCharacters

export default class CompletionsProvider
	constructor bridge
		#bridge = bridge
		#cache = {}
	
	def formatDocumentation doc, item
		return unless doc
		let str = new MarkdownString('')
		
		if doc isa Array
			for item in doc
				if item.kind == 'text'
					str.appendMarkdown(item.text)
				elif item.kind == 'markdown'
					str.appendMarkdown(item.text)
				else
					str.appendMarkdown(item.text)
			return str			
	
	def syncItem doc, item, raw
		if let te = raw.additionalTextEdits
			for entry,i in te
				continue if entry isa TextEdit
				let range = new Range doc.positionAt(entry.start),doc.positionAt(entry.start + entry.length)
				te[i] = TextEdit.replace(range,entry.newText)
			
			item.additionalTextEdits = te
		item

	def provideCompletionItems(doc, pos, token, context)
		let file = util.toPath(doc)
		util.log("provideCompletionItems!! {doc} {doc.fsPath} {doc.offsetAt(pos)} {file} {JSON.stringify(context)}",pos)
		let range = new Range(pos,pos)
		if context.triggerKind != 2
			#cache = {}
		
		if let cache = #cache[file]
			util.log("found old completions? {cache.items.length}")
			# could also decide to show additional ones
			
			for item in cache.items
				item.commitCharacters = item.#raw.commitCharacters
			return cache.items
		else
			#cache = {}

		let res = await #bridge.call('getCompletions',file,doc.offsetAt(pos),context)
		
		#doc = doc

		let items = []
		
		for raw in res
			
			if raw.range
				raw.range = new Range(doc.positionAt(raw.range[0]),doc.positionAt(raw.range[1]))
			
			if let te = raw.textEdit
				let range = new Range doc.positionAt(te.start),doc.positionAt(te.start + te.length)
				raw.textEdit = TextEdit.replace(range,te.newText)
				
			elif raw.insertText == undefined
				raw.insertText = raw.label.name
				
			if raw.insertSnippet
				raw.insertText = new SnippetString(raw.insertSnippet)
			
			let lbl = raw.label

			if lbl and lbl.name
				lbl.label = lbl.name
				lbl.detail = lbl.qualifier
				lbl.description ||= lbl.type
				
				if lbl.detail
					lbl.detail = " " + lbl.detail

			let item = new ImbaCompletionItem(raw)
			item.kind = Converters.convertKind(raw.kind)
			
			if typeof raw.kind == 'number'
				item.kind = raw.kind

			if raw.kindModifiers..indexOf('deprecated') >= 0
				item.tags = [1]
			
			# Dont allow fancy triggers before typing any additional characters
			if context.triggerKind == 1 and !raw.action
				item.commitCharacters = []

			# color
			if raw.kind == 15
				item.kind = 15
				item.detail = raw.detail or raw.data.color
				
			if raw.cat == 'tag' or raw.cat == 'tagname'
				item.kind = CompletionItemKind.Class

			if raw.cat == 'file'
				item.kind = CompletionItemKind.File
			
			if raw.cat == 'folder' or raw.cat == 'dir'
				item.kind = CompletionItemKind.Folder

			items.push(item)
		# return items
		if context.triggerKind == 1	or true
			#cache[file] = {items: items}

		let list = new CompletionList(items,true)
		return list
	
	def resolveCompletionItem item, token
		if item.#resolved
			return item

		let res = await #bridge.call('resolveCompletionItem',item,item.data)
		util.log("resolving item {JSON.stringify(item)} {JSON.stringify(item.#raw)} {JSON.stringify(item.data)} {JSON.stringify(res)}")
		
		if res.markdown
			item.documentation ||= new MarkdownString(res.markdown)
			
		item.documentation ||= formatDocumentation(res.documentation,item)
		item.detail = res.detail or item.detail

		if item.label.label
			item.label.description = res.detail
		
		item.#resolved = yes
		
		syncItem(#doc,item,res)
		
		if item.source
			item.command = {command: 'imba.autoImportAlert', arguments: [#doc,item]}

		return item