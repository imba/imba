var helpers = require "../compiler/helpers"
var compiler = require "../compiler/compiler"

var path = require "path"
var fs = require "fs"
var stdin = process:stdin
var stdout = process:stdout

var parseOpts =
	alias:
		o: 'output'
		s: 'stdio'
		b: 'bare'
		p: 'print'
		A: 'analyze'
		T: 'tokenize'

	schema:
		output: {type: 'string'}

	group: ['source-map']

var curr

def log text,o
	console.log text

def present data, o
	if o:print
		process:stdout.write(data)

	self

def analyze sources, o
	for src in sources
		var o2 = Object.create(o)
		o2:filename = src:filename
		var out = compiler.analyze(src:sourceBody,o2)
		src:analysis = out
		present(JSON.stringify(out),o)

	return sources

def tokenize sources, o
	# should prettyprint tikens
	for src in sources
		var o2 = Object.create(o)
		o2:filename = src:filename
		var out = compiler.tokenize(src:sourceBody,o2)
		src:tokens = out
		present(JSON.stringify(out),o)

	return sources

def compile sources, o
	for src in sources
		curr = src
		var o2 = Object.create(o)
		o2:filename = src:filename
		var out = compiler.compile(src:sourceBody,o2)
		src:output = out
		# add sourcemaps here?

		if src:targetPath
			fs.writeFileSync(src:targetPath,out:js,'utf8')

		present(out:js,o)


def handle sources, o
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
		if curr
			console.log curr:sourcePath
		console.log e.excerpt(ansi: yes)
		# throw e
	self



export def run args
	var o = helpers.parseArgs(args,parseOpts)
	var cwd = process.cwd

	if o:output
		o:output = path.normalize(path.resolve(cwd,o:output))

	# single file or splat
	var paths = o:main isa String ? [o:main] : (o:main or [])

	# read through the files
	var sources = for src in paths
		# var sourcePath = path.resolve(cwd,src)
		# var sourceBody = fs.readFileSync(sourcePath,'utf8')
		var abs = path.resolve(cwd,src)
		var file = {
			filename: src.split('/').pop
			sourcePath: abs
			sourceBody: fs.readFileSync(abs,'utf8')
		}

		if o:output
			file:targetPath = path.resolve(o:output,src)
			# console.log file:targetPath
		elif !o:print and !o:stdio
			file:targetPath = file:sourcePath.replace(/\.imba$/,'.js')
			# console.log file:targetPath

		file


	# what about the lib/src convension?
	if o:stdio
		# output to stdout by default unless output is defined
		o:print = yes unless o:output

		var chunks = []
		stdin.resume
		stdin.setEncoding('utf8')
		stdin.on('data') do |chunk| chunks.push(chunk)
		stdin.on('end') do
			sources.push({filename: 'stdin', sourceBody: chunks.join})
			handle(sources,o)
	else
		handle(sources,o)

