var Imba = require("./imba")
var activate = no
var ns = (typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null))

if ns and ns.Imba
	console.warn "Imba v{ns.Imba.VERSION} is already loaded."
	Imba = ns.Imba
elif ns
	ns.Imba = Imba
	activate = yes
	if ns.define and ns.define.amd
		ns.define("imba",[]) do Imba

module.exports = Imba

unless $webworker$
	require './scheduler'
	require './dom/index'
	# if activate
	# 	Imba.EventManager.activate()
	
if $node$
	unless $webpack$
		require '../../register.js'
