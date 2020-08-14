
let root
let resets = '''*,::before,::after {
	box-sizing: border-box;
	border-width: 0;
	border-style: solid;
	border-color: currentColor;
}'''

const map = {}

export def setup
	unless root
		if root = document.documentElement
			register(resets,'root')
	

export def register styles, id
	if !map.root and id != 'root'
		register(resets,'root')

	if id and !map[id]
		let entry = map[id] = {raw: styles}
		if $web$
			entry.node = document.createElement('style')
			entry.node.textContent = entry.raw
			document.head.appendChild(entry.node)

	return

export def toStyleSheet
	Object.values(map).map(do $1.raw).join('\n\n')
	
export def parseDimension val
	if typeof val == 'string'
		let [m,num,unit] = val.match(/^([-+]?[\d\.]+)(%|\w+)$/)
		return [parseFloat(num),unit]
	elif typeof val == 'number'
		return [val]