var imba = global.imba ||= {}
imba.version = '2.0.0-alpha.97'

if $node$
	import './ssr'
	yes

if $web$
	imba.dom = global
	Object.defineProperty(imba,'flags',get:(do document.documentElement.classList))

imba.setTimeout = global.setTimeout
imba.setInterval = global.setTimeout
imba.clearInterval = global.clearInterval
imba.clearTimeout = global.clearTimeout

