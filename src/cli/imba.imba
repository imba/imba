
var helpers = require "../compiler/helpers"
var imbac = require "../compiler/index"

var path = require "path"
var fs = require "fs"
var package = require '../../package.json'

var parseOpts =
	alias: {h: 'help', v: 'version'}
	schema: {target: {type: 'string'}}

var help = """

Usage: imba [options] path/to/script.imba

  -h, --help             display this help message
  -v, --version          display the version number

"""

def sourcefile-for-path src
	src = path.resolve(process.cwd, src)

	if fs.statSync(src).isDirectory
		var f = path.join(src, 'index.imba')
		if fs.existsSync(f)
			src = f
		else
			return

	return src

export def run args
	var o = helpers.parseArgs(args.slice(2),parseOpts)
	var src = o:main
	src = src[0] if src isa Array

	if o:version
		return console.log package:version
	elif !o:main or o:help
		return console.log help

	src = path.resolve(process.cwd,src)
	var body = fs.readFileSync(src,'utf8')
	process:argv.shift
	process:argv[0] = 'imba'

	imbac.run(body, filename: src, target: 'node')

	

