
import np from 'path'
import nfs from 'fs'
import {createHash} from 'crypto'
import {idGenerator} from './utils'

const hashedKeyCache = {

}

const keyPathCache  = {

}
import log from '../utils/logger'

export default class Cache
	def constructor options
		#key = Symbol!
		o = options
		dir = o.cachedir # or np.resolve(program.cwd,'.cache') # file.absdir # np.dirname()
		nodefs = o.volume or nfs
		# aliases live in a shared (user-level) dir so their ids stay unique
		# across separately-built projects; fall back to the cache dir if unset.
		let aliasroot = o.aliasdir or dir
		aliaspath = aliasroot and np.resolve(aliasroot,'.imba-aliases')
		aliasmap = []
		aliasindex = new Map
		aliascache = {}

		data = {
			aliases: {}
			cache: {}
		}

		mintime = o.mtime or 0
		persistToDisk = !!dir
		idFaucet = idGenerator!
		preload!

	def preload
		return unless persistToDisk
		unless nodefs.existsSync(dir)
			nodefs.mkdirSync(dir)

		let entries = nodefs.readdirSync(dir)
		for entry in entries
			cache[entry] = {exists: 1}

		unless nodefs.existsSync(aliaspath)
			let aliasdir = np.dirname(aliaspath)
			nodefs.mkdirSync(aliasdir,{recursive: yes}) unless nodefs.existsSync(aliasdir)
			nodefs.appendFileSync(aliaspath,"")

		refreshAliasMap!
		log.ts "cache loaded"
		self

	def setup
		yes

	def save
		self

	def deserialize
		self

	def serialize
		self

	get cache
		data.cache ||= {}

	get aliases
		data.aliases ||= {}

	def alias src
		unless aliases[src]
			let nr = Object.keys(aliases).length
			aliases[src] = idFaucet(nr) + "0"

		return aliases[src]

	def normalizeKey key
		if hashedKeyCache[key]
			return hashedKeyCache[key]

		let hash = createHash('sha1')
		hash.update(key)
		hashedKeyCache[key] = hash.digest('hex') # '_' + hash.digest('hex').slice(0,-1)

	def fullKeyPath key
		keyPathCache[key] ||= np.resolve(dir,key)

	def getKeyTime key
		key = normalizeKey(key)
		let cached = cache[key]

		if cached and cached.time
			return cached.time

		if cached and cached.exists and persistToDisk
			let path = fullKeyPath(key)
			nodefs.statSync(path).mtimeMs
		else
			0

	def refreshAliasMap
		# one path per line - the index is its line number (and the id we hand
		# out). Build a key->index Map so lookups are O(1) instead of indexOf.
		aliasmap = nodefs.readFileSync(aliaspath,'utf8').split(/\r?\n/).filter(do $1)
		aliasindex = new Map
		for key,i in aliasmap
			aliasindex.set(key,i) unless aliasindex.has(key)

	def getPathAlias path
		getKeyAlias(path)

	def getKeyAlias key
		if aliascache[key]
			return aliascache[key]

		let index = aliasindex.get(key)

		# new path - give it the next index and append to the shared alias
		# file. We keep the in-memory map in sync instead of re-reading the
		# whole file on every new key (which made this O(n) per key).
		if index == undefined
			index = aliasmap.length
			aliasmap.push(key)
			aliasindex.set(key,index)
			if persistToDisk
				nodefs.appendFileSync(aliaspath,key + '\n','utf8')

		return aliascache[key] = idFaucet(index)

	def getKeyValue key
		let path = fullKeyPath(key)
		let val = await nodefs.promises.readFile(path,'utf8')
		JSON.parse(val)

	def setKeyValue key, value
		return unless persistToDisk # dont use if in-memory
		let path = fullKeyPath(key)
		let json = JSON.stringify(value)
		nodefs.promises.writeFile(path,json)

	def memo name, time, cb
		let key = normalizeKey(name)
		time = mintime if mintime > time

		let cached = cache[key]

		if cached and cached.time >= time
			return cached.promise

		let keytime = getKeyTime(name)

		# check for file on disk
		# let file = program.fs.lookup(np.resolve(dir,key))
		# let mtime = file.mtimesync

		if (keytime > time) and !process.env.CI
			let promise = getKeyValue(key).catch do(error)
				console.warn "Error compiling file in getKeyValue name: {name}, key: {key}", error
				cb!.then do(val) setKeyValue(key,val)

			cached = cache[key] = {
				time: Date.now!
				promise: promise
			}
			return cached.promise
		else
			cached = cache[key] = {
				time: Date.now!
				promise: cb!
			}

			cached.promise.then do(val)
				setKeyValue(key,val)

			return cached.promise