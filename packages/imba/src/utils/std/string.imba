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
