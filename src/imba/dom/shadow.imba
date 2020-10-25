const {Element,ShadowRoot} = imba.dom

ShadowRoot.prototype.insert$ = Element.prototype.insert$
ShadowRoot.prototype.appendChild$ = Element.prototype.appendChild$

extend class ShadowRoot
	get #parent
		self.host