# imba$imbaPath=global
const imba = global.imba
const {Event,CustomEvent,Element} = imba.dom

let selHandler
let handledSym = Symbol!

def activateSelectionHandler
	unless selHandler
		selHandler = do(e)
			return if e[handledSym]
			e[handledSym] = yes
			
			let target = document.activeElement
			if target and target.matches('input,textarea')
				let custom = new CustomEvent('selection',{
					detail: {
						start: target.selectionStart
						end: target.selectionEnd
					}
				})
				target.dispatchEvent(custom)
		document.addEventListener('selectionchange',selHandler)

Element.prototype.on$selection = do(mods, context)
	activateSelectionHandler()