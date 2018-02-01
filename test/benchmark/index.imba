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
	reverse: do store:items.reverse
	rename: do |item| item:name = "Something"
}

var apps = {}

apps:no-events = <div.app -> <ul>
	for item,i in store:items
		<li .{"item{i}"}> <span.title> item:title

# will be cached?
apps:strings = <div.app -> <ul>
	for item,i in store:items
		<li .{"item{i}"} :tap.prevent='addSomething'> <span.title> item:title

apps:functions = <div.app -> <ul>
	for item,i in store:items
		<li .{"item{i}"} :tap.prevent=actions:rename> <span.title> item:title
		
apps:functions-no-mod = <div.app -> <ul>
	for item,i in store:items
		<li .{"item{i}"} :tap=actions:rename> <span.title> item:title
			
apps:arrays = <div.app -> <ul>
	for item,i in store:items
		<li .{"item{i}"} :tap.prevent=[actions:rename,item]> <span.title> item:title

var logs = []

window.APPS = apps

var run = do |app,name|
	let times = 100000
	window:app:innerHTML = ''
	window:app.appendChild(app.dom)
	console.time(name)
	let t0 = window:performance.now
	var i = 0
	while i < times
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