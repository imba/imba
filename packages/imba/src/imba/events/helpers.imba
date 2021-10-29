export const navigator = new class

	get ios?
		let nav = global.navigator.platform or ''
		return true if nav.match(/iPhone|iPod|iPad/)
		return true if nav == 'MacIntel' and global.navigator.maxTouchPoints > 2
		return false

export def toElement sel, source
	let el = source
	
	if sel isa Element
		return sel

	if typeof sel == 'string'
		if sel == 'this' or sel == ''
			return el
		elif sel == 'up'
			return el.parentNode
		elif sel == 'op'
			return el.offsetParent
		else
			return el.closest(sel) or el.querySelector(sel) or global.document.querySelector(sel)
	
	return null

export def parseDimension val
	if typeof val == 'string'
		let [m,num,unit] = val.match(/^([-+]?[\d\.]+)(%|\w+)$/)
		return [parseFloat(num),unit]
	elif typeof val == 'number'
		return [val]

export def round val,step = 1
	let inv = 1.0 / step
	Math.round(val * inv) / inv
	
export def clamp val,min,max
	if min > max
		Math.max(max,Math.min(min,val))
	else
		Math.min(max,Math.max(min,val))

export def createScale a0,a1,b0r,b1r,s = 0.1
	let [b0,b0u] = parseDimension(b0r)
	let [b1,b1u] = parseDimension(b1r)
	let [sv,su] = parseDimension(s)
	
	b0 = (a1 - a0) * (b0 / 100) if b0u == '%'
	b1 = (a1 - a0) * (b1 / 100) if b1u == '%'
	
	sv = (b1 - b0) * (sv / 100) if su == '%'
	
	return do(value,fit)
		let pct = (value - a0) / (a1 - a0)
		let val = b0 + (b1 - b0) * pct
		# console.log 'scaling',value,[a0,a1],[b0,b1],s,val
		val = round(val,sv) if s
		val = clamp(val,b0,b1) if fit
		return val