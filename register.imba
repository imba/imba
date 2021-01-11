import np from 'path'
import nfs from 'fs'

import { findSourceMap, SourceMap, Module } from 'module'
import {deserializeData} from './src/imba/utils.imba'

const _resolveFilename = Module._resolveFilename

const cwd = process.cwd!

let manifest = null

if process.env.IMBA_MANIFEST_PATH
	manifest = deserializeData(nfs.readFileSync(process.env.IMBA_MANIFEST_PATH,'utf-8'))
	manifest.outdir = np.dirname(process.env.IMBA_MANIFEST_PATH)

const originalJSLoader = Module._extensions['.js']
const oldLoaders = {}

const exts = ['.imba','.js','.ts']

manifest && exts.map do(ext)
	const oldLoader = oldLoaders[ext] = Module._extensions[ext] || originalJSLoader
	Module._extensions[ext] = do(mod,filename)
		let rel = np.relative(cwd,filename)

		if let input = manifest.inputs.node[rel]
			rel = input.js.path

		if let src = manifest.outputs[rel]
			let raw = nfs.readFileSync(np.resolve(manifest.outdir,src.path),'utf-8')
			return mod._compile(raw,filename)
		
		return oldLoader(mod,filename)

Module._resolveFilename = do(name,from)
	if name == 'imba'
		return np.resolve(__dirname,'dist','node','imba.js')

	let res =  _resolveFilename.apply(Module,arguments)
	return res

console.log "loading register", process.env.IMBA_MANIFEST_PATH