
var selHandler

def activateSelectionHandler
	unless selHandler
		selHandler = do |e|
			return if e.handled$
			e.handled$ = yes
			
			let target = imba.document.activeElement
			if target and target.matches('input,textarea')
				let custom = CustomEvent.new('selection',{
					detail: {
						start: target.selectionStart
						end: target.selectionEnd
					}
				})
				target.dispatchEvent(custom)
		imba.document.addEventListener('selectionchange',selHandler)

Element.prototype.on$selection = do |mods, context|
	activateSelectionHandler()