# imba$stdlib=1
export class Flags

	def constructor dom
		dom = dom
		string = ""

	def contains ref
		return dom.classList.contains(ref)

	def has ref
		return dom.classList.contains(ref)

	def add ref
		return self if contains(ref)
		string += (string ? ' ' : '') + ref
		dom.classList.add(ref)
		# now this should be said to be synced?
		return self

	def remove ref
		return self unless contains(ref)

		let regex = new RegExp('(^|\\s)' + ref + '(?=\\s|$)', 'g')
		string = string.replace(regex, '')
		dom.classList.remove(ref)
		return self

	def toggle ref, bool
		bool = !contains(ref) if bool === undefined
		bool ? add(ref) : remove(ref)

	def incr ref, duration = 0
		let m = stacks
		let c = m[ref] or 0
		add(ref) if c < 1

		if duration > 0
			setTimeout(&,duration) do decr(ref)

		return m[ref] = Math.max(c,0) + 1

	def decr ref
		let m = stacks
		let c = m[ref] or 0
		remove(ref) if c == 1
		return m[ref] = Math.max(c,1) - 1

	def reconcile sym, str, statics
		# only for functional tag syncing?
		let syms = #symbols
		let vals = #batches
		let dirty = yes
		unless syms
			syms = #symbols = [sym]
			vals = #batches = [str or '']

			if statics and (dom.className or '').indexOf(statics) == -1
				syms.push(sym)
				vals.push(statics)

			self.toString = self.valueOf = self.#toStringDeopt
		else
			let idx = syms.indexOf(sym)
			let val = str or ''
			if idx == -1
				syms.push(sym)
				vals.push(val)

				if statics and (dom.className or '').indexOf(statics) == -1
					syms.push(sym)
					vals.push(statics)


			elif vals[idx] != val
				vals[idx] = val
			else
				dirty = no

		if dirty
			#extras = ' ' + vals.join(' ')
			sync!
		return

	def valueOf
		string

	def toString
		string

	def #toStringDeopt
		string + (#extras or '')

	def sync
		dom.flagSync$!

	get stacks
		#stacks ||= {}