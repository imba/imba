import 'imba/spec'

global class Logger
	def warn str
		console.warn str

tag Marker

tag SpecialMarker < Marker
	isa Logger


test do
	let el = new <SpecialMarker>
	ok el.warn isa Function

# SPEC.run!