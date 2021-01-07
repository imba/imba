import { findSourceMap, SourceMap, Module } from 'module'
import np from 'path'
import nfs from 'fs'
import {deserializeData} from '../imba/utils.imba'

const _resolveFilename = Module._resolveFilename

const cwd = process.cwd!
const manifest = deserializeData(nfs.readFileSync(process.env.IMBA_MANIFEST_PATH,'utf-8'))
const dir = process.env.IMBA_BUILD_DIR or np.dirname(process.env.IMBA_MANIFEST_PATH)
let src = np.resolve(cwd,process.env.IMBA_ENTRYPOINT)
const originalJSLoader = Module._extensions['.js']
const oldLoaders = {}
const exts = ['.imba','.js']

exts.map do(ext)
	const oldLoader = oldLoaders[ext] = Module._extensions[ext] || originalJSLoader

	Module._extensions[ext] = do(mod,filename)
		let rel = np.relative(cwd,filename)
		# destfile
		if let src = manifest.outputs[rel]
			let raw = nfs.readFileSync(np.resolve(dir,src.path),'utf-8')
			console.log "compiling",filename,raw.length
			return mod._compile(raw,filename)
		
		return oldLoader(mod,filename)

Module._resolveFilename = do(name,from)
	if name == 'imba'
		return np.resolve(process.env.IMBA_PATH,'dist','node','imba.js')

	if name == src
		console.log 'resolve from?',name,from
		return src
		# return "program.js"

	let res =  _resolveFilename.apply(Module,arguments)
	return res


# console.log 'hello!',process.env.IMBA_MANIFEST_PATH,process.env.IMBA_ENTRYPOINT,src,dir
Module._load(src, require.main, true)