
export def createLiveFragment bitflags, options
	var el = imba.document.createDocumentFragment()
	el.setup$(bitflags, options)
	return el

export def createFragment bitflags, parent
	if bitflags & $TAG_INDEXED$
		return new IndexedTagFragment(bitflags,parent)
	else
		return new KeyedTagFragment(bitflags,parent)
