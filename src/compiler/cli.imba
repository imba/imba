
var fs        = require 'fs'
var path      = require 'path'
var cli       = require 'commander'
var chalk     = require 'chalk'

var orig = cli:helpInformation
var cliproto = cli:constructor:prototype

var package = require '../../package.json'
var ERR = require './errors'

def cliproto.helpInformation
	var str = orig.call(self)

	str = str.replace(/(Options|Usage|Examples|Commands)\:/g) do |m| chalk.bold m
	return str

var compiler  = require './compiler'
var fspath = path
var T = require './token'

var parser = compiler:parser
var util = require './helpers'

# this caches an awful lot now - no need before we introduce a shared worker++
class SourceFile

	prop path
	prop meta

	def initialize path
		@path = path
		@code = null
		@js = null
		self

	def name
		path.split("/").pop # for testing

	def code
		@code ||= fs.readFileSync(@path,"utf8")

	def tokens
		@tokens ||= compiler.tokenize(code)

	def ast
		@ast ||= parser.parse(tokens)

	def js o = {}
		@js ||= ast.compile(o)

	def write outpath, cb
		# promise.new do |resolve|
		# await self.compile
		fs.writeFileSync(outpath,js)

	def dirty
		# console.log "marking file as dirty!"
		# simply removing all info abou tfiles
		@prevcode = @code
		@code = @js = @tokens = @ast = @meta = null
		@read = @tokenize = @compile = @parse = @analyze = null
		self

	# could analyze with different options - caching promise might not be the
	# best approach for this.
	def analyze o, cb
		if @meta
			cb and cb(@meta)
			return @meta

		# STACK:_loglevel = 0 # not here?
		var errors = []
		var err = null
		var data = {}

		try
			@meta = ast.analyze(loglevel: 0, entities: o:entities, scopes: yes)
			cb and cb(@meta)
			# resolve(self.meta)
		catch e
			# console.log "something wrong {e:message}"
			unless e isa ERR.ImbaParseError
				if e:lexer
					e = ERR.ImbaParseError.new(e, tokens: e:lexer:tokens, pos: e:lexer:pos)
				else
					throw e
					# e = {message: e:message}


			@meta = {warnings: [e]}
			cb and cb(@meta)

		return @meta

	def run
		process:argv.shift
		process:argv[0] = 'imba'
		compiler.run(code, filename: @path)

	def htmlify
		var out = compiler.highlight(code,filename: @path)
		fs.writeFileSync(@path.replace(/\.imba$/,'.html'),out)
		console.log "htmlify code",out
		return out



def log *pars
	console.log(*pars)

def ts
	var d = Date.new.toISOString.substr(11,8)
	chalk.dim d

def b *pars
	chalk.bold(*pars)

def dim
	chalk:dim

def puts str
	process:stdout.write str

def print str
	process:stdout.write str


def print-tokens tokens
	var strings = for t in tokens
		var typ = T.typ(t)
		var id = T.val(t)
		var s
		if typ == 'TERMINATOR'
			continue "[" + chalk.yellow(id.replace(/\n/g,"\\n")) + "]"

		if id == typ
			s = "[" + chalk.red(id) + "]"
		else
			id = chalk.white(id)
			s = chalk.grey "[{typ} {id}]"

		if t.@loc != -1
			s = "({t.@loc}:{t.@len})" + s # chalk.bold(s)
		s

	log strings.join(' ')


def isDir path
	try
		fs.statSync(path).isDirectory
	catch e
		no


def copyFile source, dest
	var data = fs.readFileSync(source,'utf-8')
	fs.writeFileSync(dest,data)

def ensure-dir path
	return yes if fs.existsSync(path)
	var parts = fspath.normalize(path).split(fspath:sep)
	for part,i in parts
		continue if i < 1
		# what about relative paths here? no good? might be important for symlinks etc no?
		var dir = parts.slice(0,i + 1).join(fspath:sep)

		if fs.existsSync(dir)
			var stat = fs.statSync(dir)
		elif part.match(/\.(imba|js)$/)
			yes
		else
			fs.mkdirSync(dir)
			log chalk.green("+ mkdir {dir}")
	return


def sourcefile-for-path path
	path = fspath.resolve(process.cwd, path)
	SourceFile.new(path)

