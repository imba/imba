extend class Set<T>

	def filter cb
		new Set(Array.from(self).filter(cb))
