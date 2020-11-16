# warning
# error
# info

import { ImbaDocument } from '../program/document'

const STEPS =
	TOKENIZE: 1
	REWRITE: 2
	PARSE: 4
	TRAVERSE: 8
	COMPILE: 16

const META = new WeakMap

export class Diagnostic

	def constructor source, {category, severity, message, offset, length}
		self.category = category
		self.severity = severity
		self.message = message
		self.offset = offset
		self.length = length
		META.set(self,source)

	get start
		#start ??= source.doc.positionAt(offset)
	
	get end
		#end ??= source.doc.positionAt(offset + length)

	get source
		META.get(self)

	get snippet
		""

	def toError
		let msg = "{source.sourcePath}:{start.line + 1}:{start.character + 1}: {message}"
		let err = new SyntaxError(msg)
		err.fileName = source.sourcePath
		let line = source.doc.getLineText(start.line)
		let stack = [msg,line]
		stack.push line.replace(/[^\t]/g,' ').slice(0,start.character) + "^".repeat(length)
		err.stack = "\n" + stack.join('\n').replace(/\t/g,'    ') + "\n"
		return err

	def raise
		throw toError!

export class Diagnostics < Array

	def add raw
		push let item = new Diagnostic(raw)
		return item

	get errors
		filter do $1.severity == 'error'
	
	get warnings
		filter do $1.severity == 'warning'

	get info
		filter do $1.severity == 'info'

###
Should eventually take over for the Stack / options mess in nodes.imba1
###
export class Compilation

	# lexer, rewriter and parser are
	# currently set on prototype in compiler.imba1

	static prop current

	static def error opts do current..addDiagnostic('error',opts)
	static def warn opts do current..addDiagnostic('warning',opts)
	static def info opts do current..addDiagnostic('info',opts)

	def constructor code, options
		self.sourceCode = code
		self.sourcePath = options.sourcePath

		self.options = options
		self.flags = 0
		self.js = ""
		self.css = ""
		self.result = {}
		self.diagnostics = [] #  new Diagnostics
		self.tokens = null
		self.ast = null
		

	def tokenize
		if flags |=? STEPS.TOKENIZE
			Compilation.current = self
			tokens = lexer.tokenize(sourceCode,options,self)
			tokens = rewriter.rewrite(tokens,options,self)
		yes

	def parse
		tokenize!
		if flags |=? STEPS.PARSE
			ast = parser.parse(tokens,options,self)

	def compile
		Compilation.current = self
		parse!
		if flags |=? STEPS.COMPILE
			result = ast.compile(options,self)
		return self

	def addDiagnostic severity, params
		params.severity ||= severity
		let item = new Diagnostic(self,params)
		diagnostics.push item
		return item
	
	get errors
		diagnostics.filter do $1.severity == 'error'
	
	get warnings
		diagnostics.filter do $1.severity == 'warning'

	get info
		diagnostics.filter do $1.severity == 'info'
	
	get doc
		#doc ||= new ImbaDocument(null,'imba',0,sourceCode)

	def toString
		self.js