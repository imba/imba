const fs = require 'fs'
const path = require 'path'
const readdirp = require 'readdirp'
const crypto = require 'crypto'

export const defaultLoaders = {
	".png": "file",
	".svg": "file",
	".woff2": "file",
	".woff": "file",
	".ttf": "file",
	".otf": "file"
}

const readdirpOptions = {
	depth: 5
	fileFilter: ['*.imba','*.imba.mjs']
	directoryFilter: ['!.git', '!*modules','!tmp']
}

export def mount dir,cwd = '.'
	
	{
		cwd: path.resolve(cwd,dir)
		toString: do this.cwd
		valueOf: do this.cwd
		resolve: do(src) path.resolve(this.cwd,src)
		relative: do(src) path.relative(this.cwd,src)
		writePath: do(src,body) writePath(this.resolve(src),body)
		writeFile: do(src,body) fs.promises.writeFile(this.resolve(src),body)
		unlink: do(src,body) fs.promises.unlink(this.resolve(src))
		readFile: do(src,enc='utf8') fs.promises.readFile(this.resolve(src),enc)
		findFiles: do(options = {})
			let res = await readdirp.promise(this.cwd,Object.assign({},readdirpOptions,options))
			res.map do $1.path
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

export def resolveConfig name, cwd = '.'
	try
		let src = path.resolve(cwd,name)
		let config = JSON.parse(fs.readFileSync(src,'utf8'))
		config.#path = src
		return config
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

export def resolvePaths obj,cwd
	if obj isa Array
		for item,i in obj
			obj[i] = resolvePaths(item,cwd)
	elif typeof obj == 'string'
		return obj.replace(/^\.\//,cwd + '/')
	elif typeof obj == 'object'
		for own k,v of obj
			let alt = k.replace(/^\.\//,cwd + '/')
			obj[alt] = resolvePaths(v,cwd)
			if alt != k
				delete obj[k]
	return obj

export def expandPath src, o = {}
	unless src.indexOf("*") >= 0
		return Promise.resolve([src])

	let options = Object.assign({
		depth: 1
		fileFilter: '*.imba',
	},o)

	src = src.replace(/(\/\*\*)?(\/\*(\.\w+)?)?$/) do(m,deep,last,ext)
		if ext
			options.fileFilter = '*' + ext
		if deep
			options.depth = 5
		return ""
	# console.log "readdirp",src,options
	let files = await readdirp.promise(src,options)
	# console.log 'files from promise',files
	return files.map do $1.fullPath

# generates a function that converts integers to a short
# alphanumeric string utilizing the supplied alphabet
export def idGenerator alphabet = 'abcdefghijklmnopqrstuvwxyz'
	let remap = {}
	for k in [0 ... (alphabet.length)]
		remap[k.toString(alphabet.length)] = alphabet[k]
	return do(num)
		num.toString(alphabet.length).split("").map(do remap[$1]).join("")

export def createHash body
	crypto.createHash('sha1').update(body).digest('base64').replace(/[\=\+\/]/g,'').slice(0,8)

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