def printCompilerError e, source: null, tok: null, tokens: null
	#  return printError(e,source: source)

	var lex = e:lexer

	tok ||= lex and lex:yytext
	tokens ||= lex and lex:tokens

	var src    = source and source.code
	var locmap = util.locationToLineColMap(src)
	var lines  = src and src.split(/\n/g)

	var ln0, ln1, gutter


	var lnum = do |l, color = 'grey'|
		var s = String(l + 1)
		if s:length < String(ln1)[:length]
			s = ' ' + s
		# while s:length < String(ln1)
			
		return dim[color]('    ' + s + ' |  ')


	def printLn nr, errtok
		var pos = lex and lex:pos or 0
		var ln = lines[nr]
		var prefix = lnum(nr,errtok ? 'red' : 'grey')

		return log(prefix) unless ln

		# log lnum(nr)

		var colors = {
			NUMBER: chalk:blue
			STRING: chalk:green
			KEYWORD: chalk:gray
			PUNCTUATION: chalk:white
			IDENTIFIER: chalk:bold
			ERR: chalk:bold:red:underline
		}

		# first get the pos up to the wanted line
		while var tok = tokens[++pos]
			var tloc = locmap[tok.@loc]
			break if tloc and tloc[0] > nr

		while var tok = tokens[--pos]
			continue if tok.@loc == -1 # generated

			var typ = tok.@type
			var loc = locmap[tok.@loc]
			var col = loc and loc[1] or 0
			var len = tok.@len or tok.@value:length
			var l = loc[0]

			continue if l > nr
			break if l < nr

			typ = 'KEYWORD' if typ:length > 1 and typ == tok.@value.toUpperCase
			typ = 'PUNCTUATION' if typ.match(/^[\[\]\{\}\(\)\,]/)

			if tok == errtok
				typ = 'ERR'

			if var fmt = colors[typ]
				ln = ln.substr(0,col) + fmt(ln.substr(col,len)) + ln.slice(col + len)

		log prefix + ln

		return

	log "    " + chalk.red(e:message.split('\n').shift)  # + character + c2

	if tok and src
		log(chalk.grey("    ") + "------------------------------------")

		# find the closest non-generated token to show error
		var tpos = tokens.indexOf(tok)
		while tok and tok.@loc == -1
			tok = tokens[--tpos]

		var lc = locmap[tok.@loc] or [0,0]
		var ln = lc[0]
		var col = lc[1]

		ln0 = Math.max(0,ln - 3)
		ln1 = ln0 + 4
		gutter = ("" + ln1)['length']

		for i in [0 ... 5]
			let n = ln0 + i
			printLn(n,n == ln ? tok : null)

		log(chalk.grey("    ") + "------------------------------------")
		log('')
	return



def write-file source, outpath, options = {}
	ensure-dir(outpath)
	# var outpath = source.path.replace(/\.imba$/,'.js')
	# destpath = destpath.replace(basedir,outdir)
	return unless source.dirty

	var srcp = fspath.relative(process.cwd,source.path)
	var outp = fspath.relative(process.cwd,outpath)

	var str = ts + " " + chalk.dim("compile ") + srcp + chalk.dim(" to ") + outp

	print str

	options:filename ||= source.path
	options:sourcePath = source.path
	options:targetPath = outpath

	if options:sourceMapInline
		options:sourceMap ||= {}
		options:sourceMap:inline = yes

	# if options:standalone
	# 	options:hasRuntime = no

	try
		var start = Date.now
		var code = compiler.compile(source.code, options)
		var time = Date.now - start
		var ok = true
		print " " + chalk:bold.green("✔ ") + chalk:dim.grey("{time}ms") + "\n"

		if code:warnings
			for warn,i in code:warnings
				# print String(warn:token)
				if warn:type == 'error'
					ok = false
					printCompilerError(warn, source: source, tok: warn:token, tokens: code:options.@tokens)
				else
					print chalk.yellow "    {b 'warning'}: {warn:message}"

		if ok
			fs.writeFileSync(outpath,code:js or code)

	catch e
		let toks = options.@tokens
		print " " + chalk:bold.red("✘") + "\n"

		if e isa ERR.ImbaParseError
			let tok = try e.start catch e null
			printCompilerError(e, source: source, tok: tok, tokens: toks) # e:message + "\n"
		else
			print " - " + e:message + "\n"

	return

