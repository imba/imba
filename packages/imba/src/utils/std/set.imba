extend class Set

	def filter cb
		new Set(Array.from(self).filter(cb))
