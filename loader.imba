import np from 'path'
import nfs from 'fs'

import { findSourceMap, SourceMap, Module } from 'module'
import {Manifest} from './src/imba/manifest.imba'

const {_resolveFilename} = Module

const cwd = process.cwd!

let manifest = null
# console.log "GOT HERE!",process.cwd!

def resolveVirtual path, output, realpath
	let ext = np.extname(path)
	let name = np.basename(path)
	let sup = Module._extensions[ext]
	
	Module._extensions[ext] = do(mod,filename)
		Module._extensions[ext] = sup
		# if sup
		# 	Module._extensions[ext] = sup
		# else
		# 	delete Module._extensions
		let body = output.readSync!
		let find = "//# sourceMappingURL={output.name}.map"
		let replace = "//# sourceMappingURL={realpath}.map"
		body = body.replace(find,replace)
		# console.log name,realpath,body
		return mod._compile(body,filename)
	return path

Module._resolveFilename = do(name,from)
	unless require.main
		if nfs.existsSync(name + '.manifest')
			manifest = global.#manifest = new Manifest(path: name + '.manifest')
			let output = manifest.main # outputs[np.basename(name)]
			if manifest.main
				let path = output.source.absPath
				resolveVirtual(path,output,name)
				return path

	let res =  _resolveFilename.apply(Module,arguments)
	return res