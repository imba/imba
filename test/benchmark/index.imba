const store = {
	items: [
		{title: "Create example"}
		{title: "Play around with example"}
	]
}

for i in [0..20]
	store:items.push(title: "List item {i}")

const actions = {
	add: do store:items.push({title: "Another item"})
	tap: do
		console.log "tap",$0

	reverse: do store:items.reverse
	rename: do |item|
		item:name = "Something"
}

var apps = {}
var COUNTER = 0

apps:no-events = <div.app -> <ul>
	for item,i in store:items
		<li>
			<span> "" + COUNTER
			<span.title> item:title

# will be cached?
apps:strings = <div.app -> <ul>
	for item,i in store:items
		<li :tap.prevent='addSomething'>
			<span> "" + COUNTER
			<span.title> item:title

apps:functions = <div.app -> <ul>
	for item,i in store:items
		<li :tap.prevent=actions:tap>
			<span> "" + COUNTER
			<span.title> item:title
		
apps:functions-no-mod = <div.app -> <ul>
	for item,i in store:items
		<li :tap=actions:tap>
			<span> "" + COUNTER
			<span.title> item:title
			
apps:arrays = <div.app -> <ul>
	for item,i in store:items
		<li :tap.prevent=[actions:tap,item]>
			<span> "" + COUNTER
			<span.title> item:title
			
apps:textA = <div.app -> <ul>
	for item,i in store:items
		<li> "a" + COUNTER
			
apps:textB = <div.app -> <ul>
	for item,i in store:items
		<li> "b" + COUNTER

apps:textC = <div.app -> <ul>
	for item,i in store:items
		<li> "c" + COUNTER

var logs = []

window.APPS = apps

var run = do |app,name|
	let times = 100000
	window:app:innerHTML = ''
	window:app.appendChild(app.dom)
	console.time(name)
	let t0 = window:performance.now
	var i = 0
	COUNTER = 0
	while i < times
		COUNTER++
		app.render
		i++
	let t1 = window:performance.now
	console.timeEnd(name)
	logs.push("{name} x{times} took {(t1 - t0).toFixed(2)}ms")
	Imba.commit

tag RunButton < button
	
	def ontap
		run(data,dom:textContent)

var controls = <div.controls ->
	<div.header>
		for own name,app of apps
			<RunButton[app]> "{name}"
	<div.logs> for item in logs
		<div> item
		
Imba.mount(controls,window:controls)

# Imba.mount <div.app ->
# 	<div.header>
# 		<button :tap=actions:add> 'add item'
# 		<button :tap=actions:reverse> 'reverse items'
# 	<ul.grow> for item in data:items
# 		<li> item:title