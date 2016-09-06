
var a = 10
require './shared'

if $debug$
	require './debug'
else
	console.log 'no debug'

if $web$
	require './web'
elif $node$
	require './node'
else
	console.log 'no web'




if $production$
	require './production'
else
	console.log 'no production'

if $web$
	10
	20
	30
elif $node$
	let a = 40
	50
	60

if one
	10
	20
elif $web$
	30
	40
else
	50
	60

if $web$
	30
	40
else
	50
	60

if hello
	yes
else
	no
