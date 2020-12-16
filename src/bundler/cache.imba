export default class Cache

	def constructor path, file
		path = path
		file = file
		map = {}
		mintime = 0

	def setup
		await deserialize!

	def save
		await serialize!

	def deserialize
		await file.load!
		map = file.data
		self

	def serialize
		let all = {}
		for own key,val of map
			let value = await val.promise
			all[key] = {time: val.time, promise: value}
		file.data = all
		await file.save!

	def load key, time, cb
		let cached = map[key]
		time = mintime if mintime > time
		if cached and cached.time >= time
			# console.log 'return cache for',key
			return cached.promise

		cached = map[key] = {
			time: Date.now!
			promise: cb!
		}

		# console.log 'caching',key

		return cached.promise

