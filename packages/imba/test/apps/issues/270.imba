tag app-component

	get name
		nodeName.toLowerCase().substr(4)

	def log val
		console.info "{name}.{val}"
		# console.log "{name}.{val}"

	def mount
		log 'mount'

	def mounted
		log 'mounted'

	def awaken
		# log 'awaken'
		super

tag app-item < app-component
	prop ripple

	def mount
		console.log "item.mount"
		console.log 'mount?',ripple,children[0],parentNode
		super
		global.eq ripple, true
		global.ok children[0] isa HTMLSpanElement

	def render
		console.log "item.render"
		<self>
			<span> "hello"
			<slot>
			<app-sub>
			if #mounted
				<app-late>

tag app-sub < app-component
	def render
		<self>

tag app-late < app-component
	def render
		<self>

tag app-root < app-component
	def mount
		log 'mount'
		console.log 'root mount',children[0]
		global.ok children[0] isa HTMLDivElement

	def render
		console.log "root.render"
		<self>
			<div>
				<app-item ripple=true> <p> 'Child'

let expect = [
	'root.mount',
	'item.mount',
	# 'late.mount',
	'sub.mount',
	'sub.mounted',
	# 'late.mounted',
	'item.mounted',
	'root.mounted'
]

test "mount" do
	imba.mount(<app-root>)
	# await null
	# console.log $1.log.slice(0),expect
	# eq $1.log, expect

test "manual" do |state|
	let el = document.createElement('app-root')
	# el.render()
	document.body.appendChild(el)
	await null
	console.log $1.log.slice(0),expect
	# eq $1.log, expect
	# await spec.tick()
	# console.log $1

# test "conditional" do
# 	let el = document.createElement('app-root-if')
# 	document.body.appendChild(el)
# 	el.render()
# 	el.expand = true
# 	el.render()
