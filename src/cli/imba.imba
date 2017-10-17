
var helpers = require "../compiler/helpers"
var imbac = require "../compiler/index"

var path = require "path"
var fs = require "fs"
var package = require '../../package.json'

var parseOpts =
	alias: {h: 'help', v: 'version',e: 'eval'}
	schema: {eval: {type: 'string'}}

var help = """

Usage: imba [options] [ -e script | script.imba ] [arguments]

  -e, --eval script      evaluate script
  -h, --help             display this help message
  -v, --version          display the version number

"""

def lookup src
	src = path.resolve(process.cwd, src)

	if fs.statSync(src).isDirectory
		var f = path.join(src, 'index.imba')
		if fs.existsSync(f)
			src = f
		else
			return

	return src

export def run
	var args = process:argv
	var o = helpers.parseArgs(args.slice(2),parseOpts)
	var src = o:main
	src = src[0] if src isa Array

	process:argv.shift
	process:argv[0] = 'imba'

	if o:version
		return console.log package:version

	elif (!o:main and !o:eval) or o:help
		return console.log help

	if o:eval
		return imbac.run(o:eval, target: 'node')

	src = lookup(src)
	src = path.resolve(process.cwd,src)
	var body = fs.readFileSync(src,'utf8')
	imbac.run(body, filename: src, sourcePath: src, target: 'node')

	

