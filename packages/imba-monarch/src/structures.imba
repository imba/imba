###
Basic structures used by compiler, diagnostics etc
Follows the interfaces specified in the language-server-protocol
###

const DOCMAP = new WeakMap

export class Position
	prop line # zero based line position
	prop character # zero based offset on line
	prop offset # zero based offset in whole document

	def constructor l,c,o,v = null
		line = l
		character = c
		offset = o
		#version = v

	def toString
		"{line}:{character}"

	def valueOf
		offset

###
A range in a text document expressed as (zero-based) start and end positions. A range is comparable to a selection in an editor. Therefore the end position is exclusive. If you want to specify a range that contains a line including the line ending character(s) then use an end position denoting the start of the next line.
###
export class Range
	prop start
	prop end

	def constructor start, end
		self.start = start
		self.end = end

	get offset
		start.offset

	get length
		end.offset - start.offset

	get ['0']
		start.offset

	get ['1']
		end.offset

	def getText str
		str.slice(start,end)
		
	def equals other
		other.offset == offset and other.length == length



export const DiagnosticSeverity = {
	Error: 1
	Warning: 2
	Information: 3
	Hint: 4
	error: 1
	warning: 2
	warn: 2
	info: 3
	hint: 4
}

export class Diagnostic

	def constructor data,doc = null
		self.range = data.range
		self.severity = DiagnosticSeverity[data.severity] or data.severity
		self.code = data.code
		self.source	= data.source
		self.message = data.message
		DOCMAP.set(self,doc)
	
	get #source
		DOCMAP.get(self)

	get #lineText
		#source.doc.getLineText(range.start.line)

	def toSnippet
		let start = range.start
		let end = range.end
		let msg = "{#source.sourcePath}:{start.line + 1}:{start.character + 1}: {message}"
		let line = #source.doc.getLineText(start.line)
		let stack = [msg,line]
		stack.push line.replace(/[^\t]/g,' ').slice(0,start.character) + "^".repeat(end.character - start.character)
		return stack.join('\n').replace(/\t/g,'    ') + "\n"

	def toError
		let start = range.start
		let end = range.end
		let msg = "{#source.sourcePath}:{start.line + 1}:{start.character + 1}: {message}"
		let err = new SyntaxError(msg)
		let line = #source.doc.getLineText(start.line)
		let stack = [msg,line]
		stack.push line.replace(/[^\t]/g,' ').slice(0,start.character) + "^".repeat(end.character - start.character)
		err.stack = "\n" + stack.join('\n').replace(/\t/g,'    ') + "\n"
		return err

	def raise
		throw toError!