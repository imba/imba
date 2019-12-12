var name = "John Doe"

tag app-root

	def ping e
		console.info("{e.detail.start},{e.detail.start}")
		# console.log "event",event

	def log ...args
		console.info(args)

	def render
		<self :hello.log($type,$detail)>
			# $ refers to the event itself
			
			<div.a :click.log($)> 'A'

			# $identifier refers to event[identifier]
			<div.b :click.log($type)> 'Event type'

			<div.c :click.trigger('hello','test')> 'Trigger custom'

imba.mount(<app-root>)

var click = do |state,sel,expect|
	state.log = []
	await spec.click(sel,no)
	eq(state.log.join(","),expect)

test "$" do
	await click($1,'.a','[object MouseEvent]')

test "$type" do
	await click($1,'.b','click')

test "$detail" do
	await click($1,'.c','hello,test')