# shared action for compile and watch
def cli-compile root, o, watch: no

	var base = fspath.resolve(process.cwd, root)
	var basedir = base
	var exists  = fs.existsSync(base)
	var stat    = fs.statSync(base)
	var isFile  = no

	if stat.isDirectory
		log "dirname {fspath.dirname(base)} {base}"
		# base += fspath:sep unless fspath.dirname(base) == base
		log chalk.magenta "--- watch dir: {b base}" if watch
	else
		isFile = yes
		basedir = fspath.dirname(base)
		log chalk.magenta "--- watch file: {b base}" if watch

	var out  = o:output ? fspath.resolve(process.cwd, o:output) : basedir
	var outdir = out

	unless o:output
		let sep = fspath:sep
		let idx = (basedir + sep).lastIndexOf(sep + 'src' + sep)

		if idx >= 1
			let replace = sep + 'lib'
			let pre = basedir.substr(0,idx)
			let rest = basedir.substr( idx + replace['length'] )
			let dest = pre + replace + rest

			if fs.existsSync(pre + replace)
				outdir = out = dest
			else
				print "{chalk.dim '--- warn:'} {pre + (chalk.bold replace) + rest} "
				log chalk.dim "not found - compiling to /src"

	# compiling a single file - no need to require chokidar at all
	if isFile and !watch
		var source = sourcefileForPath(base)
		var destpath = source.path.replace(/\.imba$/,'.js').replace(basedir,outdir)
		write-file(source,destpath,o)
		return

	log chalk.blue "--- write dir: {b out}"

	var sources = {}

	# it is bad practice to require modules inside methods, but chokidar takes
	# some time to load, and we really dont want that for single-file compiles
	var chokidar = require 'chokidar'
	var watcher = chokidar.watch(base, ignored: /[\/\\]\./, persistent: watch)

	watcher.on('all') do |event,path|
		# need to fix on remove as well!
		# log "watcher {event} {path}"
		if path.match(/\.imba$/) and (event == 'add' or event == 'change')
			var realpath = fspath.resolve(process.cwd, path)
			var source = sources[realpath] ||= sourcefileForPath(realpath)
			var destpath = source.path.replace(/\.imba$/,'.js')
			destpath = destpath.replace(basedir,outdir)
			# should supply the dir
			# log "write file {destpath}"
			write-file(source,destpath,o)
	return

cli.version(package:version)

cli.command('* <path>')
	.description('run imba')
	.usage('<path>')
	.action do |path,o|
		var file = sourcefile-for-path(path)
		file.run


cli.command('compile <path>')
	.description('compile scripts')
	.option('-m, --source-map-inline', 'Embed inline sourcemap in compiled JavaScript')
	.option('-s, --standalone', 'Embed utils from Imba runtime')
	.option('-o, --output [dest]', 'set the output directory for compiled JavaScript')
	.action do |path,o| cli-compile path, o, watch: no

cli.command('watch <path>')
	.description('listen for changes and compile scripts')
	.option('-m, --source-map-inline', 'Embed inline sourcemap in compiled JavaScript')
	.option('-s, --standalone', 'Embed utils from Imba runtime')
	.option('-o, --output [dest]', 'set the output directory for compiled JavaScript')
	.action do |root,o| cli-compile(root,o,watch: yes)

cli.command('analyze <path>')
	.description('get information about scopes, variables and more')
	.option('-t, --tokens', 'print the raw tokens')
	.option('-e, --entities', 'print the raw tokens')
	.action do |path, opts|
		var file = sourcefile-for-path(path)

		if opts:tokens
			# log "tokens"
			print-tokens(file.tokens)
		else
			file.analyze(opts) do |meta|
				log JSON.stringify(meta,null,4)

cli.command('export-runtime <path>')
	.description('export the imba.js runtime to <path>')
	.option('-m, --min', 'minified version')
	.action do |path, opts|
		var filename = (opts:min ? 'imba.min.js' : 'imba.js')
		var rel = '../browser/' + filename
		var lib = fspath.resolve(__dirname,rel)
		var out = fspath.resolve(process.cwd,path)

		if isDir(out)
			var dir = fspath.resolve(out,filename)
			log "write runtime to {b dir}"
			copyFile(lib,dir)
		elif out.match(/\.js$/)
			log "write runtime to {b out}"
			copyFile(lib,out)
		else
			log chalk.red("{b out} is not a directory")

		return


export def run argv
	if process:argv:length < 3
		return cli.outputHelp
	elif process:argv:length == 3 and process:argv[2] == '-v'
		return log package:version

	cli.parse(argv)
