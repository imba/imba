# imba$stdlib=1

extend class Number

	def to num
		# TODO Rename this to upto?
		Array.from {length: num - self + 1}, do self + $2

	def floor
		Math.floor self

	def ceil
		Math.ceil self

	def round prec = 1
		if prec != 1
			let inv = 1.0 / prec
			return Math.round(self * inv) / inv
		Math.round self

	def clamp\number min\number, max\number
		# TODO Makes little sense to support these? Better to define .min and .max functions on nr?
		if typeof max isnt 'number'
			Math.max self, min
		elif typeof min isnt 'number'
			Math.min self, max
		else
			Math.min Math.max(self,min), max

	def lerp\number imin\number, imax\number, omin = 0, omax = 1
		let normal = (self - imin) / (imax - imin)
		return omin + normal * (omax - omin)
