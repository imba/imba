import chokidar from 'chokidar'
import compiler from 'compiler'
import imba1 from 'compiler1'

const fs = require 'fs'
const path = require 'path'
const helpers = require '../compiler/helpers'

import {resolveConfigFile} from '../compiler/imbaconfig'
import {Bundler} from './bundler'

const schema = {
	alias: {
		o: 'outfile',
		h: 'help',
		s: 'stdio',
		p: 'print',
		m: 'sourceMap',
		t: 'tokenize',
		v: 'version',
		w: 'watch',
		d: 'debug'
	},
	
	schema: {
		infile: {type: 'string'},
		outfile: {type: 'string'},
		platform: {type: 'string'}, # node | browser | worker
		styles: {type: 'string'}, # extern | inline
		imbaPath: {type: 'string'}, # global | inline | import
		format: {type: 'string'}, # cjs | esm
	},
	
	group: ['source-map']
}

export def run options = {}
	let bundles = []
	let cwd = (options.cwd ||= process.cwd!)
	if options.argv
		Object.assign(options,helpers.parseArgs(options.argv,schema))

	if options.serve
		options.watch = yes
	
	let config = options.config or resolveConfigFile(cwd,path: path, fs: fs)
	let bundler = new Bundler(config,options)
	await bundler.setup!
	bundler.run!