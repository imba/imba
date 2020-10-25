var imba = global.imba ||= {}
imba.version = '2.0.0-alpha.97'

if $node$
	import './ssr'
	imba.document = imba.dom.document = new imba.dom.Document

if $web$
	imba.dom = global
	imba.document = document

imba.setTimeout = global.setTimeout
imba.setInterval = global.setTimeout
imba.clearInterval = global.clearInterval
imba.clearTimeout = global.clearTimeout

Object.defineProperty(imba,'flags',get:(do imba.document.documentElement.classList))