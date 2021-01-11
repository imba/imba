import nfs from 'fs'
import np from 'path'
import crypto from 'crypto'
import os from 'os'

import * as flatted from 'flatted'
import {resolve as parseConfig} from './config'

export const defaultLoaders = {
	".png": "file",
	".svg": "file",
	".woff2": "file",
	".woff": "file",
	".ttf": "file",
	".otf": "file"
}

export def getCacheDir options
	# or just the directory of this binary?
	let dir = process.env.IMBA_CACHEDIR or np.resolve(__dirname,'..','.imba-cache')  # np.resolve(os.homedir!,'.imba')
	unless nfs.existsSync(dir)
		console.log 'cache dir does not exist - create',dir
		nfs.mkdirSync(dir)
	return dir

export def diagnosticToESB item, add = {}
	# {"id":"bs","warnings":[],"errors":[{"range":{"start":{"line":3,"character":9,"offset":41},"end":{"line":3,"character":9,"offset":41}},"severity":1,"source":"imba-parser","message":"Unexpected 'TERMINATOR'"}],"js":"","css":""}
	{
		text: item.message
		location: Object.assign({
			line: item.range.start.line + 1
			column: item.range.start.character
			length: item.range.end.offset - item.range.start.offset
			lineText: item.lineText
		},add)
	}

export def writePath src, body
	await ensureDir(src)
	nfs.promises.writeFile(src,body)

export def writeFile src, body
	nfs.promises.writeFile(src,body)

export def readFile src, encoding = 'utf8'
	nfs.promises.readFile(src, encoding)

export def exists src
	let p = nfs.promises.access(src, nfs.constants.F_OK)
	p.then(do yes).catch(do no)

export def rename src, pattern
	let dir = np.dirname(src)
	let ext = np.extname(src)
	let name = np.basename(src,ext)
	return np.join(dir,pattern.replace('*',name))


	let parsed = np.parse(src)
	if typeof pattern == 'string'
		if pattern[0] == '.'
			return np.join(dir,name + pattern)
			parsed.ext = pattern
		elif pattern.indexOf('')
			parsed.name = pattern
	else
		Object.assign(parsed,pattern)
	console.log 'rename',parsed
	return np.format(parsed)
	# let basedir = path.dirname(src)
	# let ext = path.exxtname

# find, remove and return item from array
export def pluck array, cb
	for item,i in array
		if cb(item)
			array.splice(i,1)
			return item
	return null

export def resolveConfig cwd, name
	try
		let src = np.resolve(cwd or '.',name or 'imbaconfig.json')
		let config = JSON.parse(nfs.readFileSync(src,'utf8'))
		config.#mtime = nfs.statSync(src).mtimeMs or 0
		config.#path = src
		return parseConfig(config)
	catch e
		return parseConfig({})
	
export def resolvePath name, cwd = '.', cb = null
	# console.log 'resolve path',name,cwd
	let src = np.resolve(cwd,name)
	let dir = np.dirname(src)
	if nfs.existsSync(src)
		return src
	let up = np.dirname(dir)
	# console.log 'reresolve',up,dir
	up != dir ? resolvePath(name,up) : null

export def resolveFile name,cwd,handler
	if let src = resolvePath(name,cwd)
		let file = {
			path: src
			body: nfs.readFileSync(src,'utf-8')
		}
		return handler(file)
	return null

export def resolvePackage cwd
	resolveFile('package.json',cwd) do JSON.parse($1.body)

# generates a function that converts integers to a short
# alphanumeric string utilizing the supplied alphabet
export def idGenerator alphabet = 'abcdefghijklmnopqrstuvwxyz'
	let remap = {}
	for k in [0 ... (alphabet.length)]
		remap[k.toString(alphabet.length)] = alphabet[k]
	return do(num)
		num.toString(alphabet.length).split("").map(do remap[$1]).join("")

export def createHash body
	crypto.createHash('sha1').update(body).digest('base64').replace(/[\=\+\/]/g,'').slice(0,8).toUpperCase!

export def serializeData data
	flatted.stringify(data)

export def deserializeData data
	flatted.parse(data)
	

const dirExistsCache = {}

export def ensureDir src
	let stack = []
	let dirname = src
	
	new Promise do(resolve)

		while dirname = np.dirname(dirname)
			if dirExistsCache[dirname] or nfs.existsSync(dirname)
				break
			stack.push(dirname)

		while stack.length
			let dir = stack.pop!
			nfs.mkdirSync(dirExistsCache[dirname] = dir)

		resolve(src)