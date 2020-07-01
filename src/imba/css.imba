
let root
let resets = '*,::before,::after {
	box-sizing: border-box;
	border-width: 0;
	border-style: solid;
	border-color: currentColor;
}'

export def setup
	unless root
		if root = document.documentElement
			register(resets,'root')
	

export def register styles, id
	setup!
	var el = document.createElement('style')
	el.textContent = styles
	document.head.appendChild(el)
	return
	
export def parseDimension val
	if typeof val == 'string'
		let [m,num,unit] = val.match(/^([-+]?[\d\.]+)(%|\w+)$/)
		return [parseFloat(num),unit]
	elif typeof val == 'number'
		return [val]