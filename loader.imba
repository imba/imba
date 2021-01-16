import np from 'path'
import nfs from 'fs'

import { findSourceMap, SourceMap, Module } from 'module'
import {Manifest} from './src/imba/manifest.imba'
const {_resolveFilename} = Module

let manifest = null

def resolveVirtual path, output, realpath
	let ext = np.extname(path)
	let name = np.basename(path)
	let sup = Module._extensions[ext]
	
	Module._extensions[ext] = do(mod,filename)
		Module._extensions[ext] = sup

		let body = output.readSync!
		let find = "//# sourceMappingURL={output.name}.map"
		let replace = "//# sourceMappingURL={realpath}.map"
		body = body.replace(find,replace)
		return mod._compile(body,filename)
	return path

Module._resolveFilename = do(name,from)
	unless manifest
		if nfs.existsSync(name + '.manifest')
			manifest = global.#manifest = new Manifest(path: name + '.manifest')
			let output = manifest.main
			if output
				let path = output.source.absPath
				resolveVirtual(path,output,name)
				return path

	let res =  _resolveFilename.apply(Module,arguments)
	return res

# when this file is loaded as the main entry - look for
# a sibling file without the .loader.js suffix and require
# that after setting up the require hooks.
if require.main == module
	let main = __filename.replace('.loader.js','.js')
	require(main) if main != __filename
		
		

	