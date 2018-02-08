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
		<li> <span.title> item:title

# will be cached?
apps:strings = <div.app -> <ul>
	for item,i in store:items
		<li :tap.prevent='addSomething'> <span.title> item:title
		
apps:chainSyntax = <div.app -> <ul>
	for item,i in store:items
		<li :tap.prevent.addSomething> <span.title> item:title

apps:functions = <div.app -> <ul>
	for item,i in store:items
		<li :tap.prevent=actions:tap> <span.title> item:title
		
apps:functions-no-mod = <div.app -> <ul>
	for item,i in store:items
		<li :tap=actions:tap> <span.title> item:title
			
apps:arrays = <div.app -> <ul>
	for item,i in store:items
		<li :tap.prevent=[actions:tap,item]> <span.title> item:title
			
apps:textA = <div.app -> <ul>
	for item,i in store:items
		<li> "a" + COUNTER
			
apps:textB = <div.app -> <ul>
	for item,i in store:items
		<li> "b" + COUNTER

apps:textC = <div.app -> <ul>
	for item,i in store:items
		<li> "c" + COUNTER
		
apps:loop = <div.app -> <ul>
	for item,i in store:items
		<li> <span.title> item:title

apps:loopInner = <div.app ->
	<ul>
		<li> "First item"
		for item,i in store:items
			<li> <span.title> item:title
		<li> "Last item"

apps:loopKeys = <div.app -> <ul>
	for item,i in store:items
		<li@{i}> <span.title> item:title

apps:loopTrue = <div.app -> <ul>
	if true
		for item in store:items
			<li> <span.title> item:title

apps:loopWeird = <div.app ->
	<ul>
		if COUNTER % 3 == 0
			<li> "Single"
		else
			for item in store:items
				<li> <span.title> item:title
		
		

var logs = []

window.APPS = apps
var currentApp

var run = do |app,name,times|
	let item = {title: "Push/pop item"}
	window:app:innerHTML = ''
	window:app.appendChild(app.dom)
	console.time(name)
	let itemCount = store:items:length
	let t0 = window:performance.now
	var i = 0
	COUNTER = 0
	while i < times
		COUNTER++
		if i % 2
			store:items.pop
		else
			store:items.push(item)
		app.render
		i++
	let t1 = window:performance.now
	store:items:length = itemCount
	console.timeEnd(name)
	logs.push("{name} x{times} took {(t1 - t0).toFixed(2)}ms")
	currentApp = app
	Imba.commit

var testWeird = do
	let bool = true
	let item = <div> "BOOL"
	let items = store:items.slice(0)
	let dyn = do item
	let app = <div.app ->
		<div>
			<div> "before"
			if bool
				dyn()
				for item in items
					<li> <span.title> item:title
			<div> "after"
	run(app,'bug',1)
	bool = false
	app.render
	bool = true
	app.render
	let par = item.dom:parentNode
	par.removeChild(item.dom)
	# par.removeChild(item.dom)
	bool = false
	app.render
	
	# add a bunch of items
	
tag RunButton < button
	
	def ontap
		run(data,dom:textContent,100001)

var controls = <div.controls ->
	<div.header>
		for own name,app of apps
			<RunButton[app]> "{name}"
		<button :tap=(|e| currentApp?.render )> "render"
		<button :tap=testWeird> "weird"
	<div.logs> for item in logs
		<div> item




Imba.mount(controls,window:controls)
