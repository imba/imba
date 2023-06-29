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

	def to-currency currency='USD', rate=1
		let decimals = rate < 0.9 ? 2 : 0
		try
			let fn = new Intl.NumberFormat(global.navigator..language or 'en-US', {
				style: 'currency'
				currency: currency
				minimumFractionDigits: decimals
			})
			fn.format(Math.round(self))
		catch e
			if rate != 1
				"{self.round(decimals)} {currency}"
			else
				self.round(decimals).toUSD!
