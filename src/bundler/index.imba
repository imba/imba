const esbuild = require 'esbuild'

const fs = require 'fs'
const np = require 'path'
const utils = require './utils'
const conf = require './config'
const helpers = require '../compiler/helpers'

import Program from './program'

const schema = {
	alias: {
		o: 'outfile',
		h: 'help',
		c: 'config',
		m: 'sourceMap',
		v: 'version',
		w: 'watch',
		d: 'debug',
		f: 'force'
	},
	
	schema: {
		infile: {type: 'string'},
		config: {type: 'string'},
		port: {type: 'number'},
		force: {},
		outfile: {type: 'string'},
		outdir: {type: 'string'},
		platform: {type: 'string'}, # node | browser | worker
		styles: {type: 'string'}, # extern | inline
		imbaPath: {type: 'string'}, # global | inline | import
		format: {type: 'string'}, # cjs | esm
	},
	
	group: ['source-map']
}

export def run options = {}
	let t = Date.now!
	let bundles = []
	let cwd = (options.cwd ||= process.cwd!)
	if options.argv
		Object.assign(options,helpers.parseArgs(options.argv,schema))
	
	let mtime = fs.statSync(__filename).mtimeMs

	options.imbaPath ||= np.resolve(__dirname,'..')

	options.mtime = mtime
	options.config = utils.resolveConfig(options.config or 'imbaconfig.json',cwd)
	options.package = utils.resolveFile(options.package or 'package.json',cwd) do JSON.parse($1.body)

	options.config = await conf.resolve(options.config,cwd)
	options.mtime = Math.max(mtime,options.config.#mtime or 0)

	let program = new Program(options.config,options)
	program.setup!
	return program.run!