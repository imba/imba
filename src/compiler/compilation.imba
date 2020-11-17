# warning
# error
# info

import { ImbaDocument } from '../program/document'
import { Position, Range, Diagnostic } from '../program/structures'

const STEPS =
	TOKENIZE: 1
	REWRITE: 2
	PARSE: 4
	TRAVERSE: 8
	COMPILE: 16

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
		self.diagnostics = []
		self.tokens = null
		self.ast = null
		

	def tokenize
		if flags |=? STEPS.TOKENIZE
			Compilation.current = self
			try
				lexer.reset!
				tokens = lexer.tokenize(sourceCode,options,self)
				tokens = rewriter.rewrite(tokens,options,self)
			catch e
				yes
		self

	def parse
		tokenize!
		if flags |=? STEPS.PARSE
			if !errored?
				ast = parser.parse(tokens,self)
		self

	def compile
		Compilation.current = self
		parse!
		if flags |=? STEPS.COMPILE
			if !errored?
				result = ast.compile(options,self)
			raiseErrors! if options.raiseErrors
		self

	def addDiagnostic severity, params
		params.severity ||= severity
		let item = new Diagnostic(params,self)
		diagnostics.push item
		return item
	
	get errored?
		errors.length > 0
	
	get errors
		diagnostics.filter do $1.severity == 'error'
	
	get warnings
		diagnostics.filter do $1.severity == 'warning'

	get info
		diagnostics.filter do $1.severity == 'info'
	
	get doc
		#doc ||= new ImbaDocument(null,'imba',0,sourceCode)

	def positionAt offset
		doc.positionAt(offset)
	
	def offsetAt position
		doc.offsetAt(position)
	
	def rangeAt a,b
		doc.rangeAt(a,b)

	def toString
		self.js

	def raiseErrors
		if errors.length
			throw errors[0].toError!
		return self		