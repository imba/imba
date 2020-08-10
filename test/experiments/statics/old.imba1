
###

# eariler
tag App
	def render
		<self>
			<h1.head>
				<b> "Title"
				<span> "Something"
			<div.one.two .three=Math.random> Math.random
			<div .three=(Math.random)> "static"

import Radio from './Controls'

var descs = {
	lab: "Allows audience to follow along with their own live versions. All changes will be broadcasted live."
	tutorial: "Tutorials are not visible to others until you have decided to publish them."
	template: "Create a template for your own use"
}

var types = [
	{value: 'lab', title: "Playground", desc: "Experiment"}
	{value: 'tutorial', title: "Screencast", desc: "Record a tutorial"}
	# {value: 'challenge', title: "Challenge", desc: "Assignment for others"}
	{value: 'template', title: "Template", desc: "Create & reuse"}	
]

app.get(/.*/) do |req,res,next|
	# make sure stores are loaded
	await req:api.db.storesDidLoad
	console.log "--- handle request -- {req:originalUrl}"
	var site = <Site api=req:api>
	# var page = <site request=req>
	site.respondTo(req, res, next)


export tag SiteHeader < header
	
	prop page
	prop path
	
	def render
		let curr = guide

		<self._page>
			<nav@nav>
				<.content>
					for item in data:toc
						<h1> item:title or item:id
						for section in item:sections
							<TOC[section] toc=section:toc[0] expanded=(section == curr)>	

			<.body.light>
				"Hello"

				
	def stuff
		var anchor = <a.toc-anchor .{"l{level}"} id=(meta:slug)>
		anchor.toString + node.toString
	
	def render
		<self._page>
			<Guide@{guide:id}[guide]>
			<div> "Other"

	def render2
		@items = ["a","b","c"]
		@k = 0
		<self>
			for item in @items
				<div@{@k++}> item

		var node = <Custom>
		eq node.@k,3
	
	def ribbons
		var len = list.len
		var stack = @history
		var mine = @myFork

		if len < 10
			stack = list

		var more = len - stack.len

		<@ribbons>
			<Item[data].main space=space>

			unless data:uid == api.uid
				<Mine[mine] space=space>

			for item in stack
				continue if item == mine
				<Item[item].history space=space>

			if more > 0
				<div.Item.more :tap='toggle'>
					<span.bullet> <span.count> "+" + more

	def render
		<self>
			<@breadcrumb>
				for item,i in path
					<Item[item] .{"n{i}"}>

			page?.masthead

			<@right>
				<SearchButton.pos value=(page?.searchQuery or "")>

				if page and page.tools
					<@tools> page.tools
				else
					<@tabs>
						<.Button.pos.uxa>
							<i.Icon.uxa> ">"
							<b> <a href="https://gitter.im/scrimba_community/Lobby" target="_blank"> "Chat"
							
						<.Button.pos.uxa>
							<i.Icon.uxa> ">"
							<b> <a href="https://github.com/scrimba/community/issues" target="_blank"> "Feedback"

						<Button.pos.create action=['addcast','tutorial'] label='Create' icon='>'>
						
				if user
					<Actionable[user].session action='usermenu'> <UserAvatar[user] s=60>
				else
					<Button.pri.login action='signin' label=(api.isMobile ? "Join" : "Login / Signup") icon='>'>
					
export tag CastTile < Tile
	
	def self.Renderer data, key, context
		<CastTile@{key}[data] context=context>

export tag CastTypeField
	prop label
	prop pattern

	def render
		var value = self.value

		<self>
			if label
				<label.caption> label
			<.Radios.group.xl>
				for item in types
					if pattern and !pattern.test(item:value)
						continue
					<Radio name='type' tabindex=1 value=item:value label=item:title desc=item:desc>

	def value
		var checked = dom.querySelector('input:checked')
		checked and checked:value or null

	def onchange e
		log 'onchange',e
		render
		self

Imba.mount <App[state].root ->
	<header#header>
		<input type="number" model.number='count'>
		<span.flex> "todos"
		<button :tap.reset> "reset"
		<Stepper> "step"
		<button.primary :tap.run disabled=(state:bench)> "Run benchmark"
	<div>

tag Custom
	def render
		@items = ["a","b","c"]
		@k = 0
		<self>
			for item in @items
				<div@{@k++}> item

tag Cache
	def render
		<self> <@body :tap=(|e| title )>
		
tag NoCache
	def render arg
		<self> <@body :tap=(|e| arg )>
tag View	
	def render
		<self>
			<div.view>
				<label :dblclick='edit'> "{@data:title}"
				<input.toggle type='checkbox' model='completed'>
				<button.destroy :tap='drop'>
			<input.edit type='text'>
			

