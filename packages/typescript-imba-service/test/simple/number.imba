extend class Number

	def clamp min,max
		Math.max( Math.min(Number(this),max), min )