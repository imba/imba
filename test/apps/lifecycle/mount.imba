let mounts = 0
let unmounts = 0

tag app-component

	get name
		nodeName.toLowerCase().substr(4)

	def log val
		console.info "{name}.{val}"
		# console.log "{@name}.{val}"

	def mount
		log 'mount'
		mounts++

	def mounted
		log 'mounted'

	def awaken
		# @log 'awaken'
		super


tag app-item < app-component
	prop ripple

	def mount
		console.log "item.mount"
		console.log 'mount?',ripple,children[0],parentNode
		super
		global.eq ripple, true
		global.ok children[0] isa HTMLSpanElement

		# the late item will be force included inside mounted now
		# #mounted = yes
		# this.render()

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
		super
		global.ok children[0] isa HTMLDivElement

	def render
		console.log "root.render"
		<self>
			<div>
				<app-item ripple=true> <p> 'Child'

tag app-root-if < app-component
	prop expand = no
	def render
		<self>
			<div>
				if expand
					<app-item ripple=true> <p> 'Child'

let expect = [
	'root.mount',
	'item.mount',
	'sub.mount'
]

test "mount" do
	imba.mount(<app-root>)
	await imba.commit!
	# console.log $1.log.slice(0),expect
	eq $1.log, expect

	# await spec.tick()
	# console.log $1.log.slice(0),expect

test "manual" do(state)
	mounts = 0
	let el = document.createElement('app-root')
	document.body.appendChild(el)
	await Promise.resolve(yes)
	# to make sure elements are mounted in correct order
	# we do not guarantee that the mount is synchronous
	eq mounts, 3
	# await null
	# console.log $1.log.slice(0),expect
	# eq $1.log, expect
	# await spec.tick()
	# console.log $1


# test "conditional" do
# 	let el = document.createElement('app-root-if')
# 	document.body.appendChild(el)
# 	el.render()
# 	el.expand = true
# 	el.render()
