import {document,Node} from './dom'

const assets = {}

export def register name, asset
	assets[name] = asset
	self

export def create name, parent, flags
	let asset = assets[name]
	if $node$ # !asset.node
		let el = document.createElementNS("http://www.w3.org/2000/svg",'svg')
		for own k,v of asset.attributes
			el.setAttribute(k,v)
		
		el.flags$ns = el.className = asset.flags.join(' ')
		el.innerHTML = asset.content
		if parent and parent isa Node
			el.insertInto$(parent)
		return el
	
	if $web$
		if !asset.node
			let el = document.createElementNS("http://www.w3.org/2000/svg",'svg')
			for own k,v of asset.attributes
				el.setAttribute(k,v)
			el.innerHTML = asset.content
			el.className.baseVal = asset.flags.join(' ')
			# el.flags$ns = 
			asset.node = el
		
		let el = asset.node.cloneNode(yes)
		el.flags$ns = el.className.baseVal
		let cls = el.className.baseVal
		el.className.baseVal = cls + ' ' + flags
		if parent and parent isa Node
			el.insertInto$(parent)
		return el
	# if node -- do tiny parsing
	return null
