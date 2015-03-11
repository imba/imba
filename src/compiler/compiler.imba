
var fs = require 'fs'
var path = require 'path'
# var promise = require 'bluebird'

var lexer 	= require './lexer'
var parser	= require('./parser')['parser']

# var vm = require 'vm'
# require files needed to run imba
# whole runtime - no?

# should this really happen up here?

require '../imba/node'
require '../imba/imba'
require '../imba/core.events'

require '../imba/dom'
require '../imba/dom.server'

# setting up the actual compiler
require './ast/ast'

# Instantiate a Lexer for our use here.
var lex = lexer.Lexer.new


# The real Lexer produces a generic stream of tokens. This object provides a
# thin wrapper around it, compatible with the Jison API. We can then pass it
# directly as a "Jison lexer".

parser:lexer =
	options:
		ranges: true

	lex: do
		var token = this:tokens[this:pos++]
		var ttag

		if token
			ttag, this:yytext, this:yylloc = token

			if this:yylloc
				this:currloc = this:yylloc
			else
				this:yylloc = this:currloc
			this:yylineno = this:yylloc && this:yylloc:first_line
		else
			ttag = ''

		return ttag

	setInput: do |tokens|
		this:tokens = tokens
		this:pos = 0

	upcomingInput: do ""


parser:yy = AST # require './../nodes'


export def tokenize code, o = {}
	try
		# console.log("tokenize code",code)
		lex.tokenize code
	catch err
		console.log("ERROR1",err)


export def parse code, o
	try
		var tokens = tokenize(code)
		# console.log("Tokens",tokens)
		return parser.parse tokens
	catch err
		# console.log("ERROR",err)
		err:message = "In {o:filename}, {err:message}" if o:filename
		throw err


export def compile code, o = {}
	try
		var ast = parse(code,o)
		return ast.compile(o)
	catch err
		err:message = "In {o:filename}, {err:message}" if o:filename
		throw err


export def run code, filename: nil
	var main = require:main
	# hmmmmmm
	# hmmm -- why are we chging process:argv
	# console.log "should run!"
	main:filename = process:argv[1] = (filename ? fs.realpathSync(filename) : '.')
	main:moduleCache &&= {}


	# dir = if options.filename
	#     path.dirname fs.realpathSync options.filename
	#   else
	#     fs.realpathSync '.'
	#   mainModule.paths = require('module')._nodeModulePaths dir
	# 	# console.log "run! {filename}"
	# if process.binding('natives'):module
	# hmm -- should be local variable
	var Module = require('module').Module
	main:paths = Module._nodeModulePaths(path.dirname(filename))

	if path.extname(main:filename) != '.imba' or require:extensions
		# console.log("compile the code {main:filename}")
		main._compile compile(code, arguments[1]), main:filename
	else
		main._compile code, main:filename
	# self

if require:extensions
	require:extensions['.imba'] = do |mod, filename|
		# console.log "require with extension! {filename}"
		var content = compile(fs.readFileSync(filename, 'utf8'), filename: filename)
		mod._compile content, filename

elif require:registerExtension
	require.registerExtension '.imba' do |content|
		# console.log "in registerExtension!"
		compile content



# really?
# wrapper for files?
export class SourceFile
	
	prop path
	# prop code
	# prop tokens
	# prop ast
	prop meta
	# prop js

	def initialize path
		@path = path
		@code = nil
		@js = nil
		self

	def name
		path.split("/").pop # for testing

	# def read
	# 	@read ||= promise.new do |resolve|
	# 		# console.log "PATH IS {@path}"
	# 		@code = fs.readFileSync(@path,"utf8")#  do |err,res|
	# 		resolve(self)

	def code
		@code ||= fs.readFileSync(@path,"utf8")

	def tokens
		@tokens ||= tokenize(code)

	def ast
		@ast ||= parser.parse(tokens)
		
	def js o = {}
		@js ||= ast.compile(o)

	# def tokenize
	# 	@tokenize ||= promise.new do |resolve|
	# 		await self.read
	# 		# what about errors?
	# 		@tokens = tokenize(@code)
	# 		resolve(self)

	# def parse
	# 	@parse ||= promise.new do |resolve|
	# 		await self.tokenize
	# 		@ast = parser.parse @tokens
	# 		resolve(self)

	def write outpath, cb
		# promise.new do |resolve|
		# await self.compile
		fs.writeFile(outpath,js,cb)


	# def compile options
	# 	@compile ||= promise.new do |resolve|
	# 		# console.log "compiling file -- wait for reading"
	# 		# what about the output?
	# 		await self.parse
	# 		# console.log "will parse {@path}"
	# 		
	# 		@js = @ast.compile(options || {}) # compile(@code)
	# 		resolve(self)

	def dirty
		# console.log "marking file as dirty!"
		# simply removing all info abou tfiles
		@code = @js = @tokens = @ast = @meta = nil
		@read = @tokenize = @compile = @parse = @analyze = nil
		self

	# could analyze with different options - caching promise might not be the
	# best approach for this.
	def analyze cb
		if @meta
			cb and cb(@meta)
			return @meta

		STACK:_loglevel = 0 # not here?
		var errors = []
		var err = null
		var data = {}

		try
			@meta = ast.analyze({})
			cb and cb(@meta)
			# resolve(self.meta)
		catch e
			console.log "ERROR {e:message}"

		return @meta

			# node = (parser.parse tokens)
			# data = node.analyze(options)
		# catch e
		#     err = {message: e.message, line: e.line}
		#     if m = err.message.match(/\[(\d+)\:(\d+)\]/)
		#       err.loc = [parseInt(m[1]),parseInt(m[2])]
		#     if !err.line && m = err.message.match(/line (\d+)\b/)
		#       err.line = parseInt(m[1])
		#     data = {errors: [err]}
		#     throw e
		#     # errors.push {message: err.message, line: err.line}
		#     # return JSON.stringify({errors: [err]})
		# return JSON.stringify(data)
		
	def run
		run(code, filename: @path)



