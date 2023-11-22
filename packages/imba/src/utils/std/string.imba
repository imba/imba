# imba$stdlib=1
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

	get slug
		let str = this.normalize('NFKD') # split accented characters into their base characters and diacritical marks
		str = str.replace(/[\u0300-\u036f]/g, '') # remove all the accents, which happen to be all in the \u03xx UNICODE block.
		str = str.trim() # trim leading or trailing whitespace
		str = str.toLowerCase() # convert to lowercase
		str = str.replace(/[^a-z0-9 -]/g, '') # remove non-alphanumeric characters
		str = str.replace(/\s+/g, '-') # replace spaces with hyphens
		str = str.replace(/-+/g, '-') # remove consecutive hyphens
		return str

	def pluck pattern
		let m = match(pattern)
		let l = m and m.length
		return l > 2 ? m.slice(1) : (m ? m[l - 1] : null)


