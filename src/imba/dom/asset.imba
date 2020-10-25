const assets = {}
const ext = imba.assets ||= {}

def ext.register name, asset
	assets[name] = asset
	self

def ext.create name, parent, flags
	let asset = assets[name]
	if $node$ # !asset.node
		let el = imba.document.createElementNS("http://www.w3.org/2000/svg",'svg')
		for own k,v of asset.attributes
			el.setAttribute(k,v)
		
		el.flags$ns = asset.flags.join(' ') + ' '
		el.className = (el.flags$ns + flags).trim!
		el.innerHTML = asset.content
		if parent and parent isa imba.dom.Node
			el.insertInto$(parent)
		return el
	
	if $web$
		if !asset.node
			let el = imba.document.createElementNS("http://www.w3.org/2000/svg",'svg')
			for own k,v of asset.attributes
				el.setAttribute(k,v)
			el.innerHTML = asset.content
			el.className.baseVal = asset.flags.join(' ')
			asset.node = el
		
		let el = asset.node.cloneNode(yes)
		let cls = el.flags$ns = el.className.baseVal + ' '
		el.className.baseVal = cls + flags
		if parent and parent isa imba.dom.Node
			el.insertInto$(parent)
		return el
	# if node -- do tiny parsing
	return null

imba.registerAsset = ext.register
imba.createAssetElement = ext.create