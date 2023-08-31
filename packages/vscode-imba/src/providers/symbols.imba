import * as util from '../util'

import { DocumentSymbol, Range, TextDocument, SymbolKind, Location, Position } from 'vscode'

const kindMap = {
	def: SymbolKind.Method
	get: SymbolKind.Property
	prop: SymbolKind.Property
	attr: SymbolKind.Property
	set: SymbolKind.Method
	class: SymbolKind.Class
	tag: SymbolKind.Class

}

def toKind kind
	kindMap[kind] or SymbolKind.Variable

def toRange span
	new Range(
		new Position(span.start.line,span.start.character),
		new Position(span.end.line,span.end.character)
	)

def toLoc doc\TextDocument, span
	new Location(doc.uri, toRange(span))

def toSymbol doc, item
	let sym = new DocumentSymbol(item.name,'',toKind(item.kind),toRange(item.range),toRange(item.selectionRange))
	sym.children = item.children.map do toSymbol(doc,$1)
	return sym

export default class DocumentSymbolProvider
	def provideDocumentSymbols doc\TextDocument, token
		let symbols = util.fastExtractSymbols(doc.getText!)

		try
			let out = symbols.children.map do toSymbol(doc,$1)
			# util.log JSON.stringify(out2,null,2)
			return out
		catch e
			util.log "error {e.message}"
			return []