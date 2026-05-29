# imba$stdlib=1
import { computeLineOffsets } from '../program/utils'
import { Position, Range, Diagnostic,DiagnosticSeverity } from '../program/structures'

import path from 'path'
import {SourceMapper} from './sourcemapper'
const STEPS =
	TOKENIZE: 1
	REWRITE: 2
	PARSE: 4
	TRAVERSE: 8
	COMPILE: 16

###
Should eventually take over for the Stack / options mess in nodes.mjs
###

const weakCache = new WeakMap

export class CompilationResult

export class Compilation

	# lexer, rewriter and parser are
	# currently set on prototype in compiler.mjs

	static prop current

	static def error opts do current..addDiagnostic('error',opts)
	static def warn opts do current..addDiagnostic('warning',opts)
	static def info opts do current..addDiagnostic('info',opts)

	static def deserialize data, o = {}
		let item = new Compilation("",o)
		item.deserialize(data)

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

	# should move these to separate CompilationResult?
	def deserialize input
		let val
		try
			val = JSON.parse(input)
		catch e
			console.log 'failed',input,options
			throw e
		self.rawResult = val
		self.deserialized = val
		self

	def serialize
		if self.rawResult
			JSON.stringify(self.rawResult,null,2)

	def tokenize
		if flags |=? STEPS.TOKENIZE
			try
				Compilation.current = self
				lexer.reset!
				tokens = lexer.tokenize(sourceCode,options,self)
				tokens = rewriter.rewrite(tokens,options,self)
			catch e
				yes
		return tokens

	def parse
		tokenize!
		if flags |=? STEPS.PARSE
			if !errored?
				Compilation.current = self
				try
					ast = parser.parse(tokens,self)
		self

	def compile
		parse!
		if flags |=? STEPS.COMPILE
			if !errored?
				Compilation.current = self
				result = ast.compile(options,self)
			raiseErrors! if options.raiseErrors
		self

	def recompile o = {}
		# cache
		if deserialized
			let js = deserialized.js
			let res = {}
			res.js = SourceMapper.run(js,o)
			res.css = SourceMapper.run(deserialized.css or "",o)

			if o.styles == 'import' and res.css.code
				res.js.code += "\nimport './{path.basename(sourcePath)}.css'"
			return res

		return {js: self.js}

	def addDiagnostic severity, params
		params.severity ||= severity
		let item = new Diagnostic(params,self)
		diagnostics.push item
		return item

	get tsc
		options.tsc or options.platform === 'tsc'

	get errored?
		errors.length > 0

	get errors
		diagnostics.filter do $1.severity == DiagnosticSeverity.Error

	get warnings
		diagnostics.filter do $1.severity == DiagnosticSeverity.Warning

	get info
		diagnostics.filter do $1.severity == DiagnosticSeverity.Information

	get doc
		self

	get lineOffsets
		#lineOffsets ||= computeLineOffsets(sourceCode,yes,0)

	def getLineText line
		let start = lineOffsets[line]
		let end = lineOffsets[line + 1]
		sourceCode.substring(start,end).replace(/[\r\n]/g,'')

	def positionAt offset
		return offset if offset isa Position

		if typeof offset == 'object'
			offset = offset.offset

		offset = Math.max(Math.min(offset,sourceCode.length),0)
		let offsets = lineOffsets
		let low = 0
		let high = offsets.length
		if high === 0
			return new Position(0,offset,offset)
		while low < high
			let mid = Math.floor((low + high) / 2)
			if offsets[mid] > offset
				high = mid
			else
				low = mid + 1
		let line = low - 1
		new Position(line,offset - offsets[line],offset)

	def offsetAt position
		return position.offset if position.offset !== undefined

		let offsets = lineOffsets
		if position.line >= offsets.length
			return sourceCode.length
		elif position.line < 0
			return 0

		let lineOffset = offsets[position.line]
		let nextLineOffset = (position.line + 1 < offsets.length) ? offsets[position.line + 1] : sourceCode.length
		return position.offset = Math.max(Math.min(lineOffset + position.character,nextLineOffset),lineOffset)

	def rangeAt a,b
		new Range(positionAt(a),positionAt(b))

	def toString
		self.js

	def raiseErrors
		if errors.length
			throw errors[0].toError!
		return self
