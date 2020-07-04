export class Flags

	def constructor dom
		dom = dom
		string = ""

	def contains ref
		return dom.classList.contains(ref)

	def add ref
		return self if contains(ref)
		string += (string ? ' ' : '') + ref
		dom.classList.add(ref)
		# sync!
		return self

	def remove ref
		return self unless contains(ref)
		var regex = new RegExp('(^|\\s)*' + ref + '(\\s|$)*', 'g')
		string = string.replace(regex, '')
		dom.classList.remove(ref)
		# sync!
		return self

	def toggle ref, bool
		bool = !contains(ref) if bool === undefined
		bool ? add(ref) : remove(ref)
		
	def incr ref
		let m = stacks ||= {}
		let c = m[ref] or 0
		add(ref) if c < 1
		m[ref] = Math.max(c,0) + 1
		return self
	
	def decr ref
		let m = stacks ||= {}
		let c = m[ref] or 0
		remove(ref) if c == 1
		m[ref] = Math.max(c,1) - 1
		return self

	def valueOf
		string

	def toString
		string

	def sync
		dom.flagSync$!