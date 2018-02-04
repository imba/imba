var Imba = require("./imba")
var activate = no
if typeof window !== 'undefined'
	if window.Imba
		console.warn "Imba v{window.Imba.VERSION} is already loaded."
		Imba = window.Imba
	else
		window.Imba = Imba
		activate = yes
		if window:define and window:define:amd
			window.define("imba",[]) do return Imba

module.exports = Imba

unless $webworker$
	require './scheduler'
	require './dom/index'

if $web$ and activate
	Imba.EventManager.activate
	
if $node$
	unless $webpack$
		require '../../register.js'
