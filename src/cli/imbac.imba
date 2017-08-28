var helpers = require "../compiler/helpers"
var compiler = require "../compiler/compiler"

var path = require "path"
var fs = require "fs"
var stdin = process:stdin
var stdout = process:stdout
var ansi = helpers:ansi
var package = require '../../package.json'

var parseOpts =
	alias:
		o: 'output'
		h: 'help'
		s: 'stdio'
		p: 'print'
		m: 'sourceMap'
		a: 'analyze'
		t: 'tokenize'
		v: 'version'
		w: 'watch'

	schema:
		output: {type: 'string'}
		target: {type: 'string'}

	group: ['source-map']


var help = """

Usage: imbac [options] path/to/script.imba

  -a, --analyze          print out the scopes and variables of your script
  -h, --help             display this help message
  -m, --source-map       generate source map and add inline to .js files
  -o, --output [dir]     set the output directory for compiled JavaScript
  -p, --print            print out the compiled JavaScript
  -s, --stdio            listen for and compile scripts over stdio
  -t, --tokenize         print out the tokens that the lexer/rewriter produce
      --target [target]  explicitly compile for node/web/webworker
  -v, --version          display the version number
  -w, --watch            recompile files on change
      --wrap             compile with top-level function wrapper

"""

def ensureDir src
	return yes if fs.existsSync(src)
	var parts = path.normalize(src).split(path:sep)
	for part,i in parts
		continue if i < 1
		# what about relative paths here? no good? might be important for symlinks etc no?
		var dir = parts.slice(0,i + 1).join(path:sep)

		if fs.existsSync(dir)
			var stat = fs.statSync(dir)
		elif part.match(/\.(imba|js)$/)
			yes
		else
			fs.mkdirSync(dir)
			console.log ansi.green("+ mkdir {dir}")
	return

def findRecursive root, pattern = /\.imba$/
	var results = []
	root = path.relative(process.cwd,root)
	root = path.normalize(root)

	var read = do |src,depth|
		src = path.normalize(src)
		var stat = fs.statSync(src)

		if stat.isDirectory and depth > 0
			var files = fs.readdirSync(src)
			read(src + '/' + file,depth - 1) for file in files

		elif src.match(pattern)
			results.push(src)

	if root.match(/\/\*\.imba$/)
		root = root.slice(0,-7)
		read(root,1)
	else
		read(root,10)

	return results

def pathToSource src,coll,o,root = null
	var abs = path.resolve(process.cwd,src)
	var stat = fs.statSync(abs)

	if stat.isDirectory
		# console.log "is directory",findRecursive(abs)
		var files = findRecursive(abs)
		pathToSource(fsrc,coll,o,abs) for fsrc in files
		return

	var file = {
		filename: path.basename(src)
		sourcePath: abs
		sourceBody: fs.readFileSync(abs,'utf8')
	}

	if o:output
		var rel = root ? path.relative(root,abs) : file:filename
		file:targetPath = path.resolve(o:output,rel)

	elif !o:print and !o:stdio
		file:targetPath = file:sourcePath

	if file:targetPath
		file:targetPath = file:targetPath.replace(/\.imba$/,'.js')

	coll.push(file)


