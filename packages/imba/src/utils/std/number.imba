extend class Number

	def to num
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

	def clamp min, max
		Math.min Math.max(self,min), max

	def lerp imin, imax, omin, omax
		let normal = (self - imin) / (imax - imin)
		return omin + normal * (omax - omin)
