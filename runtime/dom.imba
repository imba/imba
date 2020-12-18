export class Element
	def setup
		"yes"

export class HTMLElement < Element
	def setup
		"yes"

export class SVGElement < Element
	def setup
		console.log 'hello there'