class CLI

	prop sources

	def initialize options = {}
		@options = options
		@sources = []
		@current = null
		self

	def cwd
		process.cwd

	def run
		o:target ||= 'node'

		if o:output
			o:output = path.normalize(path.resolve(cwd,o:output))

		var paths = o:main isa String ? [o:main] : (o:main or [])
		pathToSource(src,@sources,@options) for src in paths

		if o:stdio
			o:print = yes unless o:output
			var chunks = []
			stdin.resume
			stdin.setEncoding('utf8')
			stdin.on('data') do |chunk| chunks.push(chunk)
			stdin.on('end') do
				sources.push({filename: 'stdin', sourceBody: chunks.join})
				finish
		else
			finish
		self

	def o
		@options

	def traverse cb
		for src in sources
			@current = src
			cb(src)
		return self

	def log message
		console.log(message) unless o:print
		self

	def b text
		o:colors ? ansi.bold(text) : text

	def gray text
		o:colors ? ansi.gray(text) : text

	def red text
		o:colors ? ansi.red(text) : text

	def green text
		o:colors ? ansi.green(text) : text

	def rel src
		src = src:sourcePath or src
		path.relative(process.cwd,src)

	def present data
		if o:print
			process:stdout.write(data)
		self

	def analyze
		traverse do |src|
			var o2 = Object.create(o)
			o2:filename = src:filename
			var out = compiler.analyze(src:sourceBody,o2)
			src:analysis = out
			present(JSON.stringify(out))

	def tokenize
		# should prettyprint tikens
		traverse do |src|
			var o2 = Object.create(o)
			o2:filename = src:filename
			o2:rewrite = o:rewrite
			var out = compiler.tokenize(src:sourceBody,o2)
			src:tokens = out

			var strings = for t in src:tokens
				var typ = t.@type
				var id = t.@value
				var s
				if typ == 'TERMINATOR'
					s = "[" + b(id.replace(/\n/g,"\\n")) + "]\n"

				elif typ == 'IDENTIFIER'
					s = id

				elif typ == 'NUMBER'
					s = id

				elif id == typ
					s = "[" + b(id) + "]"
				else
					s = b "[{typ} {id}]"

				if t.@loc != -1 and o:sourceMap
					s = "({t.@loc}:{t.@len})" + s # chalk.bold(s)

				s

			process:stdout.write(strings.join(' ') + '\n')

	def compile
		traverse do |src| compileFile(src)

	def compileFile src
		var opts = Object.create(o)
		opts:filename = src:filename
		var out = {}
		var t = Date.now
		var at = Date.new.toTimeString.substr(0,8)
		var srcp = path.relative(process.cwd,src:sourcePath)
		var dstp = src:targetPath and path.relative(process.cwd,src:targetPath)

		try
			out = compiler.compile(src:sourceBody,opts)
		catch e
			out = {error: e}

		out:compileTime = Date.now - t

		if o:sourceMap and out:sourcemap
			var base64 = Buffer.new(JSON.stringify(out:sourcemap)).toString("base64")
			out:js = out:js + "\n//# sourceMappingURL=data:application/json;base64," + base64

		src:output = out

		if src:targetPath and out:js !== undefined
			ensureDir(src:targetPath)
			fs.writeFileSync(src:targetPath,out:js,'utf8')
			log "{gray("{at} compile")} {srcp} {gray("to")} {dstp} {green(out:compileTime + "ms")}"

		elif out:error
			unless o:print
				log "{gray("{at} compile")} {srcp} {gray("to")} {dstp} {red(out:compileTime + "ms")}"
				if out:error:excerpt
					log "   " + out:error.excerpt(colors: o:colors)
				else
					log "   " + out:error:message
					log "   " + "in file {srcp}"
					log out:error:stack if out:error:stack

		if o:watch and !src:watcher
			var now = Date.now
			src:watcher = fs.watch(src:sourcePath) do |type,filename|
				if type == 'change'
					setTimeout(&,100) do
						fs.readFile(src:sourcePath,'utf8') do |err,body|
							if body != src:sourceBody
								src:sourceBody = body
								compileFile(src)


		if o:print and out:js
			process:stdout.write(out:js)
		self

	def finish
		try
			if o:analyze
				o:print = yes
				analyze(sources,o)
			elif o:tokenize
				o:print = yes
				tokenize(sources,o)
			else
				compile(sources,o)
		catch e
			if @current
				log "ERROR in {b rel(@current)}"
			if e:excerpt
				log e.excerpt(colors: yes)
			else
				throw e
		self


export def run
	var o = helpers.parseArgs(process:argv.slice(2),parseOpts)

	o:colors ?= yes 

	if o:version
		console.log package:version
	elif !o:main or o:help
		console.log help
	else
		CLI.new(o).run
