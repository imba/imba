
const VALID_CSS_UNITS = {
	cm:1
	mm:1
	Q:1
	pc:1
	pt:1
	px:1
	em:1
	ex:1
	ch:1
	rem:1
	vw:1
	vh:1
	vmin:1
	vmax:1
	s:1
	ms:1
	fr:1
	'%':1
	'in':1
	turn:1
	grad:1
	rad:1
	deg:1
	Hz:1
	kHz:1
}

const CSS_DEFAULT_UNITS = {
	x:'px'
	y:'px'
	z:'px'
	rotate:'turn'
}

const CSS_STR_PROPS = {
	prefix:1
	suffix:1
	content:1
}

const CSS_PX_PROPS = /^([xyz])$/
const CSS_DIM_PROPS = /^([tlbr]|size|[whtlbr]|[mps][tlbrxy]?|[rcxy]?[gs])$/

const resets = '''*,::before,::after {
	box-sizing: border-box;
	border-width: 0;
	border-style: solid;
	border-color: currentColor;
}'''

class Styles
	entries = {}

	def register id, styles
		let entry = entries[id]

		if !entry
			entry = entries[id] = {sourceId: id, css: styles}

			if !entries.resets
				register('resets',resets)

			if $web$
				entry.node = document.createElement('style')
				entry.node.textContent = entry.css
				document.head.appendChild(entry.node)

		elif entry
			# if it was already registered - we update the content
			# and on the web – replace the actual styles
			entry.css = styles
			if entry.node
				entry.node.textContent = styles
		return

	def toString
		Object.values(entries).map(do $1.css).join('\n\n')

	def toValue value, unit, key
		if CSS_STR_PROPS[key]
			value = String(value)

		let typ = typeof value	
			
		if typ == 'number'
			if !unit
				if CSS_PX_PROPS.test(key)
					unit = 'px'
				elif CSS_DIM_PROPS.test(key)
					unit = 'u'
				elif key == 'rotate'
					unit = 'turn'

			if unit
				if VALID_CSS_UNITS[unit]
					# what if the unit is already set?
					return value + unit
				elif unit == 'u'
					return value * 4 + 'px'
				else
					return "calc(var(--u_{unit},1px) * {value})"
			else
				yes	
			
		elif typ == 'string' and key
			if CSS_STR_PROPS[key] and value[0] != '"' and value[0] != "'"
				if value.indexOf('"') >= 0
					if value.indexOf("'") == -1
						value = "'" + value + "'"
					else
						no # do something here
				else
					value = '"' + value + '"'

		return value
		
	def parseDimension val
		if typeof val == 'string'
			let [m,num,unit] = val.match(/^([-+]?[\d\.]+)(%|\w+)$/)
			return [parseFloat(num),unit]
		elif typeof val == 'number'
			return [val]

extend class imba.dom.Element
	def css$ key, value, mods
		self.style[key] = value
		
	def css$var name, value, unit, key
		let cssval = global.imba.styles.toValue(value,unit,key)
		self.style.setProperty(name,cssval)
		return

imba.styles = new Styles