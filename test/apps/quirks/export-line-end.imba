
export def createLiveFragment bitflags, options
	var el = imba.document.createDocumentFragment()
	el.setup$(bitflags, options)
	return el

export def createFragment bitflags, parent
	if bitflags & $TAG_INDEXED$
		return IndexedTagFragment.new(bitflags,parent)
	else
		return KeyedTagFragment.new(bitflags,parent)