tag SimpleView
	def render
		<self>
			<div.view>
				<h1> "Hello there"
				<label :dblclick='edit'> "hello"
				<button.destroy :tap='drop'>
			<input.edit type='text'>

tag ComplicatedView
	def render
		<self>
			if true
				<div>
					<div.view>
						<h1> "Hello there {@data:title}"
						<label :dblclick='edit'> "hello"
						<button.destroy :tap='drop'>
			<input.edit type='text'>

tag WithDynamicInner
	def render
		<self>
			<div>
				<div> "" + dynamic
				<div> <div> "Other"
			<div>	
			
tag WithLoop
	def render
		<self>
			<div>
				<div> "" + dynamic
				<div>
					for todo in items
						<Todo[todo]@{todo:id}>
				<div>
					<div> "Other"
			<div>
	
	def render2
		<self>
			<div>
				<div> "" + dynamic
				<div>
					for todo in items
						<div>
							<span> todo
				<div>
					<div> "Other"
			<div>
		

tag Todo < li
	
	def render
		# var todo = @data
		<self .completed=(@data:completed) >
			<div.view>
				<label :dblclick='edit'> "{@data:title}"
				<input.toggle type='checkbox' model='completed'>
				<button.destroy :tap='drop'>
			<input@input.edit type='text' :keydown.enter.submit :keydown.esc.cancel>

	def edit
		flag('editing')
		@input.value = data:title
		setTimeout(&,10) do @input.focus

	def drop
		api.removeTodo(data)

	def submit
		unflag('editing')
		(data:title = @input.value.trim) || drop

	def onfocusout e
		submit if hasFlag('editing')

	def cancel
		unflag('editing')
		@input.blur

tag App
	def addItem
		if data:newTodo
			api.addTodo(data:newTodo)
			data:newTodo = ""

	def clearCompleted
		api.clearCompleted
		
	def mount
		window.addEventListener('hashchange') do
			@route = window:location:hash

	def render
		var all    = data:todos
		var items  = all
		var done   = []
		var active = []

		for todo in all
			todo:completed ? done.push(todo) : active.push(todo)

		if @route == '#/completed'
			items = done

		elif @route == '#/active'
			items = active

		<self>
			<header.header>
				<h1> "{@data:counter}"
				<input.new-todo
					type='text'
					placeholder='What to do?'
					autofocus=true
					model.trim='newTodo'
					:keyup.enter='addItem'>
			
			if all:length > 0
				<section.main>
					<ul.todo-list>
						for todo in items
							<Todo[todo]@{todo:id}>
				<footer.footer>
					<span.todo-count>
						<strong> "{active:length} "
						<span> active:length == 1 ? 'item left' : 'items left'
					<ul.filters>
						<li> <a .selected=(items == all)    href='#/'> "All"
						<li> <a .selected=(items == active) href='#/active'> "Active"
						<li> <a .selected=(items == done)   href='#/completed'> "Completed"
					if done:length > 0
						<button.clear-completed :tap='clearCompleted'> 'Clear completed'


	
Imba.mount <App[state].root ->
	<header#header>
		<input type="number" model.number='count'>
		<span.flex> "todos"
		# <select model.number='ins'>
		# 	<option value=0> 'none'
		# 	<option value=1> 'random'
		# 	<option value=2> 'push'
		# 	<option value=3> 'unshift'
		
		# <select model.number='rem'>
		# 	<option value=1> 'random'
		# 	<option value=2> 'pop'
		# 	<option value=3> 'shift'
		<button :tap.reset> "reset"
		<Stepper> "step"
		<button.primary :tap.run disabled=(state:bench)> "Run benchmark"

	<section.apps> for app in apps
		<div[app].app css:color=app:color>
			<header> String(app:bm or app:name) # ? String(app:bm) : @status
			<AppFrame[app] src="apps/{app:path}" css:minHeight='340px'>
			<footer>
				if app:api and app:api:mutations
					<div.muts>
						<span.value> app:api:mutations
						<i> "muts"
				if app:bm and data:fastest
					<div.ops>
						<span.value> Math.round(app:bm:hz)
						<i> "ops/sec"
					if app:bm == data:fastest
						<div.small.compare> <span> "baseline"
					elif app:bm:hz < data:fastest:hz
						<div.small.compare.slower>
							<span.x.s> (data:fastest:hz / app:bm:hz).toFixed(2) + 'x'
							<i> "slower"
				<div.small.size>
					<i> 'library'
					<span.value> app:libSize