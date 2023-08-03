extend class Number

	def clamp2 min,max
		Math.max( Math.min(Number(this),max), min )