# imba$stdlib=1
import {commit} from './scheduler'

const fn = do yes

# Return functions to allow calling the storage for nesting.
def storetarget
	return do yes

class Storage
	declare cache\{raw:any,rich:any}
	declare store\Storage
	
	def constructor store, ns = ''
		self.store = store or {}
		self.cache = {raw:{},rich:{}}
		self.ns = ns
		self.local = store == global.sessionStorage
		self.children = new Map

	def serialize val, key
		JSON.stringify(val)

	def deserialize val, key
		JSON.parse(val)

	def getItem name
		let key = String(ns) + ':' + name

		if store isa Storage
			return store.getItem(key)

		if local and cache.rich[key] != undefined
			return cache.rich[key]

		let raw = store.getItem(key)
		# if we are
		if raw != undefined
			if cache.raw[key] == raw
				return cache.rich[key]

			cache.raw[key] = raw
			return cache.rich[key] = deserialize(raw,key)

	def setItem name, value
		let key = String(ns) + ':' + name

		if store isa Storage
			return store.setItem(key,value)

		let cached = cache.rich[key]
		let typ = typeof value

		if local
			cache.rich[key] = value

		if cached !== value or typ == 'object'
			let prev = store.getItem(key)

			if value == undefined
				store.removeItem(key)
				delete cache.rich[key]
				delete cache.raw[key]
				commit!
			else
				let raw = serialize(value,key)
				cache.rich[key] = value
				cache.raw[key] = raw

				if prev != raw
					store.setItem(key,raw)
					commit!

	def removeItem name
		let key = String(ns) + ':' + name
		delete cache[key]
		store.removeItem(key)

	def get target,key,receiver
		getItem(key)

	def set target,key,value,receiver
		setItem(key,value)
		return yes

	def apply target, that, [name]
		let item = children.get(name)
		item || children.set(name,item = new Proxy(storetarget!,new Storage(self,name)))
		return item

	def deleteProperty target, name
		removeItem(name)
		return yes

	def ownKeys target
		let keys = ['prototype']
		let key = ns + ':'
		for k in Object.keys(store)
			if k.indexOf(key) == 0
				keys.push(k.slice(key.length))
		return keys

export const locals = new Proxy(storetarget!,new Storage(global.localStorage))
export const session = new Proxy(storetarget!,new Storage(global.sessionStorage))