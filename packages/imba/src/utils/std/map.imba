extend class WeakMap<K,V>
	###
	Retrieve value for a key while also setting the value
	if it did not exist already. Like obj.key ||= value
	but for WeakMap
	###
	def setnx key, value
		return self.get(key) ?? (self.set(key,value) && value)

extend class Map<K,V>
	###
	Retrieve value for a key while also setting the value
	if it did not exist already. Like obj.key ||= value
	but for Map
	###
	def setnx key, value
		return self.get(key) ?? (self.set(key,value) && value)


