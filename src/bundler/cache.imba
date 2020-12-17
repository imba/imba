const utils = require './utils'

export default class Cache

	def constructor path, file
		path = path
		file = file
		data = {
			aliases: {}
			cache: {}
		}
		mintime = 0
		idFaucet = utils.idGenerator!

	def setup
		await deserialize!

	def save
		await serialize!

	def deserialize
		await file.load!
		data = file.data
		self

	def serialize
		let all = {
			aliases: aliases
			cache: {}
		}
		for own key,val of cache
			let value = await val.promise
			all.cache[key] = {time: val.time, promise: value}
		file.data = all
		await file.save!

	get cache
		data.cache ||= {}

	get aliases
		data.aliases ||= {}

	def alias src
		unless aliases[src]
			let nr = Object.keys(aliases).length
			aliases[src] = idFaucet(nr) + "0"

		return aliases[src]

	def memo key, time, cb
		let cached = cache[key]
		time = mintime if mintime > time
		if cached and cached.time >= time
			return cached.promise

		cached = cache[key] = {
			time: Date.now!
			promise: cb!
		}

		return cached.promise

