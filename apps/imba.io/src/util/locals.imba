export default class LocalsProxy
	static def for key, storage = global.localStorage
		let map = storage.#locals ||= {}
		map[key] ||= new Proxy({},new self(key,storage)) 

	constructor key, storage
		ns = key
		storage = storage
		cache = {}

	def serialize val, key
		JSON.stringify(val)

	def deserialize val, key
		JSON.parse(val)

	def pathify key
		ns + ':' + key

	def get target, key
		if cache.hasOwnProperty(key)
			return cache[key]

		let path = pathify(key)
		let raw = storage.getItem(path)

		if raw != undefined
			return cache[key] = deserialize(raw,key)
		return undefined

	def set target, key, value
		let cached = cache[key]
		let path = pathify(key)
		let raw = storage.getItem(path)

		if cached != value
			if value == undefined
				storage.removeItem(path)
				delete cache[key]
			else
				storage.setItem(path,serialize(value,key))
			cache[key] = value
			# global.imba..commit!
		return yes