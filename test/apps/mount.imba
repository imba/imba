
tag nested-item
	def mount
		console.info @staticprop
		console.log "mounted nested-item",@staticprop,@dynamicprop

tag app-root

	def mount
		console.log "mounted app-root"
		console.info 'root'

	def render
		<self>
			<div>
				<nested-item staticprop=1 dynamicprop=Math.random()>
					<p> 'Child'

test "mount" do
	imba.mount(<app-root>)
	await spec.tick()
	eq $1.log.join(','),'root,1'
