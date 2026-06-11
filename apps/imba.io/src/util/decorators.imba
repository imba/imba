import Locals from './locals'

export def @setting target, name, desc	
	let o = this[0] or {}
	let sym = Symbol!
	let define = no

	unless desc
		desc = {}
		define = yes
	
	extend desc
		def set value
			let curr = self[sym]
			
			let store = null
			if o.local
				store = Locals.for(o.ns or #key)
			elif o.session
				store = Locals.for(o.ns or #key,global.sessionStorage)
			
			if value === sym
				value = store..[name] ?? o.default ?? null

			# console.log 'initial set to default value',o.ns,#key,value,curr

			if curr === undefined and value === sym
				# console.log 'initial set to default value',o.ns,#key
				value = store..[name] ?? o.default ?? null
				if store
					value = store[name] or value
			if curr === undefined and value === undefined
				return

			# console.log 'setting value',name,curr,value,this.space
			if store
				store[name] = value
			
			if o.css
				let cssval = value + (o.unit ? o.unit : '')
				document.body.style.setProperty("--{name}",cssval)

			self[sym] = value

			if value != curr and o.call and self[o.call] isa Function
				self[o.call]()
		
		def get
			unless self.hasOwnProperty(sym)
				self[name] = sym

			self[sym]

	if define
		Object.defineProperty(target,name,desc)
		return
	else
		desc

	