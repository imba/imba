const fs = require 'fs'
const path = require 'path'
const crypto = require 'crypto'

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
	fs.promises.writeFile(src,body)

export def writeFile src, body
	fs.promises.writeFile(src,body)

export def readFile src, encoding = 'utf8'
	fs.promises.readFile(src, encoding)

export def exists src
	let p = fs.promises.access(src, fs.constants.F_OK)
	p.then(do yes).catch(do no)

export def rename src, pattern
	let dir = path.dirname(src)
	let ext = path.extname(src)
	let name = path.basename(src,ext)
	return path.join(dir,pattern.replace('*',name))


	let parsed = path.parse(src)
	if typeof pattern == 'string'
		if pattern[0] == '.'
			return path.join(dir,name + pattern)
			parsed.ext = pattern
		elif pattern.indexOf('')
			parsed.name = pattern
	else
		Object.assign(parsed,pattern)
	console.log 'rename',parsed
	return path.format(parsed)
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
		let src = path.resolve(cwd or '.',name or 'imbaconfig.json')
		let config = JSON.parse(fs.readFileSync(src,'utf8'))
		config.#mtime = fs.statSync(src).mtimeMs or 0
		config.#path = src
		return parseConfig(config)
	catch e
		return {}
	
export def resolvePath name, cwd = '.', cb = null
	let src = path.resolve(cwd,name)
	let dir = path.dirname(src)
	if fs.existsSync(src)
		return src
	let up = path.dirname(dir)
	up != dir ? resolvePath(name,dir) : null

export def resolveFile name,cwd,handler
	if let src = resolvePath(name,cwd)
		let file = {
			path: src
			body: fs.readFileSync(src,'utf-8')
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

		while dirname = path.dirname(dirname)
			if dirExistsCache[dirname] or fs.existsSync(dirname)
				break
			stack.push(dirname)

		while stack.length
			let dir = stack.pop!
			fs.mkdirSync(dirExistsCache[dirname] = dir)

		resolve(src)