var cli       = require 'commander'
var fs        = require 'fs'
var path      = require 'path'
var chalk     = require 'chalk'

var tasks = require './tasks'
var compiler  = require './compiler'

var fspath = path

var T = require './token'

var parser = compiler:parser


# really?
# wrapper for files?
class SourceFile
	
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
		fs.writeFile(outpath,js,cb)

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
		
	def run
		compiler.run(code, filename: @path)


def log *pars
	console.log(*pars)

def ts
	var d = Date.new.toISOString.substr(11,8)
	chalk.dim d

def b *pars
	chalk.bold(*pars)
	

def print-tokens tokens
	var strings = for t in tokens
		var typ = T.typ(t)
		var id = T.val(t)

		if typ == 'TERMINATOR'
			continue "[" + chalk.yellow(id.replace(/\n/g,"\\n")) + "]"

		if id == typ
			"[" + chalk.red(id) + "]"
		else
			id = chalk.white(id)
			chalk.grey "[{typ} {id}]"

	log strings.join(' ')


def ensure-dir path
	return yes if fs.existsSync(path)
	var parts = path.split(fspath:sep)
	for part,i in parts
		# what about relative paths here? no good? might be important for symlinks etc no?
		var path = fspath:sep + fspath.join(*parts.slice(0,i + 1))
		if fs.existsSync(path)
			var stat = fs.statSync(path)
		elif part.match(/\.(imba|js)$/)
			yes
		else
			fs.mkdirSync(path)
			log chalk.green("+ mkdir {path}")
	return


def sourcefile-for-path path
	path = fspath.resolve(process.cwd, path)
	SourceFile.new(path)

def write-file source, outpath
	ensure-dir(outpath)
	# var outpath = source.path.replace(/\.imba$/,'.js')
	# destpath = destpath.replace(basedir,outdir)
	source.dirty

	var srcp = fspath.relative(process.cwd,source.path)
	var outp = fspath.relative(process.cwd,outpath)

	log ts, chalk:dim.grey "compile {b chalk.white srcp} to {b chalk.white outp}"

	# log "made dirty"
	# log ts, chalk:dim.grey "will compile {source.path}"
	source.write(outpath) do |err,res|
		true
		# var srcp = fspath.relative(process.cwd,source.path)
		# var outp = fspath.relative(process.cwd,outpath)
		# log ts, chalk:dim.grey "compiled {b chalk.white srcp} to {b chalk.white outp}"


# shared action for compile and watch
def cli-compile root, o, watch: no
	var chokidar  = require 'chokidar'

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

	# what if it does not exist
	# log "stat",stat

	var dirs = basedir.split(fspath:sep)
	var out  = o:output ? fspath.resolve(process.cwd, o:output) : basedir
	var outdir = out

	unless o:output
		var srcIndex = dirs.indexOf('src')
		if srcIndex >= 0
			dirs[srcIndex] = 'lib'
			var libPath = fspath:sep + fspath.join(*dirs)
			# absolute paths here?
			var libExists = fs.existsSync(libPath)
			outdir = out = libPath
			log chalk.blue "--- found dir: {b libPath}" if watch
	
	log chalk.blue "--- write dir: {b out}"
	# log chalk:bold.blue "--- write dir: {out}"
	# want to respect the output-place
	var sources = {}

	var watcher = chokidar.watch(base, ignored: /[\/\\]\./, persistent: watch)

	watcher.on('all') do |event,path|
		# need to fix on remove as well!
		# log "watcher {event} {path}"
		if path.match(/\.imba$/) and (event == 'add' or event == 'change')
			var realpath = fspath.resolve(process.cwd, path)
			var source = sources[realpath] ||= sourcefile-for-path(realpath)
			var destpath = source.path.replace(/\.imba$/,'.js')
			destpath = destpath.replace(basedir,outdir)
			# should supply the dir
			# log "write file {destpath}"
			write-file(source,destpath)
	self

	
cli
	.version('0.7.2')
	.option('--join [FILE]',    'concatenate the source Imba before compiling')
	.option('-v, --version',	'display the version number')

cli.command('* <path>')
	.usage('<path>')
	.description('run imba')
	.action do |path,o|
		# should run directly without promises and all that stuff
		var file = sourcefile-for-path(path)
		file.run


cli.command('compile <path>')
	.description('compile scripts')
	.option('-o, --output [dest]', 'set the output directory for compiled JavaScript')
	.action do |path,o| cli-compile path, o, watch: no

cli.command('watch <path>')
	.description('listen for changes and compile scripts')
	.option('-o, --output [dest]', 'set the output directory for compiled JavaScript')
	.action do |root,o| cli-compile(root,o,watch: yes)

# .option('--poll', 'useful for successfully watching files over a network')

cli.command('analyze <path>')
	.description('get information about scopes, variables and more')
	.option('-v, --verbose', 'return detailed output')
	.option('-t, --tokens', 'return detailed output')
	.action do |path, opts|
		var file = sourcefile-for-path(path)

		if opts:tokens
			# log "tokens"
			print-tokens(file.tokens)
		else
			file.analyze do |meta|
				log JSON.stringify(meta)

# .option('-f, --format <format>', 'format of output', 'json', /^(json|plain|html)$/i)	

cli.command('dev <task>')
	.description('commands for imba-development')
	.action do |cmd,o|
		if tasks[cmd] isa Function
			tasks[cmd](o)
		else
			log chalk.red("could not find task {b cmd}")

# .option('--poll', 'useful for successfully watching files over a network')



export def run argv
	var res = cli.parse(argv)
	# console.log(cli.name)
	# console.log res.name
	# console.log "herel"

