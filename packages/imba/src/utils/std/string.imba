extend class String

	get upper?
		/^[A-Z][A-Z_\d]*$/.test self

	get num?
		int? or float?

	get int?
		/^-?\d+$/.test self

	get float?
		/^-?\d+\.\d+$/.test self

	get pascal?
		/^[A-Z]+[a-z]+[A-Za-z]*/.test self

	def pluck pattern
		let m = match(pattern)
		let l = m and m.length
		return l > 2 ? m.slice(1) : (m ? m[l - 1] : null)


