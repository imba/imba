let cache = new Map

extend class HTMLElement
	get layoutCache
		let val = cache.get(self)
		val || cache.set(self,val = {})
		return val

	get rect
		let val = layoutCache.rect ||= getBoundingClientRect!
		return val

	get cachedWidth
		# Element.prototype.offsetWidth
		layoutCache.width ||= offsetWidth

	get cachedHeight
		layoutCache.height ||= offsetHeight

	get pageRect
		let val = layoutCache.pageRect
		return val if val

		let top = offsetTop
		let left = offsetLeft
		let el = offsetParent

		while el
			top += el.offsetTop
			left += el.offsetLeft
			el = el.offsetParent

		return layoutCache.pageRect = {
			top: top
			left: left
			width: offsetWidth
			height: offsetHeight
		}

window.addEventListener('resized') do(e)
	cache.clear!