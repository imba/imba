import chokidar from 'chokidar'
import compiler from 'compiler'
import imba1 from 'compiler1'

const esbuild = require 'esbuild'

const cluster = require 'cluster'
const fs = require 'fs'
const http = require 'http'
const path = require 'path'
const utils = require './utils'
const conf = require './config'
const helpers = require '../compiler/helpers'

import {resolveConfigFile} from '../compiler/imbaconfig'
import {Bundler} from './bundler'
import Program from './program'
import {StallerWorker} from './staller'

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

def stall
	let port = process.env.PORT

export def run options = {}
	unless cluster.isMaster
		return new StallerWorker(options)
	let t = Date.now!
	let bundles = []
	let cwd = (options.cwd ||= process.cwd!)
	if options.argv
		Object.assign(options,helpers.parseArgs(options.argv,schema))
	
	let mtime = fs.statSync(__filename).mtimeMs

	# if options.config
	options.mtime = mtime
	options.config = utils.resolveConfig(options.config or 'imbaconfig.json',cwd)
	options.package = utils.resolveFile(options.package or 'package.json',cwd) do JSON.parse($1.body)

	options.config = await conf.resolve(options.config,cwd)
	options.mtime = Math.max(mtime,options.config.#mtime or 0)
	# console.log 'found config?',options.config,options

	# if options.serve
	#	options.watch = yes
	console.log 'starting',Date.now! - t,options.mtime,options.config.#mtime
	let program = new Program(options.config,options)
	program.setup!
	return program.run!

	# if options.command == 'transpile'	
	#	return program.run!
	
	# elif options.command == 'build'
	# 	return program.run!

	let bundler = new Bundler(options.config,options)
	await bundler.setup!
	bundler.run!
	